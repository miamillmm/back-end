const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Function to create storage dynamically
 * @param {string} folder - The subfolder inside 'Uploads/' (e.g., 'cars', 'messages')
 * @returns {multer.StorageEngine}
 */
const createStorage = (folder) => {
  const uploadDir = `Uploads/${folder}/`;

  // Ensure the folder exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
};

// File upload filter (only images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|heic|heif|tiff|bmp|svg|avif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images (jpeg, jpg, png, gif, webp, heic, heif, tiff, bmp, svg, avif) are allowed"));
  }
};

/**
 * Function to generate an upload middleware dynamically
 * @param {string} folder - The subfolder where files will be stored
 * @param {boolean} multiple - Whether multiple files should be allowed
 * @param {number} maxFiles - Maximum number of files if multiple is true
 * @returns {multer.Middleware}
 */
const uploadMiddleware = (folder, multiple = false, maxFiles = 20) => {
  const upload = multer({
    storage: createStorage(folder),
    fileFilter,
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB per file
        files: maxFiles, // Max 20 files
        fieldNameSize: 100, // Max field name length (in bytes)
        fieldSize: 1024 * 1024, // Max field value size (1MB for non-file fields)
        fields: 50, // Max number of non-file fields
    
    },
  });

  return multiple ? upload.array("images", maxFiles) : upload.single("image");
};

// Handle multer errors
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.set({
      'Access-Control-Allow-Origin': 'https://syriasouq.com',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large (max 20MB)' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: `Too many files (max ${err.limit})` });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected field in file upload' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    res.set({
      'Access-Control-Allow-Origin': 'https://syriasouq.com',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = uploadMiddleware;