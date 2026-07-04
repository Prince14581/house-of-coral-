const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    txId: { type: String, required: true, unique: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { 
        type: String, 
        enum: ['PURCHASE', 'PLATFORM_FEE', 'SUBSCRIPTION', 'PAYOUT', 'DEPOSIT'],
        required: true 
    },
    status: { type: String, default: 'COMPLETED' }
}, { timestamps: true });

module.exports = mongoose.model('Ledger', ledgerSchema);
