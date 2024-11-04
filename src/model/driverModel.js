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
  tripsCompleted: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
    default: 0,
  },
  carRegistrations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarRegistration",
    },
  ],
  statistics: {
    today: [
      {
        hour: { type: String, required: true },
        trips: { type: Number, default: 0 },
        earnings: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    yesterday: [
      {
        hour: { type: String, required: true },
        trips: { type: Number, default: 0 },
        earnings: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    thisWeek: [
      {
        day: { type: String, required: true },
        trips: { type: Number, default: 0 },
        earnings: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    thisMonth: [
      {
        date: { type: String, required: true },
        trips: { type: Number, default: 0 },
        earnings: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    lastMonth: [
      {
        date: { type: String, required: true },
        trips: { type: Number, default: 0 },
        earnings: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    thisYear: [
      {
        year: { type: String, required: true },
        month: { type: String, required: true },
        trips: { type: Number, default: 0 },
        earnings: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    lastYear: [
      {
        year: { type: String, required: true },
        month: { type: String, required: true },
        trips: { type: Number, default: 0 },
        earnings: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
});

const Driver = mongoose.model("Driver", driverSchema);
module.exports = Driver;
