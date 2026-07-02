const mongoose = require('mongoose');

const ReconciliationSchema = new mongoose.Schema({
    vendorId: String,
    period: String, // e.g., "2026-07"
    internalTxId: { type: String, unique: true },
    externalTxId: String,
    amountInternal: Number,
    amountExternal: Number,
    status: { 
        type: String, 
        enum: ['MATCHED', 'DISCREPANCY', 'MISSING_INTERNAL', 'MISSING_EXTERNAL'],
        default: 'MATCHED'
    },
    processedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reconciliation', ReconciliationSchema);
