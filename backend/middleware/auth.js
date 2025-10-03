const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const isGuestUser = req.header('X-Guest-User') === 'true';
    
    // If it's a guest user, create a mock user object
    if (isGuestUser) {
      req.user = {
        _id: 'guest-user',
        name: 'Guest User',
        email: 'guest@example.com',
        role: 'hr',
        isGuest: true
      };
      return next();
    }
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = (req, res, next) => {
  // Guest users have limited access - they can't perform admin actions
  if (req.user.isGuest) {
    return res.status(403).json({ message: 'Access denied. Guest users cannot perform admin actions.' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

module.exports = { auth, adminAuth };

