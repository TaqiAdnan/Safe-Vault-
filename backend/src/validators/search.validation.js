const Joi = require("joi");

const searchSchema = Joi.object({
  q: Joi.string().trim().min(1).max(100).required(),
  type: Joi.string().valid("all", "notes", "files", "folders").default("all"),
});

module.exports = { searchSchema };
