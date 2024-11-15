const express = require('express');
const Product = require('../models/Product');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Category = require('../models/Category');


// Middleware to protect routes
router.use(authMiddleware); // Apply authMiddleware to all routes


// Get products with filtering
router.post('/', async (req, res) => {
    const { category } = req.body;

    let filter = {};

    try {
        // Filter by category if provided
        if (category) {
            const categoryData = await Category.findOne({ name: category });
            if (categoryData) {
                filter.category = categoryData._id; // Use the _id of the found category
            } else {
                // If category is provided but not found, return empty result
                return res.status(404).json({ message: 'Category not found' });
            }
        }

        // Find products that match the filter criteria
        const products = await Product.find(filter).populate('category'); // Populate category for better response

        // If no products are found, return a not found response
        if (Product.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }

        res.status(200).json(products); // Return filtered products
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching products', error });
    }
});

module.exports = router;