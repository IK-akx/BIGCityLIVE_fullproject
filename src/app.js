const express = require("express");
const app = express();

// middlewares
app.use(express.json());

// routes
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const resourceRoutes = require("./routes/resource.routes");

app.use("/", authRoutes);
app.use("/", usersRoutes);
app.use("/", resourceRoutes);

//test
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
