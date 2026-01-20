// src/controllers/authController.js
const authService = require("../services/authService");
const mfaService = require("../services/mfaService");
const { signAuthToken } = require("../utils/jwt"); 

exports.signupStep1 = async (req, res) => {
  const result = await authService.signupStep1(req.body);
  res.status(result.status).json(result.body);
};

exports.signupStep2 = async (req, res) => {
  const result = await authService.signupStep2(req.signup, req.body);
  res.status(result.status).json(result.body);
};

exports.verifySignup = async (req, res) => {
  const result = await authService.verifySignup(req.signup, req.body);
  res.status(result.status).json(result.body);
};
exports.login = async (req, res) => {
  const result = await authService.login(req.body, req);
  res.status(result.status).json(result.body);
};

exports.confirmDevice = async (req, res) => {
  const result = await authService.confirmDevice(req.deviceConfirm, req.body, req);
  res.status(result.status).json(result.body);
};

exports.forgotPasswordRequest = async (req, res) => {
  const result = await authService.forgotPasswordRequest(req.body);
  return res.status(result.status).json(result.body);
};

exports.forgotPasswordReset = async (req, res) => {
  const result = await authService.forgotPasswordReset(req.reset, req.body);
  return res.status(result.status).json(result.body);
};


exports.mfaSetup = async (req, res) => {
  const result = await mfaService.setupTotp(req.user.id);
  res.status(result.status).json(result.body);
};

exports.mfaEnable = async (req, res) => {
  const result = await mfaService.enableTotp(req.user.id, req.body);
  res.status(result.status).json(result.body);
};

exports.mfaDisable = async (req, res) => {
  const result = await mfaService.disableTotp(req.user.id);
  res.status(result.status).json(result.body);
};

exports.mfaVerifyLogin = async (req, res) => {
  const result = await mfaService.verifyMfaLogin(req.mfa.userId, req.body);
  if (result.status !== 200) return res.status(result.status).json(result.body);

  return res.status(200).json({
    message: "Login verified",
    token: signAuthToken(req.mfa.userId),
    redirectTo: "/vault",
  });
};
