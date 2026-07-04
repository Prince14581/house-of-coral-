const LedgerEntry = require('../models/ledgerEntry.model');
const crypto = require('crypto');

class LedgerEngine {
    static async record(userId, amount, pillar, metadata) {
        return await LedgerEntry.create({
            transactionId: crypto.randomUUID(),
            accountId: userId,
            type: amount >= 0 ? 'CREDIT' : 'DEBIT',
            amount: Math.abs(amount),
            pillar,
            metadata
        });
    }
}
module.exports = LedgerEngine;
