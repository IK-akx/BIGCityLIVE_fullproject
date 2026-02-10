module.exports = (req, res) => {
  res.status(404).json({
    message: "Route not found",
    errors: [{ field: "route", message: `${req.method} ${req.originalUrl}` }]
  });
};