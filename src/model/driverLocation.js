// models/DriverLocation.js
const mongoose = require("mongoose");

const driverLocationSchema = new mongoose.Schema({
  orderCode: {
    type: String,
    ref: "Post",
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
  },
  location: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const DriverLocation = mongoose.model("DriverLocation", driverLocationSchema);

module.exports = DriverLocation;
