const { sendEmail } = require("../services/emailService");
const { forgotPasswordEmailTemplate } = require("../services/emailTemplates");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const multer = require("multer");
const path = require("path");
const { default: mongoose } = require("mongoose");
const { default: axios } = require("axios");

const fs = require("fs");


// // Multer Configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     console.log(req.user)
//     const userId = req.user._id; // From JWT middleware
//     const userDir = path.join(__dirname, "uploads", "users", userId);
//     // Create user-specific directory if it doesn't exist
//     if (!fs.existsSync(userDir)) {
//       fs.mkdirSync(userDir, { recursive: true });
//     }
//     cb(null, userDir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `profile-${Date.now()}${ext}`);
//   },
// });

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     if (!file.mimetype.startsWith("image/")) {
//       return cb(new Error("Only images are allowed"));
//     }
//     cb(null, true);
//   },
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
// });

// Generate JWT Token
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    // expiresIn: "7d",
    expiresIn: "365d", // or "365d"
    });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    // maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  });

  return token;
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { username, password, phone } = req.body;

    const userExists = await User.findOne({ phone });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      username,
      password,
      phone,
      role: "user",
    });

    if (user) {
      const jwt = generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        username: user.username,
        phone: user.phone,
        jwt,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Upload Image Endpoint
 const imageUpload= async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imageUrl = `/uploads/users/${req.file.filename}`;

    // Delete old image if it exists
    const user = await User.findById(req.user._id);
    if (user?.profileImage) {
      const oldImagePath = path.join(__dirname, user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user with new profile image
    const result=await User.findByIdAndUpdate(req.user._id, { profileImage: imageUrl });
    console.log(result)

    res.status(200).json({ message: "Image uploaded successfully", imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error uploading image" });
  }
};

// @desc    Login user & set token
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { password, phone } = req.body;
    const user = await User.findOne({ phone });

    if (user && (await user.matchPassword(password))) {
      const jwt = generateToken(res, user._id);
      res.json({
        _id: user._id,
        username: user.username,
        phone: user.phone,
        role: user.role,
        profileImage:user.profileImage,
        jwt,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user & clear token
// @route   POST /api/auth/logout
const logoutUser = (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out successfully" });
};

const handleForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Step 1: Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Step 2: Generate a password reset token (not using the user's password here)
    const resetToken = jwt.sign(
      { email: user.email }, // We pass the email to identify the user
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Step 3: Create the password reset link
    const resetLink = `http://syriasouq.com/change-password/${resetToken}`;

    // Step 4: Email content
    const subject = "Password Reset Request";
    const html = `
      <h1>Password Reset Request</h1>
      <p>We received a request to reset your password. To proceed, click the link below:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    // Step 5: Send the email with the reset link
    await sendEmail(user.email, subject, "", html);

    return res.status(200).json({ message: "Password reset email sent!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to send email",
      error: error.message,
    });
  }
};

const handleChangePassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    // Step 1: Verify the reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    // Step 2: Find the user by email (from the decoded token)
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    // Step 3: Set the new password (no need to hash it manually)
    console.log("Old Password:", user.password);
    console.log("New Password:", newPassword);

    user.password = newPassword; // No manual hashing here

    // Step 4: Save the updated user
    await user.save();

    console.log("User after saving:", user);

    return res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to reset password",
      error: error.message,
    });
  }
};
const PasswordResetToken = mongoose.model('PasswordResetToken', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}));

// Rate limiter: 5 requests per hour per phone number
// const rateLimiter = new RateLimiterMemory({
//   points: 5,
//   duration: 3600, // 1 hour
// });

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit number
};

// Hash OTP using SHA-256
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

// const forgotPassword = async (req, res) => {
//   const { phone } = req.body;

//   if (!phone) {
//     return res.status(400).json({ message: 'Phone number is required' });
//   }

//   try {
//     // Apply rate limiting
//     // await rateLimiter.consume(phone).catch(() => {
//     //   return res.status(429).json({ message: 'Too many requests. Please try again later.' });
//     // });

//     // Find user by phone number
//     const user = await User.findOne({ phone });
//     if (!user) {
//       // Generic response to prevent user enumeration
//       return res.status(200).json({ message: 'If a matching account exists, an OTP has been sent via WhatsApp.' });
//     }
//     console.log(user)
//     // Generate OTP
//     const otp = generateOTP();
//     const otpHash = hashOTP(otp);
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//     // Store hashed OTP in the database
//     await PasswordResetToken.create({
//       userId: user._id,
//       otpHash,
//       expiresAt,
//     });

//     // Send WhatsApp message via WaAPI
//     const waapiResponse = await axios.post(
//       'https://waapi.app/api/v1/instances/64935/client/action/send-message',
//       {
//         // device: process.env.WAAPI_DEVICE,
//         // device: process.env.WAAPI_DEVICE,
//         chatId: `923091905410@c.us`,
//         // chatId: `${phone}@c.us!`,
//         message: `Your OTP to reset your password is: ${otp}\nThis OTP will expire in 10 minutes.`,
//       },
//       {
//         headers: {
//           'Authorization': `Bearer GUVTytxjRztaQMHie8T6iu3cCvXIkoDhat2ss6s8c0a97c23`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );
//     console.log(waapiResponse)
//     if (waapiResponse.status !== 200) {
//       throw new Error('Failed to send WhatsApp message');
//     }

//     res.status(200).json({ message: 'If a matching account exists, an OTP has been sent via WhatsApp.' });
//   } catch (error) {
//     console.error('Forgot Password Error:', error);
//     res.status(500).json({ message: 'Failed to process request. Please try again.' });
//   }
// };


const forgotPassword = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    // Apply rate limiting (uncomment if needed)
    // await rateLimiter.consume(phone).catch(() => {
    //   return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    // });

    // Find user by phone number
    const user = await User.findOne({ phone });
    if (!user) {
      // Generic response to prevent user enumeration
      return res.status(200).json({ message: 'If a matching account exists, an OTP has been sent via WhatsApp.' });
    }
    console.log(user);

    // Check for existing PasswordResetToken for the user
    const existingToken = await PasswordResetToken.findOne({ userId: user._id });
    if (existingToken) {
      // Option 1: Delete the existing token
      await PasswordResetToken.deleteOne({ userId: user._id });
      // Option 2: Alternatively, you could update the existing token (uncomment if preferred)
      // existingToken.otpHash = hashOTP(generateOTP());
      // existingToken.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      // await existingToken.save();
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store hashed OTP in the database
    await PasswordResetToken.create({
      userId: user._id,
      otpHash,
      expiresAt,
    });

    // Send WhatsApp message via WaAPI
    const waapiResponse = await axios.post(
      'https://waapi.app/api/v1/instances/64935/client/action/send-message',
      {
        chatId: `${phone}@c.us`, // Use the user's phone number
        message: `Your OTP to reset your password is: ${otp}\nThis OTP will expire in 10 minutes.`,
      },
      {
        headers: {
          Authorization: `Bearer GUVTytxjRztaQMHie8T6iu3cCvXIkoDhat2ss6s8c0a97c23`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(waapiResponse);

    if (waapiResponse.status !== 200) {
      throw new Error('Failed to send WhatsApp message');
    }

    res.status(200).json({ message: 'If a matching account exists, an OTP barges been sent via WhatsApp.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Failed to process request. Please try again.' });
  }
};
const resetPassword = async (req, res) => {
  const { phone, otp, newPassword } = req.body;

  if (!phone || !otp || !newPassword) {
    return res.status(400).json({ message: 'Phone number, OTP, and new password are required' });
  }

  try {
    // Find OTP in the database
    const otpHash = hashOTP(otp);
    const resetToken = await PasswordResetToken.findOne({
      otpHash,
      expiresAt: { $gt: new Date() },
    });

    if (!resetToken) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Find user by phone number
    const user = await User.findOne({ phone });
    if (!user || user._id.toString() !== resetToken.userId.toString()) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete the used OTP
    await PasswordResetToken.deleteOne({ otpHash });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: 'Failed to reset password. Please try again.' });
  }
};

module.exports = { forgotPassword, resetPassword };
module.exports = {
  registerUser,
  loginUser,
  resetPassword,
  logoutUser,
  handleForgotPassword,
  imageUpload,
  handleChangePassword,
  forgotPassword
};
