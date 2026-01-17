const express = require("express");
const settingsController = require("../controllers/settings.controller");
const validate = require("../middlewares/validate");
const v = require("../validators/settings.validation");

const requireAuthToken = require("../middlewares/requireAuthToken");

const router = express.Router();

// fixed questions
router.get("/security-questions", settingsController.getSecurityQuestions);

// my account
router.get("/me", requireAuthToken, settingsController.getMe);
router.patch("/me", requireAuthToken, validate(v.updateMeSchema), settingsController.updateMe);

// password
router.patch("/password", requireAuthToken, validate(v.changePasswordSchema), settingsController.changePassword);

// security question
router.patch(
  "/security-question",
  requireAuthToken,
  validate(v.updateSecurityQuestionSchema),
  settingsController.updateSecurityQuestion
);

// devices
router.get("/devices", requireAuthToken, settingsController.listDevices);
router.patch("/devices/:deviceId", requireAuthToken, validate(v.updateDeviceNameSchema), settingsController.renameDevice);
router.delete("/devices/:deviceId", requireAuthToken, settingsController.removeDevice);
router.delete("/devices", requireAuthToken, settingsController.removeAllDevices);

module.exports = router;
    