// src/utils/jwt.js
const jwt = require("jsonwebtoken");

const mustGetSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing in .env");
  return secret;
};

const signSignupToken = (userId, step = 1) => {
  return jwt.sign(
    { userId: String(userId), purpose: "signup", step },
    mustGetSecret(),
    { expiresIn: process.env.SIGNUP_JWT_EXPIRES_IN || "15m" }
  );
};

const signAuthToken = (userId) => {
  return jwt.sign(
    { userId: String(userId), purpose: "auth" },
    mustGetSecret(),
    { expiresIn: process.env.AUTH_JWT_EXPIRES_IN || "1h" }
  );
};

const signDeviceTempToken = (userId, deviceId) => {
  return jwt.sign(
    { userId: String(userId), purpose: "device_confirm", deviceId },
    mustGetSecret(),
    { expiresIn: process.env.DEVICE_TEMP_EXPIRES_IN || "10m" }
  );
};

// Forgot Password Reset Token
const signResetToken = (userId, step = 1) => {
  return jwt.sign(
    { userId: String(userId), purpose: "reset", step },
    mustGetSecret(),
    { expiresIn: process.env.RESET_JWT_EXPIRES_IN || "10m" }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, mustGetSecret());
};

module.exports = {
  signSignupToken,
  signAuthToken,
  signDeviceTempToken,
  signResetToken, 
  verifyToken,
};
