const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Driver = require("./driverModel");

const CarRegistration = new Schema(
  {
    nameCar: {
      type: String,
      required: true,
    },
    imageCar: {
      type: [String],
    },
    imageRegistration: {
      type: [String],
    },
    licensePlate: {
      type: String,
    },
    registrationDate: {
      type: Date,
    },
    expirationDate: {
      type: Date,
    },
    load: {
      type: Number,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
    },
    status: {
      type: String,
      enum: ["wait", "approve", "cancel"],
      default: "wait",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CarRegistration", CarRegistration);
