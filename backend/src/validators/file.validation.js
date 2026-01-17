const Joi = require("joi");

const createFileSchema = Joi.object({
  name: Joi.string().trim().min(1).max(120).required(),
  sizeBytes: Joi.number().integer().min(0).max(1024 * 1024 * 1024).default(0), // up to 1GB metadata
  mimeType: Joi.string().trim().max(100).allow("").default(""),
});

module.exports = { createFileSchema };
