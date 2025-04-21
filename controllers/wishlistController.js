const Wishlist = require("../models/Wishlist");
const mongoose = require("mongoose");

// @desc    Add a new Wishlist
// @route   POST /api/wishlist
const addWishlist = async (req, res) => {
  try {
    const { carId } = req.body;

    // Handle image uploads

    const wishlist = new Wishlist({
      user: req.user.id, // Ensure user is authenticated
      car: new mongoose.Types.ObjectId(carId),
    });

    await wishlist.save();
    res.status(201).json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all wishlist
// @route   GET /api/wishlist
const getWishlists = async (req, res) => {
  try {
    const wishlists = await Wishlist.find().populate("user", "name email");
    res.json({ success: true, data: wishlists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single car by ID
// @route   GET /api/cars/:id
const getWishlistById = async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id).populate(
      "user",
      "username email"
    );
    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });
    }
    res.json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWishlistByUserId = async (req, res) => {
  try {
    const wishlists = await Wishlist.find({ user: req.params.id })
      .populate("user", "username email")
      .populate("car");

    if (wishlists.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No wishlists found for this user" });
    }

    res.json({ success: true, data: wishlists });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};

// @desc    Delete a car listing
// @route   DELETE /api/cars/:id
const deleteWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });
    }

    // Ensure the authenticated user is the owner
    if (wishlist.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await wishlist.deleteOne();
    res.json({ success: true, message: "Wishlist deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addWishlist,
  deleteWishlist,
  getWishlists,
  getWishlistById,
  getWishlistByUserId,
};
