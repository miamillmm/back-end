const express = require("express");
const multer = require('multer');

const {
  addCar,
  updateCar,
  deleteCar,
  getCars,
  getCarById,
  getCarByUserId,
} = require("../controllers/carController"); // ✅ Ensure this path is correct

const protect = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");

const router = express.Router();


const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}`);
  },
});

const upload = multer({ storage, limits: { fieldSize: 25 * 1024 * 1024 } });

// Upload up to 5 images per car listing
router.post("/", protect, upload.array('images'), addCar);
router.put("/:id", protect, uploadMiddleware("cars", true, 20), updateCar);
router.get("/uid/:id", getCarByUserId);
router.get("/", getCars);
router.get("/:id", getCarById);
router.delete("/:id", protect, deleteCar);

module.exports = router;
