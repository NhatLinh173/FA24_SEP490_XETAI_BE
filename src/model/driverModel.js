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
  vehicleType: [
    {
      name: String,
      licensePlate: String,
    },
  ],
  driverImage: {
    type: String,
    default: null,
  },
  linceseImage: {
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
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  tripsCompleted: {
    type: Number,
    default: 0,
  },
});

const Driver = mongoose.model("Driver", driverSchema);
module.exports = Driver;
