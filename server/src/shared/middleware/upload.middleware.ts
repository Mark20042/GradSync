import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM _dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save to the root "uploads" folder
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const prefix = file.fieldname === 'resume' ? 'resume-' : 
                   file.fieldname === 'tor' ? 'tor-' :
                   file.fieldname === 'businessPermit' ? 'permit-' : 'avatar-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to only accept images and PDFs
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image and PDF files are allowed!'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});
