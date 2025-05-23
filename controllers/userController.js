const User = require("../models/User");


const multer = require("multer");
const path = require("path");
const fs = require("fs");


// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user.userId; // From JWT middleware
    const userDir = path.join(__dirname, "uploads", "users");
    // Create user-specific directory if it doesn't exist
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images are allowed"));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// @desc    Create a new user
// @route   POST /api/users
const createUser = async (req, res) => {
  try {
    const { name, email, phone, age, phoneCode } = req.body;
    const role = "user";
    const newUser = await User.create({
      name,
      email,
      phone,
      age,
      phoneCode,
      role,
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch users

    // Debugging: Log API response
    console.log("Users API Response:", users);

    // ✅ Ensure correct response format
    res.set("Content-Range", `users 0-${users.length}/${users.length}`);
    res.set("Access-Control-Expose-Headers", "Content-Range");

    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a user by ID
// @route   GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser };
