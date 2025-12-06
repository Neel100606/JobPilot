import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;

  // 1. Check for token in headers (Bearer Token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Add user ID to request object (so we know WHO is calling the API)
      req.user = decoded; 

      next();
    } catch (error) {
      console.error('Token Verification Failed:', error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};