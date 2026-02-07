const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Helper: sign JWT
function signToken(user) {
  // TODO: implement jwt.sign with JWT_SECRET + JWT_EXPIRES
}

exports.register = async (req, res, next) => {
  try {
    // TODO:
    // 1) validate input
    // 2) check if email exists
    // 3) create user (password will be hashed by pre-save hook)
    // 4) sign token
    // 5) return user + token
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    // TODO:
    // 1) validate input
    // 2) find user by email (include password)
    // 3) compare password
    // 4) sign token
    // 5) return user + token
  } catch (err) {
    next(err);
  }
};
