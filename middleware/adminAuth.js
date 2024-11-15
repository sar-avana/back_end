// middleware/adminAuth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if user is an admin
const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        req.user = user;
        next(); // Proceed if user is admin
    } catch (err) {
        res.status(401).json({ message: 'Not authorized.' });
    }
};

module.exports = adminAuth;
