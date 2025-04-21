// services/emailTemplates.js

/**
 * Template for the contact form submission email.
 * @param {string} name
 * @param {string} email
 * @param {string} phone
 * @param {string} message
 * @returns {string} HTML content for the email
 */
const contactFormEmailTemplate = (name, email, phone, message) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #2c3e50;">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    </div>
  `;
};

/**
 * Template for the forgot password email.
 * @param {string} resetLink - The link to reset the password.
 * @returns {string} HTML content for the email
 */
const forgotPasswordEmailTemplate = (resetLink) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #2c3e50;">Password Reset Request</h2>
      <p>We received a request to reset your password. Click the link below to reset it:</p>
      <a href="${resetLink}" style="color: #e74c3c; font-weight: bold;">Reset Your Password</a>
      <p>If you didn't request a password reset, please ignore this email.</p>
    </div>
  `;
};

/**
 * Template for the car listing approval email.
 * @param {string} carTitle - The title of the approved car listing.
 * @returns {string} HTML content for the email
 */
const carListingApprovalEmailTemplate = (carTitle) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #2c3e50;">Your Car Listing is Approved!</h2>
      <p>Good news! Your car listing for "<strong>${carTitle}</strong>" has been approved and is now live on our platform.</p>
      <p>Thank you for choosing our service!</p>
    </div>
  `;
};

/**
 * Template for notifying the admin of a new car listing.
 * @param {string} make - The car make.
 * @param {string} model - The car model.
 * @param {string} priceUSD - The car price in USD.
 * @param {string} userEmail - The email of the user who listed the car.
 * @returns {string} HTML content for the email.
 */
const newCarNotificationTemplate = (make, model, priceUSD, userEmail) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #2c3e50;">New Car Listing for Approval</h2>
      <p>A new car has been listed on the platform. Here are the details:</p>
      <ul>
        <li><strong>Make:</strong> ${make}</li>
        <li><strong>Model:</strong> ${model}</li>
        <li><strong>Price (USD):</strong> $${priceUSD}</li>
        <li><strong>Listed by:</strong> ${userEmail}</li>
      </ul>
      <p>Please review and approve the listing.</p>
    </div>
  `;
};

module.exports = {
  contactFormEmailTemplate,
  forgotPasswordEmailTemplate,
  carListingApprovalEmailTemplate,
  newCarNotificationTemplate,
};
