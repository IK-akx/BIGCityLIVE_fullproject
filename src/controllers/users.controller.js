const User = require("../models/User");

exports.getProfile = async (req, res, next) => {
  try {
    // TODO:
    // read req.user.userId
    // find user, return profile (no password)
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    // TODO:
    // validate username/email
    // check email uniqueness
    // update and return updated user
  } catch (err) {
    next(err);
  }
};
