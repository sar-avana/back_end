const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User'); // Import the User model
const cors = require('cors'); 

// Load environment variables
dotenv.config();

const app = express();

app.use(cors());

// Middleware to parse JSON
app.use(bodyParser.json());

// MongoDB connection URI
const mongoURI = process.env.MONGO_URI;

// Set the timeout options
mongoose.connect(mongoURI, {
    
    connectTimeoutMS: 10000, // Timeout after 10 seconds
    socketTimeoutMS: 45000  // Socket timeout after 45 seconds
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Basic API route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const path = require('path');

// Serve static files from React app
app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Register route
app.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;  // Accept role in the request

    // Simple validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user instance, assigning role (if not provided, default is 'user')
        user = new User({ name, email, password, role: role || 'user' });

        // Save user to MongoDB
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

const loginRoutes = require('./routes/loginRoutes');
app.use('/login', loginRoutes); //Import Cart Routes

const productRoutes = require('./routes/productRoutes'); // Import the product routes
app.use('/products', productRoutes); // Mount the product routes at /products

const categoryRoutes = require('./routes/categoryRoutes'); //Import Category routes
app.use('/categories', categoryRoutes);

const filterroutes = require('./routes/filterroutes'); //Import filter routes
app.use('/filter', filterroutes);

const cartRoutes = require('./routes/cartRoutes');
app.use('/cart', cartRoutes); //Import Cart Routes

const orderRoutes = require('./routes/orderRoutes');
app.use('/order', orderRoutes); //Import order Routes

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/payment', paymentRoutes); //Import Payment Routes

const userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes); //Import user Routes

const addressRoutes = require('./routes/addressRoutes');
app.use('/address', addressRoutes); //Import address Routes


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
