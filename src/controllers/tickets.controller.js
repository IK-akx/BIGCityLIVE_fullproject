const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");
const Event = require("../models/Event");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.createTicket = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { eventId, ticketType, quantity } = req.body;

    if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid eventId" });
    }
    if (typeof ticketType !== "string" || ticketType.trim().length < 1) {
      return res.status(400).json({ message: "ticketType is required" });
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: "quantity must be an integer >= 1" });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const type = event.ticketTypes.find(t => t.name === ticketType);
    if (!type) {
      return res.status(400).json({ message: "Ticket type not found for this event" });
    }

    const available = Math.max(0, type.total - type.sold);
    if (available < qty) {
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    // update sold count
    await Event.updateOne(
      { _id: eventId, "ticketTypes.name": ticketType },
      { $inc: { "ticketTypes.$.sold": qty } }
    );

    // store price at purchase time
    const ticket = await Ticket.create({
      user: userId,
      event: eventId,
      ticketType,
      price: type.price,
      quantity: qty,
      status: "active"
    });

    return res.status(201).json({ ticket });
  } catch (err) {
    next(err);
  }
};

exports.listTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .populate("event", "title date location category");

    return res.status(200).json({ tickets });
  } catch (err) {
    next(err);
  }
};

exports.getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const ticket = await Ticket.findById(id)
      .populate("event", "title date location category");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // owner check
    if (ticket.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json({ ticket });
  } catch (err) {
    next(err);
  }
};

exports.updateTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    if (status !== "cancelled") {
      return res.status(400).json({ message: "Only status='cancelled' is supported" });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // owner check
    if (ticket.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (ticket.status === "active") {
      await Event.updateOne(
        { _id: ticket.event, "ticketTypes.name": ticket.ticketType },
        { $inc: { "ticketTypes.$.sold": -ticket.quantity } }
      );
      ticket.status = "cancelled";
      await ticket.save();
    }

    return res.status(200).json({ ticket });
  } catch (err) {
    next(err);
  }
};

exports.deleteTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // owner check
    if (ticket.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (ticket.status === "active") {
      await Event.updateOne(
        { _id: ticket.event, "ticketTypes.name": ticket.ticketType },
        { $inc: { "ticketTypes.$.sold": -ticket.quantity } }
      );
    }

    await Ticket.deleteOne({ _id: id });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
