const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/placeOrder', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Retrieve user's cart
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Check stock availability for each item
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);
            if (item.quantity > product.stock) {
                return res.status(400).json({ message: `Only ${product.stock} items available for ${product.name}` });
            }
        }

        // Calculate total price of the order
        const totalPrice = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);

        // Create an order from cart items
        const order = new Order({
            user: userId,
            items: cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                totalPrice: item.product.price * item.quantity
            })),
            totalPrice,
            paymentStatus: 'Pending', 
            deliveryStatus: 'Processing'
        });

        await order.save();

        // Update stock for each product
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);
            product.stock -= item.quantity;
            await product.save();
        }
        
        // Clear the cart after order placement
        cart.items = [];
        await cart.save();

        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Error placing order', error });
    }
});

router.get('/history', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).json({ message: 'Error fetching order history', error });
    }
});


module.exports = router;