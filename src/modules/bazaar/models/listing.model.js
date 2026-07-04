const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, enum: ['active', 'sold', 'withdrawn'], default: 'active' }
});

module.exports = mongoose.model('Listing', listingSchema);
