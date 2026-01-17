// src/validators/authSchemas.js
const Joi = require("joi");

const signupStep1Schema = Joi.object({
  fullName: Joi.string().min(3).max(60).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).max(72).required(),
});

const signupStep2Schema = Joi.object({
  securityQuestion: Joi.string().min(5).max(120).trim().required(),
  securityAnswer: Joi.string().min(2).max(80).trim().required(),
});

const verifySchema = Joi.object({
  code: Joi.string().pattern(/^\d{6}$/).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).max(72).required(),
  deviceName: Joi.string().max(80).allow("").optional(),
});

const confirmDeviceSchema = Joi.object({
  securityAnswer: Joi.string().min(2).max(80).trim().required(),
  deviceName: Joi.string().max(80).allow("").optional(),
});

// forgot password
const forgotPasswordRequestSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
});

const forgotPasswordResetSchema = Joi.object({
  code: Joi.string().pattern(/^\d{6}$/).required(),
  newPassword: Joi.string().min(8).max(100).required(),
});

module.exports = {
  signupStep1Schema,
  signupStep2Schema,
  verifySchema,
  loginSchema,
  confirmDeviceSchema,
  forgotPasswordRequestSchema,
  forgotPasswordResetSchema,
};
