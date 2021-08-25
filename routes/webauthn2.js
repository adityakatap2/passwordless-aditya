const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const config = require("../Config/local");
const base64url = require("base64url");
const {nanoid} = require("nanoid");


const logger = require("../Util/logger");
let { Users, Organization, Audit } = require("../Schema/Schema");
const {
  generateAttestationOptions,
  verifyAttestationResponse,
  generateAssertionOptions,
  verifyAssertionResponse,
} = require("@simplewebauthn/server");
const db = config.mongoURI;
mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    logger.info("MongoDB connection Successfull");
  })
  .catch((error) => {
    logger.error(error);
  });

router.get("/", (req, res) => {
  res.send("hello programmer !!");
});

router.post("/generate-attestation-options", async (req, res) => {
  if (!req.body || !req.body.username || !req.body.clientId) {
    logger.error("Request missing username field!");
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Username Missing !!" });
  }

  req.body.appId = req.body.clientId;
  delete req.body["clientId"];
  //console.log(req.body)

  let { username } = req.body;

  let base64clientId = req.body.appId;
  appId = base64url.decode(base64clientId);
  //console.log(clientId);
  const org = await Organization.findOne({ _id: appId });

  //console.log(org);
  if (!org) {
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Client Is Not Registered !!" });
  }

  logger.info("Registration Process started for " + username);

  let user = await Users.findOne({
    username: username,
    appId: appId,
  });
  // if (user && user.registered) {
  //   logger.error(`Username ${username} already taken for App ${org.name}`);
  //   return res.status(400).json({
  //     errorMessage: `Username ${username} already taken for App ${org.name} !!`,
  //     errorCode: -1,
  //   });
  // }

  

  if (!user) {
    logger.info(`Creating new Entry in DB for user ${username}`);
    user = new Users({
      ...req.body,
      appId: appId,
    });
    await user.save();
  }

  // console.log(user);
  const opts = {
    rpName: org.name,
    rpID: org.rpID,
    userID: user.id,
    userName: username,
    timeout: 60000,
    attestationType: "direct",
    excludeCredentials: user.devices.map((dev) => ({
      id: dev.credentialID,
      type: "public-key",
      transports: ["ble", "internal"],
    })),
    authenticatorSelection: {
      userVerification: "required",
      requireResidentKey: true,
    },
  };

  const options = generateAttestationOptions(opts);
  logger.info("Attestation options generated");
  req.session.challenge = options.challenge;
  //console.log(options);
  return res.status(201).send(options);
  ////console.log(options)
});

router.post("/verify-attestation", async (req, res) => {
  const { body } = req;
  logger.info("Verfication of Attestation started");
  const username = body.username;
  if (!username)
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Username missing" });
  const expectedChallenge = body.challenge;
  if (!expectedChallenge)
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Challenge is missing" });
  let base64clientId = req.body.clientId;
  clientId = base64url.decode(base64clientId);
  //console.log(clientId);
  const org = await Organization.findOne({ _id: clientId });
  if (!org) {
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Invalid Client ID" });
  }

  //console.log(clientId)
  let user = await Users.findOne({
    username: username,
    appId: clientId,
  });

  //console.log(user)

  let verification;
  try {
    const opts = {
      credential: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin: org.origin,
      expectedRPID: org.rpID,
    };

    verification = await verifyAttestationResponse(opts);
  } catch (error) {
    logger.error("Error while Verifying Attestation Details");
    logger.error(error.message);
    return res.status(400).send({ errorCode: -1, errorMessage: error.message });
  }

  ////console.log(verification)
  ////console.log(CBOR.decodeAllSync(verification.attestationInfo.attestationObject))

  const { verified, attestationInfo } = verification;
  logger.debug({ attestationInfo });

  if (!verified) {
    return res.status(400).json({ ...user, verified });
  }
  const { credentialPublicKey, credentialID, counter, fmt } = attestationInfo;
  logger.info("user have registerd using platform : " + fmt);

  const existingDevice = user.devices.find(
    (device) => device.credentialID === credentialID
  );

  if (!existingDevice) {
    logger.info("Adding New Device credentials to user DB");

    const newDevice = {
      credentialPublicKey: base64url.encode(credentialPublicKey),
      credentialID: base64url.encode(credentialID),
      counter,
      fmt,
    };
    user.devices.push(newDevice);
    await user.save();
    logger.debug(user);
  }
  user = await Users.findOneAndUpdate(
    { username: username, appId: clientId },
    { registered: true },
    { upsert: true },
    (e) => {
      logger.info("Updating Registered Status in MongoDB");
      if (e) logger.error(e);
    }
  );

  logger.info(`Registration Status for username ${username} is ${verified}`);

  return res.status(201).send({
    user: user._doc,
    verified,
    application: { appId: base64clientId, appName: org.name },
  });
});

router.post("/generate-assertion-options", async (req, res) => {
  if (!req.body || !req.body.username) {
    logger.error("Request missing username field!");
    return res.status(404).json({
      errorCode: -1,
      errorMessage: "Missing username !!",
    });
  }

  let base64clientId = req.body.clientId;
  clientId = base64url.decode(base64clientId);
  //console.log(clientId);
  const org = await Organization.findOne({ _id: clientId });
  if (!org) {
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Invalid Client ID" });
  }

  const username = req.body.username;
  logger.info(`${username} started login Process.`);

  if (!username)
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Username missing" });

  let user = await Users.findOne({
    username: username,
    appId: clientId,
  });

  // if(!user.registered) logger.error(`No Device is registered for user ${username}`)
  if (!user || !user.registered) {
    return res.json({
      errorCode: -1,
      errorMessage: `Username ${username} is not Registered for FIDO2. Please do Registration first !!`,
    });
  }
  const opts = {
    timeout: 180000,
    allowCredentials: user.devices.map((dev) => ({
      id: base64url.toBuffer(dev.credentialID),
      type: "public-key",
      transports: ["internal"],
    })),
    userVerification: "required",
    rpID: org.rpID,
  };

  const options = generateAssertionOptions(opts);
  logger.info("Assestion options generated");
  logger.debug({ options });
  req.session.username = username;
  req.session.challenge = options.challenge;
  //console.log(options);
  res.send(options);
});

router.post("/verify-assertion", async (req, res) => {
  const body = req.body;
  //  //console.log(req.body)

  let authenticatorData = base64url.toBuffer(
    req.body.response.authenticatorData
  );
  let authrDataStruct = parseGetAssertAuthData(authenticatorData);
  ////console.log(authrDataStruct)

  const username = body.username;
  let base64clientId = req.body.clientId;
  clientId = base64url.decode(base64clientId);
  //console.log(clientId);
  const org = await Organization.findOne({ _id: clientId });
  if (!org) {
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Invalid Client ID" });
  }
  logger.info(`Verfication of Assertion started for username ${username} `);
  let user = await Users.findOne({
    username: username,
    appId: clientId,
  });

  if (!user) {
    res.status(404).json({
      errorCode: -1,
      errorMessage: `UserName ${username} is not registered for FIDO2`,
    });
  }
  const expectedChallenge = body.challenge;

  let dbAuthenticator;
  // "Query the DB" here for an authenticator matching `credentialID`
  for (const dev of user.devices) {
    if (dev.credentialID === body.id) {
      dbAuthenticator = {
        credentialPublicKey: base64url.toBuffer(dev.credentialPublicKey),
        credentialID: base64url.toBuffer(dev.credentialID),
        counter: dev.counter,
        transports: [],
      };
      break;
    }
  }
  let verification;
  try {
    if (!dbAuthenticator) {
      logger.error(`could not find authenticator matching ${body.id}`);
      throw new Error(`could not find authenticator matching ${body.id}`);
    }
    logger.debug({ dbAuthenticator });

    const opts = {
      credential: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin: org.origin,
      expectedRPID: org.rpID,
      authenticator: dbAuthenticator,
    };
    verification = verifyAssertionResponse(opts);
  } catch (error) {
    logger.error({ error: error.message });
    return res.status(400).send({ errorMessage: error.message, errorCode: -1 });
  }
  ////console.log(verification)
  const { verified, assertionInfo } = verification;

  if (!verified) {
    return res.status(400).json({
      errorCode: -1,
      errorMessage: "Authentication Failed !!",
    });
  }

  logger.info("updating Device counter");

  await Users.updateOne(
    { "devices.credentialID": body.id },
    {
      $set: {
        "devices.$.counter": assertionInfo.newCounter,
      },
    },
    { new: true },
    function (err) {
      if (err) logger.error(err);
    }
  );

  logger.info(`Login Counter Updated to ${assertionInfo.newCounter}`);

  logger.info(`Assertion verification Response ${verified}`);
  return res.status(201).send({
    user: user._doc,
    verified,
    application: { appName: org.name, appId: base64clientId },
  });
});

router.post("/verify-attestation-android", async (req, res) => {
  const { body } = req;
  body.id = base64url.encode(body.id);
  body.rawId = body.id;
  body.type = "public-key";
  //console.log(body.id);
  logger.info("Verfication of Attestation started from mobile");
  ////console.log("username from session "+req.session.username)
  const username = req.body.username;
  if (!username)
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Username missing" });
  const expectedChallenge = req.body.challenge;
  if (!expectedChallenge)
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Challenge is missing" });

  let base64clientId = req.body.clientId;
  if (!base64clientId)
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "clientId is missing" });
  clientId = base64url.decode(base64clientId);
  //console.log(clientId);
  const org = await Organization.findOne({ _id: clientId });
  if (!org) {
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Invalid Client ID" });
  }
  let user = await Users.findOne({
    username: username,
    appId: clientId,
  });

  //  "android:apk-key-hash:9y_1S9ZBSC5DQHv-53lVzhXBx2hduuipycYKneXdX30"

  let verification;
  try {
    const opts = {
      credential: body,
      expectedChallenge: base64url.encode(expectedChallenge),
      expectedOrigin: org.apkHashKey,
      expectedRPID: org.rpID,
    };
    verification = await verifyAttestationResponse(opts);
  } catch (error) {
    logger.error("Error while Verifying Attestation Details");
    logger.error(error.message);
    return res.status(400).send({ errorCode: -1, errorMessage: error.message });
  }

  const { verified, attestationInfo } = verification;
  logger.debug({ attestationInfo });

  if (!verified) {
    return res.status(400).json({ ...user, verified });
  }

  const { credentialPublicKey, credentialID, counter, fmt } = attestationInfo;
  logger.info("user have registerd using platform : " + fmt);

  const existingDevice = user.devices.find(
    (device) => device.credentialID === credentialID
  );

  if (!existingDevice) {
    logger.info("Adding New Device credentials to user DB");

    const newDevice = {
      credentialPublicKey: base64url.encode(credentialPublicKey),
      credentialID: base64url.encode(credentialID),
      counter,
      fmt,
    };
    user.devices.push(newDevice);
    await user.save();
    logger.debug(user);
  }
  Users.findOneAndUpdate(
    { username: username, appId: clientId },
    { registered: true },
    { upsert: true },
    (e) => {
      logger.info("Updating Registered Status in MongoDB");
      if (e) logger.error(e);
    }
  );

  logger.info(`Registration Status for username ${username} is ${verified}`);

  return res.status(201).send({
    user: user._doc,
    verified,
    application: { appId: base64clientId, appName: org.name },
  });
});

router.post("/verify-assertion-android", async (req, res) => {
  const body = req.body;
  const username = body.username;
  body.id = base64url.encode(base64url.toBuffer(body.id));

  body.rawId = body.id;
  body.type = "public-key";
  body.response.authenticatorData = base64url.encode(
    base64url.toBuffer(req.body.response.authenticatorData)
  );
  body.response.signature = base64url.encode(
    base64url.toBuffer(req.body.response.signature)
  );

  let base64clientId = req.body.clientId;
  clientId = base64url.decode(base64clientId);
  //console.log(clientId);
  const org = await Organization.findOne({ _id: clientId });
  if (!org) {
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Invalid Client ID" });
  }
  logger.info(`Verfication of Assertion started for username ${username} `);
  let user = await Users.findOne({
    username: username,
    appId: clientId,
  });

  if (!user) {
    res.status(404).json({
      errorCode: -1,
      errorMessage: `UserName ${username} is not registered for FIDO2`,
    });
  }
  const expectedChallenge = body.challenge;

  //console.log(req.body);
  //console.log("verifying details");
  let dbAuthenticator;
  // "Query the DB" here for an authenticator matching `credentialID`
  for (const dev of user.devices) {
    if (dev.credentialID === body.id) {
      dbAuthenticator = {
        credentialPublicKey: base64url.toBuffer(dev.credentialPublicKey),
        credentialID: base64url.toBuffer(dev.credentialID),
        counter: dev.counter,
        transports: [],
      };
      break;
    }
  }
  let verification;
  try {
    if (!dbAuthenticator) {
      logger.error(`could not find authenticator matching ${body.id}`);
      throw new Error(`could not find authenticator matching ${body.id}`);
    }
    // //console.log(dbAuthenticator)

    const opts = {
      credential: body,
      expectedChallenge: base64url.encode(expectedChallenge),
      expectedOrigin: org.apkHashKey,
      expectedRPID: org.rpID,
      authenticator: dbAuthenticator,
    };
    verification = verifyAssertionResponse(opts);
  } catch (error) {
    return res.status(400).send({ errorMessage: error.message, errorCode: -1 });
  }
  ////console.log(verification)
  const { verified, assertionInfo } = verification;
  // //console.log(assertionInfo);

  if (!verified) {
    return res.status(400).json({
      errorCode: -1,
      errorMessage: "Authentication Failed !!",
    });
  }

  logger.info("updating Device counter");

  await Users.updateOne(
    { "devices.credentialID": body.id },
    {
      $set: {
        "devices.$.counter": assertionInfo.newCounter,
      },
    },
    { new: true },
    function (err) {
      if (err) console.log(err);
    }
  );

  logger.info(`Login Counter Updated to ${assertionInfo.newCounter}`);

  logger.info(`Assertion verification Response ${verified}`);
  return res.status(201).send({
    user: user._doc,
    verified,
    application: { appName: org.name, appId: base64clientId },
  });
});



router.post("/verify-attestation-ios", async (req, res) => {
  const { body } = req;
  logger.info("Verfication of Attestation started");
  const username = body.username;
  body.id = base64url.encode(base64url.toBuffer(body.id));
  body.rawId = body.id;
  if (!username)
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Username missing" });
  const expectedChallenge = base64url.encode(body.challenge);
  if (!expectedChallenge)
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Challenge is missing" });
  let base64clientId = req.body.clientId;
  clientId = base64url.decode(base64clientId);
  //console.log(clientId);
  const org = await Organization.findOne({ _id: clientId });
  if (!org) {
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Invalid Client ID" });
  }
  let user = await Users.findOne({
    username: username,
    appId: clientId,
  });

  let verification;
  try {
    const opts = {
      credential: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin: org.origin,
      expectedRPID: org.rpID,
    };

    verification = await verifyAttestationResponse(opts);
  } catch (error) {
    logger.error("Error while Verifying Attestation Details");
    logger.error(error.message);
    return res.status(400).send({ errorCode: -1, errorMessage: error.message });
  }

  ////console.log(verification)
  ////console.log(CBOR.decodeAllSync(verification.attestationInfo.attestationObject))

  const { verified, attestationInfo } = verification;
  logger.debug({ attestationInfo });

  if (!verified) {
    return res.status(400).json({ ...user, verified });
  }
  const { credentialPublicKey, credentialID, counter, fmt } = attestationInfo;
  logger.info("user have registerd using platform : " + fmt);

  const existingDevice = user.devices.find(
    (device) => device.credentialID === credentialID
  );

  if (!existingDevice) {
    logger.info("Adding New Device credentials to user DB");

    const newDevice = {
      credentialPublicKey: base64url.encode(credentialPublicKey),
      credentialID: credentialID.toString("hex"),
      counter,
      fmt,
    };
    user.devices.push(newDevice);
    await user.save();
    logger.debug(user);
  }
  user = await Users.findOneAndUpdate(
    { username: username, appId: clientId },
    { registered: true },
    { upsert: true },
    (e) => {
      logger.info("Updating Registered Status in MongoDB");
      if (e) logger.error(e);
    }
  );

  logger.info(`Registration Status for username ${username} is ${verified}`);

  return res.status(201).send({
    user: user._doc,
    verified,
    application: { appId: base64clientId, appName: org.name },
  });
});

router.post("/verify-assertion-ios", async (req, res) => {
  const body = req.body;
  //  //console.log(req.body)

  let authenticatorData = base64url.toBuffer(
    req.body.response.authenticatorData
  );
  let authrDataStruct = parseGetAssertAuthData(authenticatorData);
  ////console.log(authrDataStruct)
  body.id = base64url.encode(base64url.toBuffer(body.id));
  ////console.log("id",body.id)
  body.rawId = body.id;
  const username = body.username;
  let base64clientId = req.body.clientId;
  clientId = base64url.decode(base64clientId);
  //console.log(clientId);
  const org = await Organization.findOne({ _id: clientId });
  if (!org) {
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Invalid Client ID" });
  }
  logger.info(`Verfication of Assertion started for username ${username} `);
  let user = await Users.findOne({
    username: username,
    appId: clientId,
  });

  if (!user) {
    res.status(404).json({
      errorCode: -1,
      errorMessage: `UserName ${username} is not registered for FIDO2`,
    });
  }
  const expectedChallenge = base64url.encode(body.challenge);
  let dbAuthenticator;

  for (const dev of user.devices) {
    const credId = base64url.encode(Buffer.from(dev.credentialID, "hex"));
    //console.log(credId);
    if (credId === body.id) {
      dbAuthenticator = {
        credentialPublicKey: base64url.toBuffer(dev.credentialPublicKey),
        credentialID: base64url.toBuffer(dev.credentialID),
        counter: dev.counter,
        transports: [],
      };
      break;
    }
  }
  let verification;
  try {
    if (!dbAuthenticator) {
      logger.error(`could not find authenticator matching ${body.id}`);
      throw new Error(`could not find authenticator matching ${body.id}`);
    }
    logger.debug({ dbAuthenticator });

    const opts = {
      credential: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin,
      expectedRPID: rpID,
      authenticator: dbAuthenticator,
    };
    verification = verifyAssertionResponse(opts);
  } catch (error) {
    logger.error({ error: error.message });
    return res.status(400).send({ errorMessage: error.message, errorCode: -1 });
  }
  ////console.log(verification)
  const { verified, assertionInfo } = verification;

  if (!verified) {
    return res.status(400).json({
      errorCode: -1,
      errorMessage: "Authentication Failed !!",
    });
  }

  logger.info("updating Device counter");

  await Users.updateOne(
    { "devices.credentialID": body.id },
    {
      $set: {
        "devices.$.counter": assertionInfo.newCounter,
      },
    },
    { new: true },
    function (err) {
      if (err) logger.error(err);
    }
  );

  logger.info(`Login Counter Updated to ${assertionInfo.newCounter}`);

  logger.info(`Assertion verification Response ${verified}`);
  return res.status(201).send({
    user: user._doc,
    verified,
    application: { appName: org.name, appId: base64clientId },
  });
});



router.post("/registerApp", async (req, res) => {
  const { name, origin } = req.body;

  if (!req.body || !name || !origin) {
    return res.status(404).json({
      errorCode: -1,
      errorMessage: "Name of Organization and its Orgin can't be empty",
    });
  }

  const rpID = new URL(origin).hostname;
  let org = await Organization.create({
    name,
    origin,
    rpID,
  });

  const data = {
    appId: base64url.encode(org._id.toString()),
    appName: org.name,
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
    origin: org.origin,
  };

  return res.status(200).json(data);
});

router.post("/checkUser", async (req, res) => {
  //console.log(req.body)
  let { username, clientId, type } = req.body;

  if (!req.body || !username || !clientId || !type)
    return res.status(404).json({
      errorCode: -1,
      errorMessage: "UserName,ClientID, Type can't be empty !!",
    });

  clientId = base64url.decode(clientId);
  const org = await Organization.findOne({ _id: clientId });

  if (!org) {
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Invalid Client ID" });
  }

  let user = await Users.findOne({
    username: username,
  });

  if (type === 1) {
    if (user && user.registered) {
      return res.status(400).json({
        errorMessage: `Username ${username} already exists !!`,
        errorCode: -1,
      });
    }

    //console.log("type1",user)

    return res.status(201).send({ errorCode: 0, origin: org.origin });
  }

  if (type === 2) {
    if (!user)
      return res.status(404).json({
        errorMessage: `Username ${username} is Not Registered , Please Do Resigration First !!`,
        errorCode: -1,
      });

    return res.status(201).send({ errorCode: 0, origin: org.origin });
  }
});

router.post("/audit", async (req, res) => {
  let { username, appId, data } = req.body;

  if (!username || !appId)
    res.status(400).json({
      errorCode: -1,
      errorMessage: "Username & AppID can't be empty !!",
    });

  appId = base64url.decode(appId);

  try {
    let user = await Audit.findOne({
      username: username,
      appId: appId,
    });

    if (!user) {
      user = await Audit.create({
        username,
        appId,
        Data: [data],
      });

      return res.status(201).json({ errorCode: 0, user });
    }

    user.Data.push(data);
    await user.save();
    return res.status(201).json({ errorCode: 0, user });
  } catch (error) {
    res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.get("/getAllAudits/:username/:appId", async (req, res) => {
  let { username, appId } = req.params;

  appId = base64url.decode(appId);
  try {
    let audit = await Audit.findOne({
      username: username,
      appId: appId,
    });

    if (!audit)
      return res.status(404).json({
        errorCode: -1,
        errorMessage: "No audits for this User is Available !!",
      });

    return res.status(200).json({ data: audit.Data });
  } catch (error) {
    res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.put("/addDevice", async (req, res) => {
  try {
    if (!req.body || !req.body.username) {
      logger.error("Request missing username field!");
      return res.status(404).json({
        errorCode: -1,
        errorMessage: "Missing username !!",
      });
    }

    let base64clientId = req.body.clientId;
    clientId = base64url.decode(base64clientId);
    const org = await Organization.findOne({ _id: clientId });

    if (!org) {
      return res
        .status(404)
        .json({ errorCode: -1, errorMessage: "Invalid Client ID" });
    }

    const username = req.body.username;

    let user = await Users.findOne({
      username: username,
      appId: clientId,
    });

    user.devices.push({ ...req.body.device });

    await user.save();

    return res
      .status(201)
      .json({ errorCode: 0, errorMessage: "Successfully Added Device !!" });
  } catch (error) {
    return res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

module.exports = router;
