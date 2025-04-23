require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const carRoutes = require("./routes/carRoutes");
const messageRoutes = require("./routes/messageRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const conversationRoutes = require("./routes/conversationRoutes"); // NEW
const contactRoutes = require("./routes/contactRoutes"); // NEW
const errorHandler = require("./middleware/errorMiddleware");
const http = require("http");
const { initializeSocket } = require("./socket");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = initializeSocket(server);

connectDB();

// app.use(cors());
// app.use(
//   cors({
//     exposedHeaders: ["Content-Range"],
//   })
// );

app.use(express.json({ limit: '100mb' })); 
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cors({
  origin: ['https://syriasouq.com','http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan("dev"));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/conversations", conversationRoutes); // NEW
app.use("/api/messages", messageRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/contact", contactRoutes);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(errorHandler);

module.exports = { app, server, io };

server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
