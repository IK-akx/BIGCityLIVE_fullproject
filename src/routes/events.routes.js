const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require("../controllers/events.controller");

// public
router.get("/api/events", getEvents);
router.get("/api/events/:id", getEventById);

// admin only
router.post("/api/events", auth, adminOnly, createEvent);
router.put("/api/events/:id", auth, adminOnly, updateEvent);
router.delete("/api/events/:id", auth, adminOnly, deleteEvent);

module.exports = router;
