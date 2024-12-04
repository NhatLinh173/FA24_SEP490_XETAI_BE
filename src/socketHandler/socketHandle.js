const mongoose = require("mongoose");
const { ConversationModel } = require("../model/messageModel");
const User = require("../model/userModel");
const Notification = require("../model/notificationModel");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("joinRoom", (userId) => {
      socket.join(userId);
    });

    socket.on(
      "sendMessage",
      async ({ conversationId, senderId, receiverId, text }) => {
        try {
          let conversation;

          if (
            !conversationId ||
            !mongoose.Types.ObjectId.isValid(conversationId)
          ) {
            conversation = await ConversationModel.findOne({
              participants: { $all: [senderId, receiverId] },
            });

            if (!conversation) {
              conversation = new ConversationModel({
                participants: [senderId, receiverId],
                messages: [],
              });
            }
          } else {
            conversation = await ConversationModel.findById(conversationId);
          }

          if (!conversation) {
            throw new Error("Conversation not found");
          }

          const newMessage = {
            text,
            msgByUserId: senderId,
            seen: false,
            createdAt: new Date(),
          };
          conversation.messages.push(newMessage);
          await conversation.save();

          const sender = await User.findById(senderId).select(
            "fullName avatar"
          );

          io.to(receiverId).emit("newMessageNotification", {
            senderId,
            senderName: sender.name,
            senderAvatar: sender.avatar,
            conversationId: conversation._id,
            text,
            createdAt: newMessage.createdAt,
          });

          io.to(receiverId).emit("receiveMessage", newMessage);

          const notification = new Notification({
            userId: receiverId,
            title: "Tin nhắn mới",
            message: `${sender.fullName}`,
            data: { conversationId: conversation._id, senderId },
          });
          await notification.save();

          io.to(receiverId).emit("receiveNotification", {
            title: "Tin nhắn mới",
            message: `${sender.fullName}`,
            data: { conversationId: conversation._id, senderId },
            timestamp: notification.createdAt,
          });
        } catch (error) {
          console.error("Error saving message:", error);
        }
      }
    );

    socket.on("getMessages", async ({ conversationId }) => {
      try {
        if (
          !conversationId ||
          !mongoose.Types.ObjectId.isValid(conversationId)
        ) {
          throw new Error("Invalid or missing conversationId");
        }

        const conversation = await ConversationModel.findById(conversationId)
          .select("messages")
          .populate("messages.msgByUserId", "name avatar")
          .sort({ "messages.createdAt": 1 });

        if (!conversation) {
          throw new Error("Conversation not found");
        }

        socket.emit("loadMessages", conversation.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        socket.emit("loadMessages", []);
      }
    });

    socket.on("disconnect", () => {});
  });
};
