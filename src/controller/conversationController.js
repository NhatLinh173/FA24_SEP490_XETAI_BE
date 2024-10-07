const {
  findOrCreateConversation,
  getUserConversations,
} = require("../service/conversationService");

const getOrCreateConversation = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    const conversationId = await findOrCreateConversation(senderId, receiverId);
    res.json({ conversationId });
  } catch (error) {
    console.error("Error loading or creating conversation:", error);
    res.status(500).send("Error creating conversation");
  }
};

const getUserConversation = async (req, res) => {
  const { userId } = req.query;
  try {
    const conversations = await getUserConversations(userId);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrCreateConversation,
  getUserConversation,
};
