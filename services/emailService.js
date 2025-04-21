// services/emailService.js
const nodemailer = require("nodemailer");

// Create reusable transporter object using the default SMTP transport.
const transporter = nodemailer.createTransport({
  service: "gmail", // or use any other email service provider
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

/**
 * Send an email.
 * @param {string} to - The recipient email address.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The plain text body of the email.
 * @param {string} html - The HTML content of the email.
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // sender address
    to, // list of receivers
    subject, // Subject line
    text, // plain text body
    html, // HTML body content
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Failed to send email: " + error.message);
  }
};

module.exports = { sendEmail };
