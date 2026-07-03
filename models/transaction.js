// /models/transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    itemDescription: { type: String, required: true },
    amount: { type: Number, required: true },
    fee: { type: Number, required: true }, // 10% Platform Fee
    netAmount: { type: Number, required: true }, // Amount after fee
    treasuryStatus: { type: String, default: 'pending' },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
