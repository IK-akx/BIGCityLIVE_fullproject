const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const {
  createTicket,
  listTickets,
  getTicketById,
  updateTicketById,
  deleteTicketById
} = require("../controllers/tickets.controller");

router.post("/tickets", auth, createTicket);
router.get("/tickets", auth, listTickets);
router.get("/tickets/:id", auth, getTicketById);
router.put("/tickets/:id", auth, updateTicketById);
router.delete("/tickets/:id", auth, deleteTicketById);

module.exports = router;
