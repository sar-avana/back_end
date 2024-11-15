const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();


// Add a product to the cart
router.post('/add', authMiddleware, async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (quantity > product.stock) {
            return res.status(400).json({ message: `Only ${product.stock} items available in stock` });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [], totalPrice: 0 });
        }

        const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (existingItemIndex > -1) {
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            if (newQuantity > product.stockQuantity) {
                return res.status(400).json({ message: `Only ${product.stockQuantity - cart.items[existingItemIndex].quantity} more items available in stock` });
            }
            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        // Update the total price
        const totalPricePromises = cart.items.map(async (item) => {
            const itemProduct = await Product.findById(item.product);
            return itemProduct.price * item.quantity;
        });

        const totalPriceArray = await Promise.all(totalPricePromises);
        cart.totalPrice = totalPriceArray.reduce((total, price) => total + price, 0);

        await cart.save();

        res.status(200).json({ cart, totalPrice: cart.totalPrice });
    } catch (error) {
        res.status(500).json({ message: 'Error adding product to cart', error });
    }
});

module.exports = router;

// View cart
router.get('/', authMiddleware, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cart', error });
    }
});


// Reduce the quantity of a product in the cart
router.put('/reduce', authMiddleware, async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity -= quantity;

            if (cart.items[itemIndex].quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            }

            // Update the total price
            const totalPricePromises = cart.items.map(async (item) => {
                const itemProduct = await Product.findById(item.product);
                return itemProduct.price * item.quantity;
            });

            const totalPriceArray = await Promise.all(totalPricePromises);
            cart.totalPrice = totalPriceArray.reduce((total, price) => total + price, 0);

            await cart.save();
            res.status(200).json({ cart, totalPrice: cart.totalPrice });
        } else {
            res.status(404).json({ message: 'Product not found in cart' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating cart', error });
    }
});



module.exports = router;