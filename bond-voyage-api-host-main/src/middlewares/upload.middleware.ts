import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

// File filter - allowed types
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Allowed types: Images (JPEG, PNG, GIF, WebP), PDF, Word documents`
      )
    );
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    files: parseInt(process.env.MAX_FILES || '10'), // 10 files default
  },
});

/**
 * Convert file to base64 for Brevo attachment
 */
export const fileToBase64 = (filePath: string): string => {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString('base64');
};

/**
 * Cleanup uploaded files after processing
 */
export const cleanupFiles = (files: Express.Multer.File[]): void => {
  files.forEach((file) => {
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error(`Error deleting file ${file.path}:`, err);
      } else {
        console.log(`🗑️  Cleaned up file: ${file.filename}`);
      }
    });
  });
};