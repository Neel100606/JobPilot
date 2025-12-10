import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserByMobile } from '../models/userModel.js';
import admin from '../config/firebase.js'; 
import db from '../config/db.js'; 

// @desc    Register a new user
export const registerUser = async (req, res) => {
  try {
    const { email, password, full_name, gender, mobile_no } = req.body;

    // 1. Check if email already exists
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      // CASE A: User exists AND is already verified -> STOP THEM
      if (existingUser.is_mobile_verified) {
        return res.status(400).json({ success: false, message: 'Email already exists and is verified. Please login.' });
      }

      // CASE B: User exists but is NOT verified -> UPDATE THEM (Retry Registration)
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const updateQuery = `
        UPDATE users 
        SET full_name = $1, password = $2, gender = $3, mobile_no = $4, updated_at = CURRENT_TIMESTAMP
        WHERE email = $5
        RETURNING id;
      `;
      
      try {
        const { rows } = await db.query(updateQuery, [full_name, hashedPassword, gender, mobile_no, email]);
        return res.status(200).json({
          success: true,
          message: 'Registration updated. Please verify mobile OTP.',
          data: { user_id: rows[0].id }
        });
      } catch (updateError) {
        if (updateError.code === '23505') { 
             return res.status(400).json({ success: false, message: 'Mobile number already in use by another account.' });
        }
        throw updateError; 
      }
    }

    // 2. Check if mobile number is taken by another verified user
    const existingMobile = await findUserByMobile(mobile_no);
    if (existingMobile) {
        if (existingMobile.is_mobile_verified) {
             return res.status(400).json({ success: false, message: 'Mobile number already in use by another verified account.' });
        }
        return res.status(400).json({ success: false, message: 'Mobile number linked to a pending registration.' });
    }

    // 3. CASE C: New User -> CREATE THEM
    const hashedPassword = await bcrypt.hash(password, 10);
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
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};

// @desc    Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.is_mobile_verified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Mobile verification incomplete. Please verify your number to login.' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

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
        is_mobile_verified: user.is_mobile_verified,
        is_email_verified: user.is_email_verified // Sending this status to frontend
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Verify mobile via Firebase OTP
export const verifyMobile = async (req, res) => {
  try {
    const { idToken, mobile_no } = req.body;

    if (!idToken || !mobile_no) {
      return res.status(400).json({ success: false, message: 'Missing token or mobile number' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
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

// @desc    Verify email (Updates Postgres)
// @route   GET /api/auth/verify-email
export const verifyEmail = async (req, res) => {
  try {
    const { email } = req.query; // Expecting ?email=...

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

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
      message: 'Email status updated to verified in Database',
      data: rows[0],
    });

  } catch (error) {
    console.error('Email Verification Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};