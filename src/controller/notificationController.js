const sendNotification = require("../service/notificationService");

const sendNotificationController = async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res
      .status(400)
      .json({ message: "To and message are required fields" });
  }

  try {
    const response = await sendNotification(to, message);
    res.status(200).json({ message: "Notification sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = sendNotificationController;
