const { sendEmail } = require("../services/emailService");
const { forgotPasswordEmailTemplate } = require("../services/emailTemplates");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT Token
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  handleForgotPassword,
  handleChangePassword,
};
