const Joi = require("joi");
const { SECURITY_QUESTIONS } = require("../constants/securityQuestions");

const getMeSchema = Joi.object({}); 

const updateMeSchema = Joi.object({
  fullName: Joi.string().min(2).max(60).trim(),
  email: Joi.string().email().lowercase().trim(),
}).min(1);

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).max(100).required(),
  newPassword: Joi.string().min(8).max(100).required(),
});

const updateSecurityQuestionSchema = Joi.object({
  question: Joi.string().valid(...SECURITY_QUESTIONS).required(),
  answer: Joi.string().min(2).max(100).required(),
});

const updateDeviceNameSchema = Joi.object({
  name: Joi.string().max(80).allow("").trim().required(),
});

module.exports = {
  getMeSchema,
  updateMeSchema,
  changePasswordSchema,
  updateSecurityQuestionSchema,
  updateDeviceNameSchema,
};
