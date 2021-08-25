const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const config = require("../Config/local");
const base64url = require("base64url");
const { nanoid } = require("nanoid");

const logger = require("../Util/logger");
let { Users, Organization, Audit, Application } = require("../Schema/Schema");
const {
  generateAttestationOptions,
  verifyAttestationResponse,
  generateAssertionOptions,
  verifyAssertionResponse,
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

router.post("/registerOrg", async (req, res) => {
  let { username, uniqueId } = req.body;
  if (!username)
    return res
      .status(400)
      .json({ errorCode: -1, errorMessage: "Username can't be empty !!" });

  if (!uniqueId) uniqueId = nanoid(20);

  let org = await Organization.findOne({ username });
  if (org)
    return res.status(400).json({
      errorCode: -1,
      errorMessage: "Username Already Exist!!",
      id: org.uniqueId,
    });

  const data = {
    username,
    uniqueId,
  };

  try {
    org = await Organization.create({ ...data });
    const opts = {
      rpName: config.rpName,
      rpID: config.rpID,
      userID: uniqueId,
      userName: username,
      timeout: 60000,
      attestationType: "direct",
      excludeCredentials: org.devices.map((dev) => ({
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
    return res.status(201).send({ ...options, uniqueId });
  } catch (error) {
    return res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.post("/verify-registerorg-attestation", async (req, res) => {
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

  const org = await Organization.findOne({ username });
  if (!org) {
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

    verification = await verifyAttestationResponse(opts);

    const { verified, attestationInfo } = verification;

    if (!verified) {
      return res.status(400).json({ verified });
    }
    const { credentialPublicKey, credentialID, counter, fmt } = attestationInfo;
    logger.info("user have registerd using platform : " + fmt);

    const existingDevice = org.devices.find(
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
      org.devices.push(newDevice);
      org.registered === true;

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
    let { userId, appId ,credentialID} = req.body;
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

      user.devices.length = 0
      user.devices = newDevice
      user = await user.save();
    
      
      return res.status(201).json({ errorCode: 0, errorMessage: "Device Removed Successfully !!" });

    
  } catch (error) {
    return res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
});

router.get("/getAllRegisteredDevices/:userId",async (req,res) =>{
  const {userId} = req.params
  try{

    let user = await Users.findOne({userId});
    if (!user)
    return res.status(404).json({
      errorCode: -1,
      errorMessage: "User Doesn't Exist !!",
    });

    res.status(200).json({...user.devices})
  }
  catch (error) {
    return res.status(500).json({ errorCode: -1, errorMessage: error.message });
  }
})

module.exports = router;
