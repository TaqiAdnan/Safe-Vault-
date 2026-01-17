const Joi = require("joi");

const createNoteSchema = Joi.object({
  title: Joi.string().trim().min(1).max(80).required(),
  content: Joi.string().allow("").optional(),
});

const updateNoteSchema = Joi.object({
  title: Joi.string().trim().min(1).max(80).optional(),
  content: Joi.string().allow("").optional(),
}).min(1); // must update at least one field

module.exports = { createNoteSchema, updateNoteSchema };
