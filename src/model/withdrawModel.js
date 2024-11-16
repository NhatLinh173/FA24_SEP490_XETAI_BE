const mongoose = require("mongoose");

const WithdrawRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  accountHolderName: { type: String, required: true },
  orderCode: { type: String, required: true },
  status: { type: String, default: "PENDING" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Withdraw", WithdrawRequestSchema);
