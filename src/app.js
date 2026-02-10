const express = require("express");
const app = express();

// middlewares
app.use(express.json());

// routes
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const eventsRoutes = require("./routes/events.routes");
const ticketsRoutes = require("./routes/tickets.routes");
const notFound = require("./middleware/notFound.middleware")
const errorHandler = require("./middleware/error.middleware")

app.use("/", authRoutes);
app.use("/", usersRoutes);
app.use("/", ticketsRoutes);
app.use(eventsRoutes);
app.use(notFound);
app.use(errorHandler);

//test
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
