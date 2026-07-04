const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance: { type: Number, default: 0 },
    bonusBalance: { type: Number, default: 0 }, // First-time bonus pool
    status: { type: String, enum: ['active', 'frozen'], default: 'active' }
});

module.exports = mongoose.model('Wallet', walletSchema);
