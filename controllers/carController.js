const Car = require("../models/Car");
const { sendEmail } = require("../services/emailService");
const {
  carListingApprovalEmailTemplate,
  newCarNotificationTemplate,
} = require("../services/emailTemplates");

// @desc    Add a new car
// @route   POST /api/cars
// const addCar = async (req, res) => {
//   try {
//     const {
//       make,
//       model,
//       priceUSD,
//       priceSYP,
//       year,
//       kilometer,
//       engineSize,
//       location,
//       transmission,
//       fuelType,
//       exteriorColor,
//       interiorColor,
//       selectedFeatures,
//       description,
//     } = req.body;

//     // Handle image uploads
//     const images = req.files ? req.files.map((file) => file.filename) : [];
//    console.log(images)
//     // Convert features to an array if it's a string
//     const parsedFeatures =
//       typeof selectedFeatures === "string"
//         ? JSON.parse(selectedFeatures)
//         : selectedFeatures;
//   console.log("test")
//     const car = new Car({
//       user: req.user.id, // Ensure user is authenticated
//       make,
//       model,
//       priceUSD,
//       priceSYP,
//       year,
//       kilometer,
//       engineSize,
//       location,
//       transmission,
//       fuelType,
//       exteriorColor,
//       interiorColor,
//       features: parsedFeatures,
//       description,
//       images,
//     });
//     console.log(car)

//     await car.save();

//     // Notify the admin after saving the car
//     // const subject = "New Car Listed for Approval";
//     // const html = newCarNotificationTemplate(
//     //   make,
//     //   model,
//     //   priceUSD,
//     //   req.user.email
//     // );
//     // await sendEmail(process.env.EMAIL_USER, subject, "", html);

//     res.status(201).json({ success: true, data: car });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Update car listing
// // @route   PUT /api/cars/:id
// const updateCar = async (req, res) => {
//   try {
//     const car = await Car.findById(req.params.id).populate(
//       "user",
//       "username phone"
//     );
//     if (!car) {
//       return res.status(404).json({ success: false, message: "Car not found" });
//     }

//     console.log("Cars from hit: ", car, "from request User: ", req.user);

//     // Ensure the authenticated user is the owner of the car
//     if (
//       car.user._id.toString() !== req.user.id &&
//       req?.user?.role !== "admin"
//     ) {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }

//     // Update fields if provided
//     car.make = req.body.make || car.make;
//     car.model = req.body.model || car.model;
//     car.priceUSD = req.body.priceUSD || car.priceUSD;
//     car.priceSYP = req.body.priceSYP || car.priceSYP;
//     car.year = req.body.year || car.year;
//     car.kilometer = req.body.kilometer || car.kilometer;
//     car.engineSize = req.body.engineSize || car.engineSize;
//     car.location = req.body.location || car.location;
//     car.transmission = req.body.transmission || car.transmission;
//     car.fuelType = req.body.fuelType || car.fuelType;
//     car.exteriorColor = req.body.exteriorColor || car.exteriorColor;
//     car.interiorColor = req.body.interiorColor || car.interiorColor;
//     car.features = req.body.features
//       ? JSON.parse(req.body.features)
//       : car.features;
//     car.description = req.body.description || car.description;
//     car.status = 'pending';

//     // Update images if new ones are uploaded
//     if (req.files && req.files.length > 0) {
//       car.images = req.files.map((file) => file.filename);
//     }

//     await car.save();

//     // if (car.status !== "pending" || car.status !== "sold")
//     // await approveCarListing(car?.user?.email, car.make);

//     res.json({ success: true, data: car });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const addCar = async (req, res) => {
  try {
    const {
      make,
      model,
      priceUSD,
      priceSYP,
      year,
      kilometer,
      engineSize,
      location,
      transmission,
      fuelType,
      exteriorColor,
      interiorColor,
      selectedFeatures,
      description,
    } = req.body;

    // Handle image uploads
    const images = req.files ? req.files.map((file) => file.filename) : [];

    // Convert features to an array if it's a string
    const parsedFeatures =
      typeof selectedFeatures === "string"
        ? JSON.parse(selectedFeatures)
        : selectedFeatures;

    const car = new Car({
      user: req.user.id, // Ensure user is authenticated
      make,
      model,
      priceUSD,
      priceSYP,
      year,
      kilometer,
      engineSize,
      location,
      transmission,
      fuelType,
      exteriorColor,
      interiorColor,
      features: parsedFeatures,
      description,
      images,
      status: 'pending', // Set status to pending for admin approval
    });

    await car.save();

    // Notify the admin after saving the car
    const subject = "New Car Listed for Approval";
    const html = newCarNotificationTemplate(
      make,
      model,
      priceUSD,
      req.user.email
    );
    await sendEmail(process.env.EMAIL_USER, subject, "", html);

    res.status(201).json({ success: true, data: car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update car listing
// @route   PUT /api/cars/:id
const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate(
      "user",
      "username phone"
    );
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    // Ensure the authenticated user is the owner of the car
    if (
      car.user._id.toString() !== req.user.id &&
      req?.user?.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Update fields if provided
    car.make = req.body.make || car.make;
    car.model = req.body.model || car.model;
    car.priceUSD = req.body.priceUSD || car.priceUSD;
    car.priceSYP = req.body.priceSYP || car.priceSYP;
    car.year = req.body.year || car.year;
    car.kilometer = req.body.kilometer || car.kilometer;
    car.engineSize = req.body.engineSize || car.engineSize;
    car.location = req.body.location || car.location;
    car.transmission = req.body.transmission || car.transmission;
    car.fuelType = req.body.fuelType || car.fuelType;
    car.exteriorColor = req.body.exteriorColor || car.exteriorColor;
    car.interiorColor = req.body.interiorColor || car.interiorColor;
    car.features = req.body.features
      ? JSON.parse(req.body.features)
      : car.features;
    car.description = req.body.description || car.description;
    car.status = req.body.status || car.status;
    // Update images if new ones are uploaded
    if (req.files && req.files.length > 0) {
      car.images = req.files.map((file) => file.filename);
    }

    await car.save();

    // Notify the admin after updating the car
    const subject = "Car Listing Updated for Approval";
    const html = newCarNotificationTemplate(
      car.make,
      car.model,
      car.priceUSD,
      req.user.email
    );
    await sendEmail(process.env.EMAIL_USER, subject, "", html);

    res.json({ success: true, data: car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all cars
// @route   GET /api/cars
// const getCars = async (req, res) => {
//   try {
//     const cars = await Car.find().populate("user", "username email phone");
//     res.set("Content-Range", `cars 0-${cars.length}/${cars.length}`); // 👈 Required for React Admin
//     res.json({ success: true, data: cars });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const getCars = async (req, res) => {
  try {
    // Check if there's a filter in the request (e.g., ?status=available)
    const filter = req.query.status ? { status: req.query.status } : {};

    const cars = await Car.find(filter)
      .populate("user", "username email phone")
      .sort({ createdAt: -1 });

    // Debugging: Log API response
    // console.log("Cars API Response:", cars);

    // Ensure response structure
    const responseData = { success: true, data: cars };

    // Ensure headers for React Admin pagination
    res.set("Content-Range", `cars 0-${cars.length}/${cars.length}`);
    res.set("Access-Control-Expose-Headers", "Content-Range");

    res.json(responseData); // ✅ Ensure response contains `data`
  } catch (error) {
    console.error("Error in getCars:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// const getCars = async (req, res) => {
//   try {
//     const cars = await Car.find().populate("user", "username email phone");

//     res.json({
//       success: true,
//       data: cars.map((car) => ({
//         id: car._id, // Ensure there's an "id" field
//         make: car.make,
//         model: car.model,
//         priceUSD: car.priceUSD,
//         priceSYP: car.priceSYP,
//         year: car.year,
//         kilometer: car.kilometer,
//         engineSize: car.engineSize,
//         location: car.location,
//         transmission: car.transmission,
//         fuelType: car.fuelType,
//         exteriorColor: car.exteriorColor,
//         interiorColor: car.interiorColor,
//         selectedFeatures: car.selectedFeatures,
//         description: car.description,
//         images: car.images,
//         user: car.user, // Populated user info
//       })),
//       total: await Car.countDocuments(), // Add "total" field
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// @desc    Get a single car by ID
// @route   GET /api/cars/:id
const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate(
      "user",
      "username email phone"
    );
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }
    res.json({ success: true, data: car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCarByUserId = async (req, res) => {
  try {
    const cars = await Car.find({ user: req.params.id }).populate(
      "user",
      "username email"
    );

    if (cars.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No cars found for this user" });
    }

    res.json({ success: true, data: cars });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};

const getCarsByUserId = async (req, res) => {
  try {
    const cars = await Car.find({ user: req.params.id }).populate(
      "user",
     "username phone profileImage"
    );

    if (cars.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No cars found for this user" });
    }

    res.json({ success: true, data: cars });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};

// @desc    Delete a car listing
// @route   DELETE /api/cars/:id
const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    // Ensure the authenticated user is the owner of the car
    if (
      car.user._id.toString() !== req.user.id &&
      req?.user?.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await car.deleteOne();
    res.json({ success: true, message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveCarListing = async (carOwnerEmail, carTitle) => {
  const subject = "Your Car Listing is Approved!";
  const html = carListingApprovalEmailTemplate(carTitle);

  try {
    // Send the email
    await sendEmail(carOwnerEmail, subject, "", html);
  } catch (error) {
    // Log the error if the email failed to send
    console.error("Failed to send email", error.message);
    throw new Error("Failed to send email");
  }
};

module.exports = {
  addCar,
  updateCar,
  deleteCar,
  getCars,
  getCarById,
  getCarByUserId,
  getCarsByUserId
};
