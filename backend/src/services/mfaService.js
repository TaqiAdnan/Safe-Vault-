const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const User = require("../models/User");

const sanitizeSetup = async (otpauth_url) => {
  const qrDataUrl = await QRCode.toDataURL(otpauth_url);
  return { otpauthUrl: otpauth_url, qrDataUrl };
};

// 1) Generate secret + QR (requires auth token)
exports.setupTotp = async (userId) => {
  const user = await User.findById(userId).select("_id email mfaEnabled mfaTotpSecret");
  if (!user) return { status: 404, body: { message: "User not found" } };

  if (user.mfaEnabled) {
    return { status: 400, body: { message: "MFA already enabled", code: "MFA_ALREADY_ENABLED" } };
  }

  const secret = speakeasy.generateSecret({
    name: `SafeVault (${user.email})`, 
  });

  user.mfaTotpSecret = secret.base32;
  await user.save();

  const payload = await sanitizeSetup(secret.otpauth_url);

  return {
    status: 200,
    body: {
      message: "Scan QR using Google Authenticator",
      ...payload, // { otpauthUrl, qrDataUrl }
    },
  };
};

// 2) Verify code and enable MFA (requires auth token)
exports.enableTotp = async (userId, { code }) => {
  const user = await User.findById(userId).select("_id mfaEnabled mfaTotpSecret");
  if (!user) return { status: 404, body: { message: "User not found" } };

  if (!user.mfaTotpSecret) {
    return { status: 400, body: { message: "MFA setup not started", code: "MFA_NOT_SETUP" } };
  }

  const ok = speakeasy.totp.verify({
    secret: user.mfaTotpSecret,
    encoding: "base32",
    token: String(code || ""),
    window: 1, 
  });

  if (!ok) return { status: 400, body: { message: "Invalid code", code: "MFA_CODE_INVALID" } };

  user.mfaEnabled = true;
  user.mfaVerifiedAt = new Date();
  await user.save();

  return { status: 200, body: { message: "MFA enabled successfully" } };
};

// 3) Verify during login (requires mfa_login token)
exports.verifyMfaLogin = async (userId, { code }) => {
  const user = await User.findById(userId).select("_id status isVerified mfaEnabled mfaTotpSecret");
  if (!user) return { status: 404, body: { message: "User not found" } };

  if (user.status !== "ACTIVE" || user.isVerified !== true) {
    return { status: 403, body: { message: "Account not active", code: "ACCOUNT_NOT_ACTIVE" } };
  }

  if (!user.mfaEnabled || !user.mfaTotpSecret) {
    return { status: 400, body: { message: "MFA not enabled", code: "MFA_NOT_ENABLED" } };
  }

  const ok = speakeasy.totp.verify({
    secret: user.mfaTotpSecret,
    encoding: "base32",
    token: String(code || ""),
    window: 1,
  });

  if (!ok) return { status: 400, body: { message: "Invalid code", code: "MFA_CODE_INVALID" } };

  return { status: 200, body: { message: "MFA verified" } };
};

exports.disableTotp = async (userId) => {
  const user = await User.findById(userId).select("_id mfaEnabled");
  if (!user) return { status: 404, body: { message: "User not found" } };

  user.mfaEnabled = false;
  user.mfaTotpSecret = null;
  user.mfaVerifiedAt = null;
  await user.save();

  return { status: 200, body: { message: "MFA disabled" } };
};
