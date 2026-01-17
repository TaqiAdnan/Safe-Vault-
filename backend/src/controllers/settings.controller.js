const settingsService = require("../services/settings.service");
const { SECURITY_QUESTIONS } = require("../constants/securityQuestions");

exports.getSecurityQuestions = (req, res) => {
  return res.json({ questions: SECURITY_QUESTIONS });
};

exports.getMe = async (req, res, next) => {
  try {
    const data = await settingsService.getMe(req.user.id);
    return res.json(data);
  } catch (e) {
    next(e);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const data = await settingsService.updateMe(req.user.id, req.body);
    return res.json(data);
  } catch (e) {
    next(e);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    await settingsService.changePassword(req.user.id, req.body);
    return res.json({ message: "Password updated successfully" });
  } catch (e) {
    next(e);
  }
};

exports.updateSecurityQuestion = async (req, res, next) => {
  try {
    await settingsService.updateSecurityQuestion(req.user.id, req.body);
    return res.json({ message: "Security question updated successfully" });
  } catch (e) {
    next(e);
  }
};

// Trusted devices
exports.listDevices = async (req, res, next) => {
  try {
    const devices = await settingsService.listDevices(req.user.id);
    return res.json({ devices });
  } catch (e) {
    next(e);
  }
};

exports.renameDevice = async (req, res, next) => {
  try {
    await settingsService.renameDevice(req.user.id, req.params.deviceId, req.body.name);
    return res.json({ message: "Device renamed successfully" });
  } catch (e) {
    next(e);
  }
};

exports.removeDevice = async (req, res, next) => {
  try {
    await settingsService.removeDevice(req.user.id, req.params.deviceId);
    return res.json({ message: "Device removed successfully" });
  } catch (e) {
    next(e);
  }
};

exports.removeAllDevices = async (req, res, next) => {
  try {
    await settingsService.removeAllDevices(req.user.id);
    return res.json({ message: "All devices removed successfully" });
  } catch (e) {
    next(e);
  }
};
