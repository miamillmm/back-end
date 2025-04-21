const express = require("express");
const {
  getConversations,
  getAllConversations,
  startConversation,
} = require("../controllers/conversationController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:userId", protect, getConversations);
router.get("/", protect, getAllConversations);
router.post("/", protect, startConversation);

module.exports = router;
