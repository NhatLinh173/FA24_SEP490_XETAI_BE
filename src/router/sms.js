const express = require("express");
const router = express.Router();
const smsController = require("../controller/smsController");

router.post("/", smsController.sendSMSController);

module.exports = router;
