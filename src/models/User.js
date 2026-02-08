const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const USER_ROLES = ["user", "admin"];

const userSchema = new mongoose.Schema(
  {
    username: { type: String, trim: true, required: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: USER_ROLES, default: "user" }
  },
  { timestamps: true }
);

// Hash password before saving (only if changed)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
});


// helper to compare password
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
