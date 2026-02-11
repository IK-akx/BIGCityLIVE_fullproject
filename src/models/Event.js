const mongoose = require("mongoose");

const EVENT_CATEGORIES = [
  "concert",
  "sports",
  "shopping",
  "exhibition",
  "education",
  "other"
];

const ticketTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },        // Standard, VIP
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    sold: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    category: { type: String, enum: EVENT_CATEGORIES, index: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },

    // 🖼️ image of event (URL)
    imageUrl: {
      type: String,
      trim: true,
      default: ""
    },
    
    ticketTypes: {
      type: [ticketTypeSchema],
      validate: [arr => arr.length > 0, "Event must have at least one ticket type"]
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

eventSchema.methods.getAvailableTickets = function (typeName) {
  const type = this.ticketTypes.find(t => t.name === typeName);
  if (!type) return 0;
  return Math.max(0, type.total - type.sold);
};

module.exports = mongoose.model("Event", eventSchema);

