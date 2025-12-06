import bcrypt from 'bcrypt';
import { createUser, findUserByEmail, findUserByMobile } from '../models/userModel.js';
import jwt from 'jsonwebtoken';

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