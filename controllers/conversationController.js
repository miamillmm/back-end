const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const getConversations = async (req, res) => {
  try {
    const userId = req.params.userId; // ✅ Get user ID from URL
    const conversations = await Conversation.find({
      participants: userId, // ✅ Find conversations where user is a participant
    })
      .populate("participants", "username") // ✅ Populate user details
      .populate("lastMessage");

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all conversations for a user
// @route   GET /api/conversations
const getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name email")
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Start a conversation
// @route   POST /api/conversations
const startConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
      });
    }

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getConversations, getAllConversations, startConversation };
