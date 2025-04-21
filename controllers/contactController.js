// controllers/contactController.js
const { sendEmail } = require("../services/emailService");
const { contactFormEmailTemplate } = require("../services/emailTemplates");

const handleContactForm = async (req, res) => {
  const { name, email, phone, message } = req.body;

  const subject = "New Contact Form Submission";
  const html = contactFormEmailTemplate(name, email, phone, message);

  try {
    await sendEmail(process.env.EMAIL_USER, subject, "", html);
    return res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to send email", error: error.message });
  }
};

module.exports = { handleContactForm };
