import multer from 'multer';
import path from 'path';

// Use memory storage to keep file in buffer (better for Cloudinary upload streams)
// OR use disk storage if you prefer saving to a temp folder first.
// Here we use disk storage for simplicity in debugging.
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only (jpeg, jpg, png)!');
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});