const express = require("express");
const {
  addWishlist,
  deleteWishlist,
  getWishlists,
  getWishlistById,
  getWishlistByUserId,
} = require("../controllers/wishlistController"); // ✅ Ensure this path is correct

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Upload up to 5 images per car listing
router.post("/", protect, addWishlist);
router.get("/uid/:id", getWishlistByUserId);
router.get("/", getWishlists);
router.get("/:id", getWishlistById);
router.delete("/:id", protect, deleteWishlist);

module.exports = router;
