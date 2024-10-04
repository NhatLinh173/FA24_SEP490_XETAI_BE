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
      unique: true,
      required: true,
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

module.exports = mongoose.model("Deal", Deal);
