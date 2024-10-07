const express = require("express");
const router = express.Router();
const {
  getOrCreateConversation,
  getUserConversation,
} = require("../controller/conversationController");

router.post("/", getOrCreateConversation);
router.get("/", getUserConversation);

module.exports = router;
