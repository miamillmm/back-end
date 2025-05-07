const nodemailer = require('nodemailer');
require('dotenv').config();

const submitReport = async (req, res) => {
  const { carId, reason, description, contact, phone, language } = req.body;
  console.log(req.body)

  // Validate all required fields
  if (!carId || !reason || !description || !contact || !phone) {
    return res.status(400).json({ message: 'Missing required fields: carId, reason, description, contact, and phone are all required' });
  }

  // Configure Nodemailer transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  // Prepare email content
  const subject = language === 'ar' ? 'تقرير جديد عن إعلان' : 'New Report on Listing';
  const text = `
    New Report Submission
    --------------------
    Car ID: ${carId}
    Reason: ${reason}
    Description: ${description}
    Contact Email: ${contact}
    Phone Number: ${phone}
    Language: ${language}
  `;
  const html = `
    <h2>${subject}</h2>
    <p><strong>Car ID:</strong> ${carId}</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p><strong>Description:</strong> ${description}</p>
    <p><strong>Contact Email:</strong> ${contact}</p>
    <p><strong>Phone Number:</strong> ${phone}</p>
    <p><strong>Language:</strong> ${language}</p>
  `;

  // Email options
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.REPORT_EMAIL,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Error sending report email:', error);
    res.status(500).json({ message: 'Error submitting report' });
  }
};

module.exports = { submitReport };