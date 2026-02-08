const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || typeof header !== "string") {
      return res.status(401).json({ message: "Unauthorized: missing token" });
    }

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Unauthorized: invalid auth header" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // server misconfiguration
      return res.status(500).json({ message: "Server error: JWT_SECRET not set" });
    }

    const payload = jwt.verify(token, secret);

    // payload expected: { userId, role, iat, exp }
    if (!payload?.userId) {
      return res.status(401).json({ message: "Unauthorized: invalid token payload" });
    }

    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: token invalid or expired" });
  }
};