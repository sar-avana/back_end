const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', authMiddleware, async (req, res) => {
    try {
        // Fetch user's cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate amount in paise (Razorpay uses INR paise or the smallest unit of currency)
        const amount = cart.totalPrice * 100;

        // Create order options
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: `order_rcptid_${Math.floor(Math.random() * 10000)}`, // Unique receipt ID
            payment_capture: 1, // Automatically capture payment
        };

        // Create order in Razorpay
        const razorpayOrder = await razorpay.orders.create(options);
        res.status(200).json({
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Failed to create Razorpay order', error });
    }
});

router.post('/confirm-order', authMiddleware, async (req, res) => {
    try {
        const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

        // (Optional) Verify the Razorpay signature for added security
        // Implementation of signature verification is available in Razorpay documentation

        // Fetch user’s cart and ensure it’s not empty
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate total price of the order
        const totalPrice = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);

        // Create an order from cart items
        const order = new Order({
            user: req.user._id,
            items: cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                totalPrice: item.product.price * item.quantity
            })),
            totalPrice,
            paymentStatus: 'Paid', // Assuming payment is completed
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

        res.status(201).json({ message: 'Order confirmed successfully', order });
    } catch (error) {
        console.error('Error confirming order:', error);
        res.status(500).json({ message: 'Error confirming order', error });
    }
});

module.exports = router;