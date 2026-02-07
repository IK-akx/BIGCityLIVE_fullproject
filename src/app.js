const express = require("express");
const app = express();

// middlewares
app.use(express.json());

// routes
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");

app.use("/", authRoutes);
app.use("/", usersRoutes);

//test
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
