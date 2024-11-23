const jwt = require('jsonwebtoken');

const adminAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', req.headers.authorization);  // Log the header

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or malformed.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    if (decoded.userType !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    req.user = decoded; // Add decoded token to the request for further use
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = adminAuthMiddleware;
