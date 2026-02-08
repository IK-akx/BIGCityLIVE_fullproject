const mongoose = require("mongoose");
const Event = require("../models/Event");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      date,
      location,
      imageUrl,
      ticketTypes
    } = req.body;

    if (!title || !description || !date || !location || !Array.isArray(ticketTypes)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const event = await Event.create({
      title,
      description,
      category,
      date,
      location,
      imageUrl,
      ticketTypes,
      createdBy: req.user.userId
    });

    res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    let events = await Event.find(filter).sort({ date: 1 });

    // optional price filter (by cheapest ticket type)
    if (minPrice || maxPrice) {
      events = events.filter(e => {
        const prices = e.ticketTypes.map(t => t.price);
        const min = Math.min(...prices);
        if (minPrice && min < Number(minPrice)) return false;
        if (maxPrice && min > Number(maxPrice)) return false;
        return true;
      });
    }

    res.json({ events });
  } catch (err) {
    next(err);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json({ event });
  } catch (err) {
    next(err);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const updated = await Event.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Event not found" });

    res.json({ event: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Event not found" });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
