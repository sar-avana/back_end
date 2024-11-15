const express = require('express');
const Category = require('../models/Category');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth'); // Import adminAuth middleware
const authMiddleware = require('../middleware/authMiddleware');


// Middleware to protect routes
router.use(authMiddleware); // Apply authMiddleware to all routes


// Create a new category (Admin only)
router.post('/', adminAuth, async (req, res) => {
    const { name } = req.body;
    try {
        const newCategory = new Category({ name });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error });
    }
});

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
});

// Update an existing category (Admin functionality)
router.put('/:id',adminAuth, async (req, res) => {
    const { name } = req.body;

    try {
        // Find the category by ID and update its name
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true } // Return the updated category
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: 'Error updating category', error });
    }
});


// Delete a category (Admin functionality)
router.delete('/:id',adminAuth, async (req, res) => {
    try {
        // Find the category by ID and delete it
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);

        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error });
    }
});


module.exports = router;
