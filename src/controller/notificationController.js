const notificationService = require("../service/notificationService");
const getNotifications = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await notificationService.getNotificationsByUserId(
      userId
    );
    res.status(200).json({ notifications });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Lỗi server khi tải thông báo" });
  }
};

module.exports = {
  getNotifications,
};
