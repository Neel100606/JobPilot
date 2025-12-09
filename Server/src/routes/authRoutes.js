import express from 'express';
import { 
    registerUser, 
    loginUser, 
    verifyMobile, // Import this
    verifyEmail   // Import this
} from '../controllers/authController.js';
import { registerValidation } from '../middleware/validate.js';

const router = express.Router();

// Existing Routes
router.post('/register', registerValidation, registerUser);
router.post('/login', loginUser);

// New Verification Routes
router.post('/verify-mobile', verifyMobile); // POST request
router.get('/verify-email', verifyEmail);    // GET request

export default router;