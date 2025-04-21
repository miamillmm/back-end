const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    priceUSD: { type: String, required: true },
    priceSYP: { type: String, required: false },
    year: { type: String, required: true },
    kilometer: { type: String, required: true },
    engineSize: { type: String, required: false },
    location: { type: String, required: false },
    transmission: { type: String, required: false },
    fuelType: { type: String, required: false },
    exteriorColor: { type: String, required: false },
    interiorColor: { type: String, required: false },
    features: [{ type: String, required: true }],
    description: { type: String, required: true },
    images: [{ type: String }], // Array of image paths
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Car", carSchema);
