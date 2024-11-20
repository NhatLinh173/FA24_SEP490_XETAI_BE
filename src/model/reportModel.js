const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Report = new Schema(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    driverPostId: {
      type: Schema.Types.ObjectId,
      ref: "driverPost",
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", Report);
