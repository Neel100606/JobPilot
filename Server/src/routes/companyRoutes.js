import express from 'express';
import { registerCompany, uploadImage } from '../controllers/companyController.js'; // Import uploadImage
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js'; // Import multer

const router = express.Router();

router.post('/register', protect, registerCompany);

// Route for Logo
router.post('/upload-logo', protect, upload.single('logo'), uploadImage);

// Route for Banner
router.post('/upload-banner', protect, upload.single('banner'), uploadImage);

export default router;