const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  businessName: {
    type: String,
  },
  driverImage: {
    type: String,
    default: null,
  },
  tripsThisWeek: {
    type: Number,
    default: 0,
  },
  tripsThisMonth: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  tripsCompleted: {
    type: Number,
    default: 0,
  },
  balance: { type: Number, default: 0 },
  earningsHistory: [
    {
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
    },
  ],
});

const Driver = mongoose.model("Driver", driverSchema);
module.exports = Driver;
