// services/treasuryService.js
const Treasury = require('../models/Treasury');
const AuditLog = require('../models/AuditLog');

const FEE_PERCENTAGE = 0.10;

exports.processPlatformFee = async (amount, pillarName, transactionId) => {
    const fee = parseFloat((amount * FEE_PERCENTAGE).toFixed(2));

    // Update the central Treasury node
    const treasury = await Treasury.findOneAndUpdate(
        { nodeName: 'PRIMARY_TREASURY' },
        { $inc: { balance: fee } },
        { upsert: true, new: true }
    );

    // Create an immutable audit trail
    await AuditLog.create({
        pillar: pillarName,
        transactionId,
        feeAmount: fee,
        newTreasuryBalance: treasury.balance,
        timestamp: new Date()
    });

    return fee;
};
