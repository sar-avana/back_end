// routes/addressRoutes.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Address = require('../models/Address');

const router = express.Router();

// Add a new address
router.post('/', authMiddleware, async (req, res) => {
    const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country } = req.body;
    try {
        const newAddress = new Address({
            user: req.user._id,
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
        });
        await newAddress.save();
        res.status(201).json(newAddress);
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'Failed to add address', error });
    }
});

// Get all addresses for a user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id });
        res.status(200).json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ message: 'Failed to fetch addresses', error });
    }
});

// Update an address
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country } = req.body;
    try {
        const updatedAddress = await Address.findOneAndUpdate(
            { _id: id, user: req.user._id },
            { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country },
            { new: true }
        );
        if (!updatedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json(updatedAddress);
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Failed to update address', error });
    }
});

// Delete an address
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedAddress = await Address.findOneAndDelete({ _id: id, user: req.user._id });
        if (!deletedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Failed to delete address', error });
    }
});

module.exports = router;
