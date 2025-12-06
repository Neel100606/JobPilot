import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { registerValidation } from '../middleware/validate.js';

const router = express.Router();

// Register Route
router.post('/register', registerValidation, registerUser);

// Login Route
router.post('/login', loginUser);

export default router;