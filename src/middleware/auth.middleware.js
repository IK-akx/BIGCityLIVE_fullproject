const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  try {
    // TODO:
    // 1) Read Authorization header: "Bearer <token>"
    // 2) Verify token with JWT_SECRET
    // 3) Attach req.user = { userId, role }
    // 4) next()
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
