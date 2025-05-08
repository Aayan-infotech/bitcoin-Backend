const express = require("express");
const router = express.Router();
const deviceTokenController = require("../controllers/deviceTokencontroller");
const { auth } = require("../middlewares/authMiddleware");

router.post("/save-device-token",auth, deviceTokenController.registerOrUpdateDeviceToken);


router.get("/get-device-token", deviceTokenController.getDeviceTokenByUserId);

router.get("/get-device-tokens", deviceTokenController.getAllDeviceTokens);
router.delete("/device-token/:userId", deviceTokenController.removeDeviceToken);

module.exports = router;
