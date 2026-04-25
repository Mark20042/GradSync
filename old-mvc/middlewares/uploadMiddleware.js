// uploadMiddleware.js
const multer = require("multer");
const path = require("path");

// Configure storage for images only
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const prefix = file.fieldname === "resume" ? "resume-" : "avatar-";
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for images and PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only image and PDF files are allowed!"), false);
  }
};

// Limits for image uploads
const limits = {
  fileSize: 50 * 1024 * 1024, // 50MB limit
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

module.exports = upload;
