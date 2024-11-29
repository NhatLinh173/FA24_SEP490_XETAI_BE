const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
  ip: { type: String, required: false },
  url: { type: String, required: true },
  method: { type: String, required: true },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Visit", visitSchema);
