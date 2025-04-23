const express = require("express");
const {
  addCar,
  updateCar,
  deleteCar,
  getCars,
  getCarById,
  getCarByUserId,
} = require("../controllers/carController"); // ✅ Ensure this path is correct
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const protect = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
};

// Multer upload configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
        files: 20 // Max 20 files
    },
    fileFilter: fileFilter
});

// Upload up to 5 images per car listing
router.post("/", protect, upload.array('images', 20), addCar);
router.put("/:id", protect, uploadMiddleware("cars", true, 20), updateCar);
router.get("/uid/:id", getCarByUserId);
router.get("/", getCars);
router.get("/:id", getCarById);
router.delete("/:id", protect, deleteCar);

module.exports = router;
