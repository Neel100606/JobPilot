import express from 'express';
import { 
  registerCompany, 
  uploadImage, 
  getCompanyProfile,  // Import this
  updateCompanyProfile // Import this
} from '../controllers/companyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Register (Create)
router.post('/register', protect, registerCompany);

// Profile Management (Read & Update)
router.get('/profile', protect, getCompanyProfile); // GET Endpoint
router.put('/profile', protect, updateCompanyProfile); // PUT Endpoint

// Image Uploads
// what this upload.single('logo') does is that it tells multer to expect a single file upload with the field name 'logo' or 'banner' respectively.
// if its name is not logo or banner, multer will not process the file and req.file will be undefined in the controller.
router.post('/upload-logo', protect, upload.single('logo'), uploadImage);
router.post('/upload-banner', protect, upload.single('banner'), uploadImage);

export default router;