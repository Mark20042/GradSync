import multer from "multer";

// Use memory storage — files are stored as Buffers in req.file.buffer
// Then we upload to Cloudinary in the controller
const storage = multer.memoryStorage();

// File filter to only accept images and PDFs
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image and PDF files are allowed!"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});
