const mongoose = require('mongoose');

const ledgerEntrySchema = new mongoose.Schema({
    transactionId: { type: String, required: true, unique: true }, // Idempotency key
    accountId: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: { type: String, enum: ['DEBIT', 'CREDIT'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'HFC' },
    pillar: { type: String, required: true }, // Bazaar, Arena, etc.
    metadata: { type: Object }, // e.g., { eventId: '...', orderId: '...' }
    createdAt: { type: Date, default: Date.now }
});

// Index for fast audit lookups
ledgerEntrySchema.index({ accountId: 1, createdAt: -1 });

module.exports = mongoose.model('LedgerEntry', ledgerEntrySchema);
