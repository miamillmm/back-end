const express = require("express");
const {
  sendMessage,
  getMessages,
  markMessagesAsRead,
} = require("../controllers/messageController");
const protect = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/", protect, uploadMiddleware("messages", false), sendMessage); // Single image
router.get("/:conversationId", protect, getMessages);
router.put("/:conversationId/read", protect, markMessagesAsRead);

module.exports = router;
