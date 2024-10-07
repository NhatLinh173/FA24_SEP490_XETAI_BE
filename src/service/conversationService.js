const { ConversationModel } = require("../model/messageModel");

const findOrCreateConversation = async (senderId, receiverId) => {
  let conversation = await ConversationModel.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = new ConversationModel({
      participants: [senderId, receiverId],
    });

    await conversation.save();
  }

  return conversation._id;
};

const getUserConversations = async (userId) => {
  if (!userId) {
    throw new Error("userId query parameter is required.");
  }

  const conversations = await ConversationModel.find({
    participants: userId,
  })
    .populate("participants", "-__v")
    .sort({ updatedAt: -1 })
    .lean();

  const conversationsWithLastMessage = conversations.map((conv) => {
    const lastMessage =
      conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
    const otherParticipant = conv.participants.find(
      (p) => p._id.toString() !== userId
    );
    return {
      conversationId: conv._id,
      participant: otherParticipant,
      lastMessage,
    };
  });

  return conversationsWithLastMessage;
};

module.exports = {
  findOrCreateConversation,
  getUserConversations,
};
