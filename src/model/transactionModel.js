const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ["POST_PAYMENT", "DEPOSIT", "CANCEL_ORDER"],
    required: true,
  },
  status: {
    type: String,
    enum: ["PAID", "PENDING", "FAILED"],
    default: "PENDING",
  },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Transaction", transactionSchema);
