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
 ratings: [{
    value: { type: Number, min: 1, max: 5 },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
}],
  averageRating: { type: Number, default: 0 }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  return isMatch;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
