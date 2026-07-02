// services/transactionHub.js
const Ledger = require('../models/Ledger');
const Treasury = require('../models/Treasury');

/**
 * The Master Hub: All pillars must use this to route funds.
 * This guarantees the 10% fee is ALWAYS deducted at the source.
 */
exports.processTransaction = async (pillarName, userId, amount, transactionData) => {
    // 1. Calculate 10% Fee
    const serviceFee = amount * 0.10;
    const netAmount = amount - serviceFee;

    // 2. Atomic Logging
    const tx = await Ledger.create({
        pillar: pillarName,
        userId,
        amount,
        serviceFee,
        netAmount,
        status: 'COMPLETED',
        data: transactionData
    });

    // 3. Treasury Routing (Automatic)
    await Treasury.deposit(serviceFee);

    return tx;
};
