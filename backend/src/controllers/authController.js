// src/controllers/authController.js
const authService = require("../services/authService");

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

