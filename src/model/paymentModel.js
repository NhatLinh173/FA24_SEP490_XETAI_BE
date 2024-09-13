const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  orderCode: { type: Number, required: true, unique: true },
  orderId: { type: String },
  amount: { type: Number },
  status: { type: String, required: true },
  createdAt: { type: Date },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fullName: { type: String },
});

module.exports = mongoose.model("payment", paymentSchema);
