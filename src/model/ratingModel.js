const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ratingSchema = new Schema(
  {
    value: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    comment: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, 
  }
);

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = Rating;