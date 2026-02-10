const Joi = require("joi");

exports.createTicketSchema = Joi.object({
  eventId: Joi.string().trim().required(),
  ticketType: Joi.string().trim().min(1).required(),
  quantity: Joi.number().integer().min(1).required()
});

exports.cancelTicketSchema = Joi.object({
  status: Joi.string().valid("cancelled").required()
});