const express = require("express");

const app = express();

// middlewares
app.use(express.json());

// test route (чтобы проверить что сервер жив)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
