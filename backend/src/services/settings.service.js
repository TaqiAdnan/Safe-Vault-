const bcrypt = require("bcrypt");
const User = require("../models/User");

const httpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

exports.getMe = async (userId) => {
  const user = await User.findById(userId).select(
    "fullName email passwordHash securityQuestion securityAnswerHash trustedDevices status isVerified mfaEnabled"

  );

  if (!user) throw httpError(404, "User not found");

  return {
    fullName: user.fullName,
    email: user.email,
    status: user.status,
    isVerified: user.isVerified,
    hasPassword: !!user.passwordHash,
    securityQuestion: user.securityQuestion,
    hasSecurityAnswer: !!user.securityAnswerHash,
    mfaEnabled: !!user.mfaEnabled,
  };
};

exports.updateMe = async (userId, payload) => {
  if (payload.email) {
    const exists = await User.findOne({
      email: payload.email,
      _id: { $ne: userId },
    }).select("_id");

    if (exists) throw httpError(409, "Email already in use");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: payload },
    { new: true, runValidators: true }
  ).select("fullName email passwordHash securityQuestion securityAnswerHash status isVerified");

  if (!user) throw httpError(404, "User not found");

  return {
    fullName: user.fullName,
    email: user.email,
    status: user.status,
    isVerified: user.isVerified,
    hasPassword: !!user.passwordHash,
    securityQuestion: user.securityQuestion,
    hasSecurityAnswer: !!user.securityAnswerHash,
  };
};

exports.changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select("passwordHash");
  if (!user) throw httpError(404, "User not found");

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw httpError(400, "Current password is incorrect");

  const saltRounds = 10;
  user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
  await user.save();
};

exports.updateSecurityQuestion = async (userId, { question, answer }) => {
  const user = await User.findById(userId).select("securityQuestion securityAnswerHash");
  if (!user) throw httpError(404, "User not found");

  const saltRounds = 10;
  user.securityQuestion = question;
  user.securityAnswerHash = await bcrypt.hash(answer, saltRounds);
  await user.save();
};

// --- Trusted Devices ---
exports.listDevices = async (userId) => {
  const user = await User.findById(userId).select("trustedDevices");
  if (!user) throw httpError(404, "User not found");

  // sort by lastUsedAt desc
  const devices = [...(user.trustedDevices || [])].sort(
    (a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt)
  );

  return devices.map((d) => ({
    deviceId: d.deviceId,
    name: d.name,
    lastUsedAt: d.lastUsedAt,
  }));
};

exports.renameDevice = async (userId, deviceId, name) => {
  const user = await User.findById(userId).select("trustedDevices");
  if (!user) throw httpError(404, "User not found");

  const device = (user.trustedDevices || []).find((d) => d.deviceId === deviceId);
  if (!device) throw httpError(404, "Device not found");

  device.name = name;
  device.lastUsedAt = new Date();
  await user.save();
};

exports.removeDevice = async (userId, deviceId) => {
  const user = await User.findById(userId).select("trustedDevices");
  if (!user) throw httpError(404, "User not found");

  const before = user.trustedDevices.length;
  user.trustedDevices = user.trustedDevices.filter((d) => d.deviceId !== deviceId);

  if (user.trustedDevices.length === before) throw httpError(404, "Device not found");

  await user.save();
};

exports.removeAllDevices = async (userId) => {
  const user = await User.findById(userId).select("trustedDevices");
  if (!user) throw httpError(404, "User not found");

  user.trustedDevices = [];
  await user.save();
};
