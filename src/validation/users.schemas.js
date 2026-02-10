const Joi = require("joi");

exports.updateProfileSchema = Joi.object({
  username: Joi.string().trim().min(2).max(50),
  email: Joi.string().trim().lowercase().email()
}).min(1); // at list 1 row