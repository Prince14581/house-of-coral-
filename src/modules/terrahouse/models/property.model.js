const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    location: { type: String, required: true },
    value: { type: Number, required: true },
    status: { type: String, enum: ['owned', 'for_sale', 'escrow'], default: 'owned' }
});

module.exports = mongoose.model('Property', propertySchema);
