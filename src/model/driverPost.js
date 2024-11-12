const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const driverPost = new Schema(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    startCity: {
      type: String,
      required: true,
    },
    startAddress: {
        type: String,
        required: true,
    },
    destinationCity: {
      type: String,
      required: true,
    },
    destinationAddress: {
        type: String,
        required: true,
      },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("driverPost", driverPost);