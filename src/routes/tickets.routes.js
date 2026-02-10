const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { createTicketSchema, cancelTicketSchema } = require("../validation/tickets.schemas");

const {
  createTicket,
  listTickets,
  getTicketById,
  updateTicketById,
  deleteTicketById
} = require("../controllers/tickets.controller");

router.post("/tickets", auth, validate(createTicketSchema), createTicket);
router.get("/tickets", auth, listTickets);
router.get("/tickets/:id", auth, getTicketById);
router.put("/tickets/:id", auth, validate(cancelTicketSchema), updateTicketById);
router.delete("/tickets/:id", auth, deleteTicketById);

module.exports = router;