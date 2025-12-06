import { body, validationResult } from 'express-validator';
import sanitizeHtml from 'sanitize-html';

const sanitize = (value) => sanitizeHtml(value);

export const registerValidation = [
  body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be 8+ chars')
    .matches(/\d/).withMessage('Must contain a number')
    .matches(/[!@#$%^&*]/).withMessage('Must contain a special char'),
  body('full_name').trim().notEmpty().customSanitizer(sanitize),
  body('mobile_no').notEmpty().withMessage('Mobile number required'),
  body('gender').isIn(['m', 'f', 'o']).withMessage("Gender must be 'm', 'f', or 'o'"),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
  }
];