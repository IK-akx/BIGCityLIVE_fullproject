module.exports = (err, req, res, next) => {
  console.error(err);

  if (res.headersSent) return next(err);

  // Incorrect ObjectId / CastError
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid id format",
      errors: [{ field: err.path || "id", message: "Invalid ObjectId" }]
    });
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation error",
      errors: Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Mongo duplicate key (for example, email unique)
  if (err.code === 11000) {
    const key = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      message: "Duplicate key error",
      errors: [{ field: key, message: `${key} already exists` }]
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Unauthorized", errors: [{ field: "token", message: err.message }] });
  }

  // Default
  return res.status(500).json({
    message: "Internal server error"
  });
};