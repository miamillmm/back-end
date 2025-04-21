const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const { io, getIo } = require("../socket");

// @desc    Send a message (with optional image)
// @route   POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = `/uploads/messages/${req.file.filename}`;
    }

    // Save message
    const newMessage = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      message: message,
      image: imageUrl,
    });

    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message || "📷 Image Sent",
      lastMessageAt: new Date(),
    });

    // Emit real-time message
    // io.to(conversationId).emit("newMessage", newMessage);

    // Emit real-time message
    const io = getIo(); // Get Socket.io instance
    io.to(conversationId).emit("newMessage", newMessage); // ✅ Fix error "Cannot read properties of undefined"

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await Message.updateMany(
      { conversation: conversationId, read: false },
      { read: true }
    );

    // Emit event to update UI
    const io = getIo();
    io.to(conversationId).emit("messagesRead", conversationId);

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { sendMessage, getMessages, markMessagesAsRead };
