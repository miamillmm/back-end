const express = require("express");
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

// Upload up to 5 images per car listing
router.post("/", protect, uploadMiddleware("cars", true, 5), addCar);
router.put("/:id", protect, uploadMiddleware("cars", true, 5), updateCar);
router.get("/uid/:id", getCarByUserId);
router.get("/", getCars);
router.get("/:id", getCarById);
router.delete("/:id", protect, deleteCar);

module.exports = router;
