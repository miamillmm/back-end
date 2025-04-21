// routes/contactRoutes.js
const express = require("express");
const { handleContactForm } = require("../controllers/contactController");
const router = express.Router();

router.post("/send", handleContactForm);

module.exports = router;
