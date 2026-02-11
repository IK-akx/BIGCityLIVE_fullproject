const mongoose = require("mongoose");

const TICKET_STATUS = ["active", "cancelled"];

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },

    ticketType: { type: String, required: true }, // VIP and standard 
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },

    status: { type: String, enum: TICKET_STATUS, default: "active" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
