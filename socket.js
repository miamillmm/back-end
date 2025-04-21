const { Server } = require("socket.io");

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("sendMessage", (message) => {
      io.to(message.conversation).emit("newMessage", message);
    });

    // Handle typing event
    socket.on("typing", ({ conversationId, sender }) => {
      console.log(`User ${sender} is typing in conversation ${conversationId}`);
      socket.to(conversationId).emit("typing", { sender });
    });

    // Handle stop typing event
    socket.on("stopTyping", ({ conversationId, sender }) => {
      console.log(
        `User ${sender} stopped typing in conversation ${conversationId}`
      );
      socket.to(conversationId).emit("stopTyping", { sender });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};

module.exports = { io, initializeSocket, getIo };
