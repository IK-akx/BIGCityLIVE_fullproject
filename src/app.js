const express = require("express");
const path = require("path");
const app = express();

// middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// routes
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const eventsRoutes = require("./routes/events.routes");
const ticketsRoutes = require("./routes/tickets.routes");

app.use("/", authRoutes);
app.use("/", usersRoutes);
app.use("/", ticketsRoutes);
app.use(eventsRoutes);


//test
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const notFound = require("./middleware/notFound.middleware")
const errorHandler = require("./middleware/error.middleware")
app.use(notFound);
app.use(errorHandler);

module.exports = app;
