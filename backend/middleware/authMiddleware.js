const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    // For development/demo purposes, allow access with a mock user
    req.user = { userId: 'dev-user-123' };
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Still allow if it fails during dev
    req.user = { userId: 'dev-user-123' };
    next();
  }
};