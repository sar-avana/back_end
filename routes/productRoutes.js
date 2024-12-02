const express = require('express');
const Product = require('../models/Product');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth'); // Import adminAuth middleware
const authMiddleware = require('../middleware/authMiddleware');
const Category = require('../models/Category');


// Middleware to protect routes
router.use(authMiddleware); // Apply authMiddleware to all routes


// Create a new product (Admin functionality)
router.post('/', adminAuth, async (req, res) => {
    const { name, description, price, category, stockQuantity, imageUrl } = req.body;

    try {
        // Check if category exists
        const categoryData = await Category.findOne({ name: category });
        if (!categoryData) {
            return res.status(400).json({ message: 'Category does not exist. Please create it first.' });
        }

        // Create new product
        const newProduct = new Product({
            name,
            description,
            price,
            category: categoryData._id,  // Store category ID reference
            stockQuantity,
            imageUrl
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error });
    }
});

// Get all products or search products by name (No admin check needed)
router.get('/', async (req, res) => {
    const { query } = req.query; // Get the query parameter for searching

    try {
        let products;
        if (query) {
            // Search products by name if query exists
            products = await Product.find({ name: { $regex: query, $options: 'i' } }); // Case-insensitive search
        } else {
            // If no query, return all products
            products = await Product.find();
        }

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
});


// Get a single product by ID (No admin check needed)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error });
    }
});

// Update a product (Admin functionality)
router.put('/:id', adminAuth, async (req, res) => {
    const { name, description, price, category, stockQuantity, imageUrl } = req.body;

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, price, category, stockQuantity, imageUrl },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
});

// Delete a product (Admin functionality)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
});

module.exports = router;
