// middleware/adminMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (user && user.userType === 'ADMIN') {
            req.user = user;
            next();  // Proceed if admin
        } else {
            return res.status(403).json({ message: 'Access denied. Admins only' });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = isAdmin;
