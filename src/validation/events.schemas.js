const Joi = require("joi");

const ticketTypeSchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).required(),
  price: Joi.number().min(0).required(),
  total: Joi.number().integer().min(0).required(),
  sold: Joi.number().integer().min(0).default(0)
});

exports.createEventSchema = Joi.object({
  title: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().min(5).max(5000).required(),
  category: Joi.string().valid("concert", "sports", "shopping", "exhibition", "education", "other").required(),
  date: Joi.date().iso().required(),
  location: Joi.string().trim().min(2).max(200).required(),
  imageUrl: Joi.string().trim().uri().allow("").default(""),
  ticketTypes: Joi.array().items(ticketTypeSchema).min(1).required()
});

exports.updateEventSchema = Joi.object({
  title: Joi.string().trim().min(2).max(120),
  description: Joi.string().trim().min(5).max(5000),
  category: Joi.string().valid("concert", "sports", "shopping", "exhibition", "education", "other"),
  date: Joi.date().iso(),
  location: Joi.string().trim().min(2).max(200),
  imageUrl: Joi.string().trim().uri().allow(""),
  ticketTypes: Joi.array().items(ticketTypeSchema).min(1)
}).min(1);