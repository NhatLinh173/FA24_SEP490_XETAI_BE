const express = require("express");
const notificationController = require("../controller/notificationController");

const router = express.Router();

router.get("/:userId", notificationController.getNotifications);

module.exports = router;
