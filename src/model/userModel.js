const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  role: { type: String },
  phone: String,
  fullName: String,
  refreshToken: String,
  address: { type: String, default: null },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  averageRating: {
      type: Number,
      default: 0
  },
  avatar: {
    type: String,
    default: null,
  },
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  return isMatch;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
