const express = require("express");
const router = express.Router();
const sendNotificationController = require("../controller/notificationController");

router.post("/send-notification", sendNotificationController);

module.exports = router;
