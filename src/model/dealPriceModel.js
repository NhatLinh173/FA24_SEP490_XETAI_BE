const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Driver = require("./driverModel");
const Post = require("./postModel");

const Deal = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    dealPrice: {
      type: String,
    },
    status: {
      type: String,
      enum: ["wait", "approve", "cancel"],
      default: "wait",
    },
    estimatedTime: {
      type: Date,
      required: true,
    },
    estimatedHour: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

Deal.index({ dealPrice: 1 }, { unique: false });

module.exports = mongoose.model("Deal", Deal);
