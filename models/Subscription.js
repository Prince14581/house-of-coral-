// src/modules/Treasury/subscription/Subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
    plan: { type: String, enum: ['BASIC', 'PRO', 'ELITE'], default: 'BASIC' },
    status: { type: String, enum: ['ACTIVE', 'PAST_DUE', 'CANCELLED'], default: 'ACTIVE' },
    nextBillingDate: { type: Date, required: true },
    price: Number
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
