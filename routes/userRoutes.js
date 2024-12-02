// routes/userRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs')
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// Update profile information
router.put('/profile', authMiddleware, async (req, res) => {
    const { name, email, phoneNumber } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, email, phoneNumber },
            { new: true }
        );
        res.status(200).json({ message: 'Profile updated', user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile', error });
    }
});

router.put('/update-password', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { newPassword } = req.body;

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        console.log('Hashed Password:', hashedPassword); // Debugging log

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Failed to update password' });
    }
});


module.exports = router;
