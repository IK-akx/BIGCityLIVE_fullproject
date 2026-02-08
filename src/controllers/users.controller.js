const User = require("../models/User");

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).select("_id username email role createdAt updatedAt");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { username, email } = req.body;

    // must provide at least one field
    if ((username === undefined || username === null) && (email === undefined || email === null)) {
      return res.status(400).json({ message: "Provide username and/or email" });
    }

    const updates = {};

    if (username !== undefined) {
      if (typeof username !== "string" || username.trim().length < 2 || username.trim().length > 50) {
        return res.status(400).json({ message: "Invalid username (2-50 chars)" });
      }
      updates.username = username.trim();
    }

    if (email !== undefined) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Invalid email" });
      }
      updates.email = email.trim().toLowerCase();

      // check uniqueness (exclude current user)
      const existing = await User.findOne({ email: updates.email, _id: { $ne: userId } });
      if (existing) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true, select: "_id username email role createdAt updatedAt" }
    );

    if (!updated) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user: updated });
  } catch (err) {
    // handle unique race condition
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Email already in use" });
    }
    next(err);
  }
};