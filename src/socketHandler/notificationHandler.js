const Notification = require("../model/notificationModel");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("joinRoom", (userId) => {
      socket.join(userId);
    });

    socket.on("sendNotification", async ({ userId, title, message, data }) => {
      try {
        const notification = new Notification({
          userId,
          title,
          message,
          data,
        });
        await notification.save();

        io.to(userId).emit("receiveNotification", {
          title,
          message,
          data,
          timestamp: notification.createdAt,
        });
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    });

    socket.on("disconnect", () => {});
  });
};
