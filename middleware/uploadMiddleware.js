const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Function to create storage dynamically
 * @param {string} folder - The subfolder inside 'uploads/' (e.g., 'cars', 'messages')
 * @returns {multer.StorageEngine}
 */
const createStorage = (folder) => {
  const uploadDir = `uploads/${folder}/`;

  // Ensure the folder exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
};

// File upload filter (only images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|heic|heif|tiff|bmp|svg|avif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only images (jpeg, jpg, png, gif, webp, heic, heif, tiff, bmp, svg, avif) are allowed"
      )
    );
  }
};

/**
 * Function to generate an upload middleware dynamically
 * @param {string} folder - The subfolder where files will be stored
 * @param {boolean} multiple - Whether multiple files should be allowed
 * @param {number} maxFiles - Maximum number of files if multiple is true
 * @returns {multer.Middleware}
 */
const uploadMiddleware = (folder, multiple = false, maxFiles = 5) => {
  const upload = multer({ storage: createStorage(folder), fileFilter });

  return multiple ? upload.array("images", maxFiles) : upload.single("image");
};

module.exports = uploadMiddleware;
