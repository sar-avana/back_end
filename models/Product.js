const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    stockQuantity: Number,
    imageUrl: String
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
