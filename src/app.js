const express = require("express");
const app = express();

// middlewares
app.use(express.json());

// routes
const authRoutes = require("./routes/auth.routes");
app.use("/", authRoutes);

//test
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
