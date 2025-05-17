const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  handleForgotPassword,
  handleChangePassword,
  imageUpload,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { check } = require("express-validator");

const router = express.Router();
const multer = require("multer");
const path = require("path");

const fs = require("fs");
const protect = require("../middleware/authMiddleware");



// Validation Middleware
const validateRegister = [
  check("username", "Name is required").not().isEmpty(),
  // check("email", "Valid email is required").isEmail(),
  check("phone", "Valid phone is required").isMobilePhone(),
  check("password", "Password must be at least 6 characters").isLength({
    min: 6,
  }),
];

// Authentication Routes
router.post("/register", validateRegister, registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);


router.use(protect)
// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "Uploads", "users"); // Store in Uploads/users/
    // Create Uploads/users directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${Date.now()}${ext}`); // Filename without userId
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
router.post("/upload-image",upload.single("image"), imageUpload);


module.exports = router;
