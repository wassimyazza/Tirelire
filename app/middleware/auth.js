import jwt from 'jsonwebtoken';
import 'dotenv/config';


export const checkAuth = (req, res, next) => {
  const token = req.headers.token;
  
  if (!token) {
    return res.json({ success: false, message: 'Please login' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next(); 
  } catch (error) {
    return res.json({ success: false, message: 'Invalid token' });
  }
};

export const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only!' });
  }
  next();
};