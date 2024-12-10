const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User'); // Ensure the User model is imported

router.get('/role', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Assuming the authMiddleware sets req.user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.role) {
            return res.status(400).json({ message: 'Role is not defined for this user' });
        }

        return res.json({ role: user.role });
    } catch (error) {
        console.error('Error fetching user role:', error);
        return res.status(500).json({ message: 'Error fetching user role', error });
    }
});

module.exports = router;
