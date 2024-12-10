const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Route to create the Razorpay payment order
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
      const { orderId } = req.body;  // Get the orderId from request body
      
      // Fetch the order using the orderId
      const order = await Order.findById(orderId).populate('items.product');
      if (!order) {
          return res.status(400).json({ message: 'Order not found' });
      }

      // Calculate the total amount in paise (Razorpay uses smallest unit of currency)
      const amount = order.totalPrice * 100;  // Convert to paise

      // Create Razorpay order options
      const options = {
          amount: amount, // amount in paise
          currency: 'INR',
          receipt: `order_rcptid_${Math.floor(Math.random() * 10000)}`, // Unique receipt ID
          payment_capture: 1, // Automatically capture payment
      };

      // Create the order in Razorpay
      const razorpayOrder = await razorpay.orders.create(options);

      // Store the Razorpay order ID in your database
      order.razorpayOrderId = razorpayOrder.id;
      console.log('Before saving order:', order);
      await order.save();
      console.log('After saving order:', order);


      // Send Razorpay order details back to frontend
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


// Route to confirm the order after payment
router.post('/confirm-order', authMiddleware, async (req, res) => {
  try {
      const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

      // Fetch the order using the Razorpay order ID
      const order = await Order.findOne({ razorpayOrderId }).populate('items.product');
      console.log('Fetched Order:', order);
      if (!order) {
          return res.status(400).json({ message: 'Order not found' });
      }
      // Assuming the payment is confirmed, update order status
      order.paymentStatus = 'Paid';  // Update the payment status to "Paid"
      order.deliveryStatus = 'Processing';  // Change delivery status to "Processing"

      await order.save();

      // Update the stock for each product in the order
      for (const item of order.items) {
          const product = await Product.findById(item.product._id);
          product.stock -= item.quantity;  // Decrease stock based on quantity
          await product.save();
      }

      res.status(201).json({ message: 'Order confirmed successfully', order });
  } catch (error) {
      console.error('Error confirming order:', error);
      res.status(500).json({ message: 'Error confirming order', error });
  }
});


// Handler to fetch payment details for an order by orderId
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;  // Extract orderId from URL params
    
    // Fetch the order using the orderId
    const order = await Order.findById(id).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the order is already paid
    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    // Return the order details for payment
    res.status(200).json({
      orderId: order._id,
      totalPrice: order.totalPrice,
      paymentStatus: order.paymentStatus,
      items: order.items,
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ message: 'Error fetching payment details', error });
  }
});

// Use raw body parser to handle Razorpay's signature verification
router.use(bodyParser.raw({ type: 'application/json' }));

// Webhook route to handle payment events
router.post('/webhook', async (req, res) => {
  try {
    // Secret key for Razorpay webhook
    const webhookSecret = 'YxhPzCpv5rpnR@9';

    const body = req.body;
    const receivedSignature = req.headers['x-razorpay-signature'];

    // Create the expected signature from the payload
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const expectedSignature = hmac.update(body).digest('hex');

    // Verify the signature
    if (receivedSignature === expectedSignature) {
      const paymentData = JSON.parse(body);

      // Handle the payment success event
      if (paymentData.event === 'payment.captured') {
        console.log('Payment Successful:', paymentData);
        // Update your database to mark the order as paid, etc.
      } else {
        console.log('Other event:', paymentData);
        // Handle other events such as payment failure
      }

      res.status(200).send('Event received');
    } else {
      console.log('Signature mismatch');
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});


module.exports = router;
