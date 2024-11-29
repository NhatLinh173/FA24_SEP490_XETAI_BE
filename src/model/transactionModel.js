const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: [
      "POST_PAYMENT",
      "DEPOSIT",
      "CANCEL_ORDER",
      "WITHDRAW",
      "PAYING_FOR_ORDER",
      "RECEIVING_PAYMENT_FROM_ORDER",
      "PAY_SYSTEM_FEE",
      "RECEIVE_CANCELLATION_FEE",
    ],
    required: true,
  },
  status: {
    type: String,
    enum: ["PAID", "PENDING", "FAILED", "COMPLETED"],
    default: "PENDING",
  },
  createdAt: { type: Date, default: Date.now },
  orderCode: { type: String, required: true },
});
module.exports = mongoose.model("Transaction", transactionSchema);
