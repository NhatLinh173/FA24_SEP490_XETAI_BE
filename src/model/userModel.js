const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    sparse: true,
    default: null,
  },
  password: {
    type: String,
    required: false,
  },
  role: { type: String },
  phone: { type: String, required: false, unique: true },
  fullName: String,
  refreshToken: String,
  address: { type: String, default: null },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  blockedUntil: { type: Date, default: null },
  avatar: {
    type: String,
    default: null,
  },
  businessName: { type: String, default: null },
  balance: { type: Number, default: 0 },
});

userSchema.index({ email: 1 }, { unique: true, sparse: true });

userSchema.methods.matchPassword = async function (enteredPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  return isMatch;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
