import bcrypt from 'bcrypt';
import { createUser, findUserByEmail, findUserByMobile } from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import admin from '../config/firebase.js'; 
import db from '../config/db.js';

export const registerUser = async (req, res) => {
  try {
    const { email, password, full_name, gender, mobile_no } = req.body;

    // 1. Check if user already exists
    if (await findUserByEmail(email)) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    if (await findUserByMobile(mobile_no)) {
      return res.status(400).json({ success: false, message: 'Mobile number already exists' });
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save User
    const newUser = await createUser({
      email,
      password: hashedPassword,
      full_name,
      gender,
      mobile_no
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify mobile OTP.',
      data: { user_id: newUser.id }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 3. Generate JWT (90 days validity as per requirements)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '90d' } 
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token, 
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        is_mobile_verified: user.is_mobile_verified
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// @desc    Verify mobile via Firebase OTP
// @route   POST /api/auth/verify-mobile
// @access  Public (No JWT required yet, uses Firebase Token)
export const verifyMobile = async (req, res) => {
  try {
    const { idToken, mobile_no } = req.body;

    if (!idToken || !mobile_no) {
      return res.status(400).json({ success: false, message: 'Missing token or mobile number' });
    }

    // 1. Verify the Firebase Token using Admin SDK
    // This ensures the request actually came from a verified Firebase login
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Optional: Security check to ensure token belongs to the specific phone number
    if (decodedToken.phone_number !== mobile_no) {
       // Note: Firebase phone numbers often have standard formatting (+91...), ensure formats match
       console.warn("Warning: Token phone number mismatch", decodedToken.phone_number, mobile_no);
    }

    // 2. Update Postgres Database
    const query = `
      UPDATE users 
      SET is_mobile_verified = TRUE, updated_at = CURRENT_TIMESTAMP 
      WHERE mobile_no = $1 
      RETURNING id, mobile_no, is_mobile_verified
    `;
    const { rows } = await db.query(query, [mobile_no]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Mobile verification successful',
      data: rows[0],
    });

  } catch (error) {
    console.error('Mobile Verification Error:', error);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// @desc    Verify email via Firebase link
// @route   GET /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    // Expecting ?email=user@example.com in the URL
    const { email } = req.query; 

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Update Postgres Database
    const query = `
      UPDATE users 
      SET is_email_verified = TRUE, updated_at = CURRENT_TIMESTAMP 
      WHERE email = $1 
      RETURNING id, email, is_email_verified
    `;
    const { rows } = await db.query(query, [email]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: rows[0],
    });

  } catch (error) {
    console.error('Email Verification Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};