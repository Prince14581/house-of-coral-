const mongoose = require('mongoose');

const BetSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    gameId: { type: String, required: true },
    amount: { type: Number, required: true },
    odds: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'won', 'lost', 'refunded'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bet', BetSchema);
