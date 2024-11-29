const Notification = require("../model/notificationModel");

const getNotificationsByUserId = async (userId) => {
  try {
    const notification = await Notification.find({ userId }).sort({
      timestamp: -1,
    });
    return notification;
  } catch (error) {
    console.error("Error fetching notification:", error);
    throw error;
  }
};

module.exports = {
  getNotificationsByUserId,
};
