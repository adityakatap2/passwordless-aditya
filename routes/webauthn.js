const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const config = require("../Config/local");
const base64url = require("base64url");
const { nanoid, customAlphabet } = require("nanoid");
const jwt = require("jsonwebtoken");
const { snakeCase } = require("snake-case");
const { sendMail } = require("../Util/SendMail");
const QRcode = require("qrcode");

const logger = require("../Util/logger");
let {
  Users,
  Organization,
  Audit,
  Application,
  Token,
  Operators,
} = require("../Schema/Schema");
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require("@simplewebauthn/server");
const db = config.mongoURI;
mongoose
  .connect(db, {
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
  res.send("hello programmer, Your APIs are Live !!");
});

router.post("/registerOperator", async (req, res) => {
  try {
    let { username, uniqueId, name } = req.body;

    if (!username || !name)
      return res
        .status(400)
        .json({ errorCode: -1, errorMessage: "Username can't be empty !!" });

    let userId = nanoid(24);

    let operator = await Operators.findOne({ username });
    if (operator && operator.registered)
      return res.status(400).json({
        errorCode: -1,
        errorMessage: "Username Already Exist!!",
        id: operator.userId,
      });

    if (!uniqueId) {
      uniqueId = nanoid(20);
      await Organization.create({ uniqueId });
    }

    const data = {
      username,
      uniqueId,
      name,
      userId,
    };

    operator = await Operators.create({ ...data });

    const opts = {
      rpName: config.rpName,
      rpID: config.rpID,
      userID: userId,
      userName: username,
      timeout: 60000,
      attestationType: "direct",
      excludeCredentials: operator.devices.map((dev) => ({
        id: dev.credentialID,
        type: "public-key",
        transports: ["ble", "internal"],
      })),
      authenticatorSelection: {
        userVerification: "preferred",
        requireResidentKey: true,
      },
    };

    const options = generateRegistrationOptions(opts);
    return res.status(201).send({ ...options });
  } catch (error) {
    return res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.post("/verify-registerOperator-attestation", async (req, res) => {
  const { username } = req.body;
  if (!username)
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Username missing" });
  const expectedChallenge = req.body.challenge;
  if (!expectedChallenge)
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Challenge is missing" });

  const operator = await Operators.findOne({ username });
  if (!operator) {
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Invalid username !!" });
  }

  let verification;
  try {
    const opts = {
      credential: req.body.credential,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin: config.origin,
      expectedRPID: config.rpID,
    };

    verification = await verifyRegistrationResponse(opts);
    console.log("verfication", verification);

    const { verified, registrationInfo: attestationInfo } = verification;

    if (!verified) {
      return res.status(400).json({ verified });
    }
    const { credentialPublicKey, credentialID, counter, fmt } = attestationInfo;
    logger.info("user have registerd using platform : " + fmt);

    const existingDevice = operator.devices.find(
      (device) => device.credentialID === base64url.encode(credentialID)
    );

    if (!existingDevice) {
      logger.info("Adding New Device credentials to user DB");

      const newDevice = {
        credentialPublicKey: base64url.encode(credentialPublicKey),
        credentialID: base64url.encode(credentialID),
        counter,
        fmt,
      };
      operator.devices.push(newDevice);
      operator.registered = true;

      await operator.save();
    }

    logger.info(`Registration Status for username ${username} is ${verified}`);

    return res.status(201).send({
      userId: operator.userId,
      uniqueId: operator.uniqueId,
      email: operator.username,
      name: operator.name,
      verified,
    });
  } catch (error) {
    logger.error("Error while Verifying Attestation Details");
    logger.error(error.message);
    return res.status(400).send({ errorCode: -1, errorMessage: error.message });
  }
});

router.post("/loginOperator", async (req, res) => {
  console.log(req);
  let { username } = req.body;
  try {
    if (!username)
      return res
        .status(400)
        .json({ errorCode: -1, errorMessage: "Username can't be empty !!" });

    let user = await Operators.findOne({ username });

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
      rpID: config.rpID,
    };

    const options = generateAuthenticationOptions(opts);
    return res.status(201).send({ ...options });
  } catch (error) {
    return res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.post("/verify-loginOperator-assertion", async (req, res) => {
  try {
    const { username, id, challenge } = req.body;
    if (!username)
      return res
        .status(404)
        .json({ errorCode: -1, errorMessage: "Username missing" });
    const expectedChallenge = challenge;
    if (!expectedChallenge)
      return res
        .status(404)
        .json({ errorCode: -1, errorMessage: "Challenge is missing" });

    let user = await Operators.findOne({ username });
    if (!user) {
      return res
        .status(404)
        .json({ errorCode: -1, errorMessage: "Invalid username !!" });
    }

    let dbAuthenticator;

    for (const dev of user.devices) {
      if (dev.credentialID === id) {
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

    if (!dbAuthenticator) {
      throw new Error(`could not find authenticator matching ${id}`);
    }

    const opts = {
      credential: req.body,
      expectedChallenge: expectedChallenge,
      expectedOrigin: config.origin,
      expectedRPID: config.rpId,
      authenticator: dbAuthenticator,
    };
    verification = verifyAuthenticationResponse(opts);

    const { verified, authenticationInfo: assertionInfo } = verification;

    if (!verified) {
      return res.status(400).json({
        errorCode: -1,
        errorMessage: "Authentication Failed !!",
      });
    }

    logger.info("updating Device counter");

    user = await Operators.updateOne(
      { "devices.credentialID": id },
      {
        $set: {
          "devices.$.counter": assertionInfo.newCounter,
          "devices.$.lastLogin": new Date(),
        },
      },
      { new: true }
    );

    logger.info(`Login Counter Updated to ${assertionInfo.newCounter}`);

    logger.info(`Assertion verification Response ${verified}`);
    return res.status(201).send({
      user,
      verified,
    });
  } catch (error) {
    return res.status(400).send({ errorMessage: error.message, errorCode: -1 });
  }
});


router.put("/updateOrg/:uniqueId",async (req,res) =>{
const {uniqueId} = req.params
try{

  let org = await Organization.findOne({uniqueId});
  if(!org)
  {
    return res.status(404).json({errorCode:-1,errorMessage:"Invalid UniqueId, Organization not found"})
  }

  const {subdomain,name} = req.body
  if(subdomain)
    org.subdomain = subdomain
  if(name)
    org.name = name
  await org.save();

  return res.status(201).json({errorCode:0,errorMessage:"organizations Details updated Successfully"});

}
catch(error){
  return res.status(500).send({ errorMessage: error.message, errorCode: -1 });
}

})

router.put("/updateOperator/:userId",async (req,res) =>{
  const {userId} = req.params
  try{
  
    let operator = await Operators.findOne({userId});
    if(!operator)
    {
      return res.status(404).json({errorCode:-1,errorMessage:"Invalid userId, Organization not found"})
    }
  

 operator.emailVerified = req.body.emailVerified || operator.emailVerified

 await operator.save();

  
    return res.status(201).json({errorCode:0,errorMessage:"User Details Updated Successfully"});
  
  }
  catch(error){
    return res.status(500).send({ errorMessage: error.message, errorCode: -1 });
  }

})

router.post("/createApp", async (req, res) => {
  let { name, origin, orgId } = req.body;

  try {
    if (!req.body || !name || !origin) {
      return res.status(400).json({
        errorCode: -1,
        errorMessage: "Name of Organization and its Orgin can't be empty",
      });
    }

    const appId = nanoid(32);

    const rpID = new URL(origin).hostname;
    origin = new URL(origin).origin;
    let org = await Application.create({
      name,
      origin,
      rpID,
      appId,
      orgId,
    });

    return res.status(200).json({ name, appId });
  } catch (error) {
    return res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.delete("/deleteApp/:appId", async (req, res) => {
  const { appId } = req.params;
  try {
    let app = await Application.findOneAndDelete({ appId });
    if (!app)
      return res.status(404).json({
        errorCode: -1,
        errorMessage: "No App Exist with this appId !!",
      });

    return res
      .status(200)
      .json({ errorCode: 0, errorMessage: "App Deleted Successfully !!" });
  } catch (error) {
    return res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.get("/getAllApplications/:orgId", async (req, res) => {
  const { orgId } = req.params;

  try {
    const apps = await Application.find({ orgId });

    return res.status(200).json(apps);
  } catch (error) {
    return res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.get("/getAllUsers/:orgId", async (req, res) => {
  const { appId } = req.params;
  try {
    const users = await Users.find({ orgId });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.post("/registerUser", async (req, res) => {
  let { username, appId } = req.body;
  if (!username || !appId)
    return res
      .status(400)
      .json({ errorCode: -1, errorMessage: "Username can't be empty !!" });

  let app = await Application.findOne({ appId });
  if (!app)
    return res.status(404).json({
      errorCode: -1,
      errorMessage: "No Application Associated with this appId !!",
    });

  let user = await Users.findOne({ username, appId });
  if (user && user.registered)
    return res.status(400).json({
      errorCode: -1,
      errorMessage: "User Already Exist !!",
    });

  const userId = nanoid(25);
  const data = {
    ...req.body,
    orgId: app.orgId,
    userId,
  };

  try {
    user = await Users.create({ ...data });
    const opts = {
      rpName: app.rpName,
      rpID: app.rpID,
      userID: userId,
      userName: username,
      timeout: 60000,
      attestationType: "direct",
      excludeCredentials: user.devices.map((dev) => ({
        id: dev.credentialID,
        type: "public-key",
        transports: ["ble", "internal"],
      })),
      authenticatorSelection: {
        userVerification: "preferred",
        requireResidentKey: true,
      },
    };

    const options = generateAttestationOptions(opts);
    return res.status(201).send({ ...options });
  } catch (error) {
    return res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.post("/verify-registerUser-attestation", async (req, res) => {
  const { username, appId } = req.body;
  if (!username || appId)
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Username or appId missing !!" });
  const expectedChallenge = req.body.challenge;
  if (!expectedChallenge)
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Challenge is missing" });

  const app = await Application.findOne({ appId });
  if (!app) {
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Invalid appId !!" });
  }

  let user = await Users.findOne({ username, appId });

  let verification;
  try {
    const opts = {
      credential: req.body.credential,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin: config.origin,
      expectedRPID: config.rpID,
    };

    verification = await verifyAttestationResponse(opts);

    const { verified, attestationInfo } = verification;

    if (!verified) {
      return res.status(400).json({ verified });
    }
    const { credentialPublicKey, credentialID, counter, fmt } = attestationInfo;
    logger.info("user have registerd using platform : " + fmt);

    const existingDevice = user.devices.find(
      (device) => device.credentialID === base64url.encode(credentialID)
    );

    console.log("existingDevice", existingDevice);

    if (!existingDevice) {
      logger.info("Adding New Device credentials to user DB");

      const newDevice = {
        credentialPublicKey: base64url.encode(credentialPublicKey),
        credentialID: base64url.encode(credentialID),
        counter,
        fmt,
      };
      user.devices.push(newDevice);
      user.registered = true;

      await org.save();
      logger.debug(user);
    }

    logger.info(`Registration Status for username ${username} is ${verified}`);

    return res.status(201).send({
      org,
      verified,
    });
  } catch (error) {
    logger.error("Error while Verifying Attestation Details");
    logger.error(error.message);
    return res.status(400).send({ errorCode: -1, errorMessage: error.message });
  }
});

router.put("/addDevice", async (req, res) => {
  try {
    let { userId, appId } = req.body;
    if (!userId || !appId)
      return res
        .status(400)
        .json({ errorCode: -1, errorMessage: "UserId can't be empty !!" });

    let app = await Application.findOne({ appId });
    if (!app)
      return res.status(404).json({
        errorCode: -1,
        errorMessage: "No Application Associated with this appId !!",
      });

    let user = await Organization.findOne({ userId, appId });
    if (!user)
      return res.status(404).json({
        errorCode: -1,
        errorMessage: "User Doesn't Exist !!",
      });

    if (user && user.suspended)
      return res.status(400).json({
        errorCode: -1,
        errorMessage: "Account Suspended !!",
      });

    const opts = {
      rpName: app.rpName,
      rpID: app.rpID,
      userID: userId,
      userName: user.username,
      timeout: 60000,
      attestationType: "direct",
      excludeCredentials: user.devices.map((dev) => ({
        id: dev.credentialID,
        type: "public-key",
        transports: ["ble", "internal"],
      })),
      authenticatorSelection: {
        userVerification: "preferred",
        requireResidentKey: true,
      },
    };

    const options = generateAttestationOptions(opts);
    return res.status(201).send({ ...options });
  } catch (error) {
    return res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.post("/removeDevice", async (req, res) => {
  try {
    let { userId, appId, credentialID } = req.body;
    if (!userId || !appId)
      return res
        .status(400)
        .json({ errorCode: -1, errorMessage: "userId can't be empty !!" });

    let app = await Application.findOne({ appId });
    if (!app)
      return res.status(404).json({
        errorCode: -1,
        errorMessage: "No Application Associated with this appId !!",
      });

    let user = await Users.findOne({ userId, appId });
    if (!user)
      return res.status(404).json({
        errorCode: -1,
        errorMessage: "User Doesn't Exist !!",
      });

    if (user.suspended)
      return res.status(400).json({
        errorCode: -1,
        errorMessage: "Account Suspended !!",
      });

    if (user.devices.length === 1)
      return res.status(500).json({
        errorCode: -1,
        errorMessage: "Can't remove device,Only 1 device is registered !!",
      });

    const newDevice = user.devices.filter(
      (device) => device.credentialID !== credentialID
    );

    user.devices.length = 0;
    user.devices = newDevice;
    user = await user.save();

    return res
      .status(201)
      .json({ errorCode: 0, errorMessage: "Device Removed Successfully !!" });
  } catch (error) {
    return res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.get("/getAllRegisteredDevices/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    let user = await Users.findOne({ userId });
    if (!user)
      return res.status(404).json({
        errorCode: -1,
        errorMessage: "User Doesn't Exist !!",
      });

    res.status(200).json({ ...user.devices });
  } catch (error) {
    return res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.post("/generateEmailToken", async (req, res) => {
  try {
    const data = req.body;

    const token = jwt.sign(
      {
        ...data,
      },
      config.secret,
      { expiresIn: "7d" }
    );

    const accessToken = nanoid(25);

    await Token.create({ accessToken, token });

    return res.status(201).json({ accessToken });
  } catch (error) {
    return res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.post("/verifyToken", async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken)
    return res
      .status(400)
      .json({ errorCode: -1, errorMessage: "Access token can't be empty !" });

  const data = await Token.findOne({ accessToken });
  if (!data)
    return res
      .status(404)
      .json({ errorCode: -1, errorMessage: "Invalid Access Token !" });

  const token = data.token;

  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err && err.name === "TokenExpiredError") {
      //await Token.deleteOne({ accessToken });
      return res
        .status(500)
        .json({ errorCode: -1, errorMessage: "Link Expired" });
    } else if (err)
      return res.status(500).json({ errorCode: -1, errorMessage: err.message });
    else {
      // await Token.deleteOne({ accessToken });
      return res.status(201).json({ ...decoded });
    }
  });
});

router.post("/createSubDomain", async (req, res) => {
  try {
    let { name } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ errorCode: -1, errorMessage: "name can't be empty !" });
    name = snakeCase(name);

    let org = await Organization.findOne({ subdomain });
    if (!org) {
      org.subdomain = name;
      await org.save();
      return res.status(201).json({ subdomain: name });
    }

    return res
      .status(500)
      .json({ errorCode: -1, errorMessage: "Sudomain Already Taken !!" });
  } catch (error) {
    return res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.get("/checkSubdomain/:subdomain", async (req, res) => {
  try {
    const { subdomain } = req.params;

   
    const excludedomains = ["home","app","admin","test"]

if(excludedomains.includes(subdomain) || subdomain.length < 5 ){
  return res
        .status(200)
        .json({ errorCode: 0});
    }


    let org = await Organization.findOne({ subdomain });
    if (!org) {
      return res
        .status(200)
        .json({ errorCode: -1, errorMessage: "Subdomain Not Found" });
    }

    return res.status(200).json({ errorCode: 0 });
  } catch (error) {
    return res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.post("/sendmail", async (req, res) => {
  console.log(req.body);
  const { sendTo, type } = req.body;
  if (!type || !sendTo)
    return res.status(400).json({
      errorCode: -1,
      errorMessage: "message,subject or sendTo can't be empty !!",
    });
  try {
    const info = await sendMail(req.body);
    console.log("Message sent: %s", info.messageId);

    res.status(201).json(info);
  } catch (error) {
    res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.post("/generateQrCode", async (req, res) => {
  console.log("generating qr");
  const data = req.body;
  data.serverUrl = "https://demov1.rif4u.com:4220";
  let url;

  const token = jwt.sign(data, config.secret, { expiresIn: "5m" });
  const accessToken = nanoid(36);

  await Token.create({ accessToken, token });

  if (data.platform === "web") url = `${data.path}/${accessToken}`;
  else {
    url = accessToken;
  }

  console.log(url);
  QRcode.toDataURL(url, function (err, url) {
    if (err) {
      return res.status(500).json({ err });
    } else {
      return res.status(201).json({ url });
    }
  });
});

module.exports = router;
