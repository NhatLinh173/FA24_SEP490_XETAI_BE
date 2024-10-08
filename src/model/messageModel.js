const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    text: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    seen: { type: Boolean, default: false },
    msgByUserId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

const ConversationModel = mongoose.model("Conversation", conversationSchema);

module.exports = {
  ConversationModel,
};
