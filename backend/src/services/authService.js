// src/services/authService.js
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { signSignupToken, signAuthToken } = require("../utils/jwt");
const { signDeviceTempToken } = require("../utils/jwt");
const { makeDeviceId, makeDeviceLabel } = require("../utils/device");
const { signResetToken } = require("../utils/jwt");

const getOtp = () => {
  if (process.env.NODE_ENV !== "production") {
    return process.env.FIXED_OTP || "123456";
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getOtpExpiryMinutes = () => {
  const m = Number(process.env.OTP_EXPIRES_MINUTES || 10);
  return Number.isFinite(m) && m > 0 ? m : 10;
};

const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  status: user.status,
  isVerified: user.isVerified,
});

exports.signupStep1 = async ({ fullName, email, password }) => {
  const existing = await User.findOne({ email }).select("_id status");
  if (existing && existing.status === "ACTIVE") {
    return { status: 409, body: { message: "Email already registered", code: "EMAIL_EXISTS" } };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.findOneAndUpdate(
    { email },
    { fullName, email, passwordHash, status: "PENDING", isVerified: false },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).select("_id fullName email status isVerified");

  return {
    status: 201,
    body: {
      message: "Step 1 completed",
      nextStep: 2,
      signupToken: signSignupToken(user._id, 1),
      user: sanitizeUser(user),
    },
  };
};

exports.signupStep2 = async (signup, { securityQuestion, securityAnswer }) => {
  if (!signup || !signup.userId) {
    return { status: 401, body: { message: "Missing signup token", code: "MISSING_SIGNUP_TOKEN" } };
  }

  const user = await User.findById(signup.userId).select("_id email status isVerified");
  if (!user) return { status: 404, body: { message: "Signup session not found", code: "SIGNUP_NOT_FOUND" } };
  if (user.status === "ACTIVE") return { status: 400, body: { message: "Account already active", code: "ALREADY_ACTIVE" } };

  const securityAnswerHash = await bcrypt.hash(securityAnswer, 10);

  const otp = getOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  const minutes = getOtpExpiryMinutes();
  const otpExpiresAt = new Date(Date.now() + minutes * 60 * 1000);

  user.securityQuestion = securityQuestion;
  user.securityAnswerHash = securityAnswerHash;
  user.otpHash = otpHash;
  user.otpExpiresAt = otpExpiresAt;
  await user.save();

  console.log("OTP for", user.email, "=>", otp);

  return {
    status: 200,
    body: {
      message: "Step 2 completed, verification code sent",
      nextStep: 3,
      signupToken: signSignupToken(user._id, 2),
      meta: {
        otpLength: 6,
        expiresInSeconds: minutes * 60,
        devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
      },
    },
  };
};

exports.verifySignup = async (signup, { code }) => {
  if (!signup || !signup.userId) {
    return { status: 401, body: { message: "Missing signup token", code: "MISSING_SIGNUP_TOKEN" } };
  }

  const user = await User.findById(signup.userId).select(
    "_id fullName email status isVerified otpHash otpExpiresAt"
  );

  if (!user) return { status: 404, body: { message: "Signup session not found", code: "SIGNUP_NOT_FOUND" } };
  if (!user.otpHash || !user.otpExpiresAt) return { status: 400, body: { message: "No verification code requested", code: "NO_OTP" } };
  if (user.otpExpiresAt.getTime() < Date.now()) return { status: 400, body: { message: "Code expired", code: "OTP_EXPIRED" } };

  const ok = await bcrypt.compare(code, user.otpHash);
  if (!ok) return { status: 400, body: { message: "Invalid code", code: "OTP_INVALID" } };

  user.isVerified = true;
  user.status = "ACTIVE";
  user.otpHash = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  return {
    status: 200,
    body: {
      message: "Account verified",
      token: signAuthToken(user._id),
      user: sanitizeUser(user),
      redirectTo: "/vault",
    },
  };
};
exports.login = async ({ email, password, deviceName }, req) => {
  const user = await User.findOne({ email }).select(
    "_id fullName email status isVerified passwordHash trustedDevices securityQuestion"
  );

  if (!user) {
    return { status: 401, body: { message: "Invalid email or password", code: "INVALID_CREDENTIALS" } };
  }

  if (user.status !== "ACTIVE" || user.isVerified !== true) {
    return {
      status: 403,
      body: { message: "Account not verified", code: "ACCOUNT_NOT_VERIFIED", redirectTo: "/verify" },
    };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return { status: 401, body: { message: "Invalid email or password", code: "INVALID_CREDENTIALS" } };
  }

  // device check
  const deviceId = makeDeviceId(req, deviceName || "");
  const known = (user.trustedDevices || []).some((d) => d.deviceId === deviceId);

  if (known) {
    // update lastUsedAt
    await User.updateOne(
      { _id: user._id, "trustedDevices.deviceId": deviceId },
      { $set: { "trustedDevices.$.lastUsedAt": new Date() } }
    );

    return {
      status: 200,
      body: {
        message: "Login successful",
        token: signAuthToken(user._id),
        user: sanitizeUser(user),
        redirectTo: "/vault",
      },
    };
  }

  //  New device => return tempToken + show confirm-device screen
  return {
    status: 200,
    body: {
      message: "New device detected",
      code: "NEW_DEVICE",
      nextStep: "confirm_device",
      tempToken: signDeviceTempToken(user._id, deviceId),
      securityQuestion: user.securityQuestion || "Security question not set",
      redirectTo: "/confirm-device",
    },
  };
};
exports.confirmDevice = async (payload, { securityAnswer, deviceName }, req) => {
  const { userId, deviceId } = payload;

  const user = await User.findById(userId).select(
    "_id fullName email status isVerified securityAnswerHash trustedDevices"
  );

  if (!user) {
    return { status: 404, body: { message: "User not found", code: "USER_NOT_FOUND" } };
  }

  if (user.status !== "ACTIVE" || user.isVerified !== true) {
    return { status: 403, body: { message: "Account not active", code: "ACCOUNT_NOT_ACTIVE" } };
  }

  const ok = await bcrypt.compare(securityAnswer, user.securityAnswerHash || "");
  if (!ok) {
    return { status: 400, body: { message: "Wrong security answer", code: "WRONG_SECURITY_ANSWER" } };
  }

  // add trusted device if not exists
  const exists = (user.trustedDevices || []).some((d) => d.deviceId === deviceId);
  if (!exists) {
    user.trustedDevices = user.trustedDevices || [];
    user.trustedDevices.push({
      deviceId,
      name: makeDeviceLabel(req, deviceName || ""),
      lastUsedAt: new Date(),
    });
    await user.save();
  }

  return {
    status: 200,
    body: {
      message: "Device confirmed",
      token: signAuthToken(user._id),
      user: sanitizeUser(user),
      redirectTo: "/vault",
    },
  };
};


// reset code generator (dev fixed optional)
const getResetOtp = () => {
  if (process.env.NODE_ENV !== "production") {
    return process.env.FIXED_RESET_OTP || "123456";
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getResetOtpExpiryMinutes = () => {
  const m = Number(process.env.RESET_OTP_EXPIRES_MINUTES || 10);
  return Number.isFinite(m) && m > 0 ? m : 10;
};

// 1) request reset code
exports.forgotPasswordRequest = async ({ email }) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "_id email status isVerified"
  );

  // ❌ Email not found
  if (!user) {
    return {
      status: 404,
      body: {
        message: "Email not found",
        code: "EMAIL_NOT_FOUND",
      },
    };
  }

  // ❌ Account exists but not verified / active
  if (user.status !== "ACTIVE" || user.isVerified !== true) {
    return {
      status: 403,
      body: {
        message: "Account not verified",
        code: "ACCOUNT_NOT_VERIFIED",
      },
    };
  }

  // ✅ Generate reset OTP
  const otp = getResetOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  const minutes = getResetOtpExpiryMinutes();
  const resetOtpExpiresAt = new Date(Date.now() + minutes * 60 * 1000);

  await User.updateOne(
    { _id: user._id },
    { $set: { resetOtpHash: otpHash, resetOtpExpiresAt } }
  );

  console.log("RESET OTP for", user.email, "=>", otp);

  return {
    status: 200,
    body: {
      message: "Reset code sent",
      resetToken: signResetToken(user._id, 1),
      meta: {
        otpLength: 6,
        expiresInSeconds: minutes * 60,
        devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
      },
    },
  };
};


// 2) verify code + set new password
exports.forgotPasswordReset = async (resetPayload, { code, newPassword }) => {
  if (!resetPayload?.userId) {
    return { status: 401, body: { message: "Missing reset token", code: "MISSING_RESET_TOKEN" } };
  }

  const user = await User.findById(resetPayload.userId).select(
    "_id resetOtpHash resetOtpExpiresAt passwordHash status isVerified"
  );

  if (!user) return { status: 404, body: { message: "User not found", code: "USER_NOT_FOUND" } };

  if (user.status !== "ACTIVE" || user.isVerified !== true) {
    return { status: 403, body: { message: "Account not active", code: "ACCOUNT_NOT_ACTIVE" } };
  }

  if (!user.resetOtpHash || !user.resetOtpExpiresAt) {
    return { status: 400, body: { message: "No reset code requested", code: "NO_RESET_CODE" } };
  }

  if (user.resetOtpExpiresAt.getTime() < Date.now()) {
    return { status: 400, body: { message: "Code expired", code: "RESET_CODE_EXPIRED" } };
  }

  const ok = await bcrypt.compare(code, user.resetOtpHash);
  if (!ok) {
    return { status: 400, body: { message: "Invalid code", code: "RESET_CODE_INVALID" } };
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetOtpHash = null;
  user.resetOtpExpiresAt = null;
  await user.save();

  return {
    status: 200,
    body: {
      message: "Password updated",
      redirectTo: "/login",
    },
  };
};


