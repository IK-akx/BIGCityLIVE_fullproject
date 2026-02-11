const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendMail } = require("../utils/email.service");

// simple validators (basic; later we can replace with Joi)
function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in .env");

  const expiresIn = process.env.JWT_EXPIRES || "7d";
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    secret,
    { expiresIn }
  );
}

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // basic validation
    if (
      typeof username !== "string" || username.trim().length < 2 ||
      !isValidEmail(email) ||
      typeof password !== "string" || password.length < 6
    ) {
      return res.status(400).json({
        message: "Invalid input. username(>=2), valid email, password(>=6) are required."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      password,
      role: "user"
    });
    
    sendMail(normalizedEmail);
    
    const token = signToken(user);


    return res.status(201).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    // handle Mongo unique errors just in case
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Email already exists." });
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email) || typeof password !== "string" || password.length < 1) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // password is select:false in schema, so we must select it explicitly
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken(user);

    return res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    next(err);
  }
};
