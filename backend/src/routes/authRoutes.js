// src/routes/authRoutes.js
const express = require("express");
const authController = require("../controllers/authController");
const requireDeviceTempToken = require("../middlewares/requireDeviceTempToken");
const requireSignupToken = require("../middlewares/requireSignupToken");
const validate = require("../middlewares/validate");
const schemas = require("../validators/authSchemas");
const requireResetToken = require("../middlewares/requireResetToken");

const router = express.Router();

router.post("/signup/step1", validate(schemas.signupStep1Schema), authController.signupStep1);

// Step2 + Verify لازم Token
router.post(
  "/signup/step2",
  requireSignupToken,
  validate(schemas.signupStep2Schema),
  authController.signupStep2
);

router.post(
  "/signup/verify",
  requireSignupToken,
  validate(schemas.verifySchema),
  authController.verifySignup
);
router.post("/login", validate(schemas.loginSchema), authController.login);

router.post(
  "/confirm-device",
  requireDeviceTempToken,
  validate(schemas.confirmDeviceSchema),
  authController.confirmDevice
);

router.post(
  "/forgot-password",
  validate(schemas.forgotPasswordRequestSchema),
  authController.forgotPasswordRequest
);

router.post(
  "/forgot-password/reset",
  requireResetToken,
  validate(schemas.forgotPasswordResetSchema),
  authController.forgotPasswordReset
);

module.exports = router;
