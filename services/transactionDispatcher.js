// services/transactionDispatcher.js
const { requestTreasuryTransfer } = require('./vaultGateway');

/**
 * The Escrow Engine: Processes transfers atomically.
 * @param {Object} txData { senderId, receiverId, amount, pillarType, activityId }
 */
exports.processEscrow = async (txData) => {
    try {
        const { senderId, receiverId, amount, pillarType } = txData;
        
        // 1. Validation: Ensure sufficient balance (Mock Logic)
        // In production, integrate your Balance Ledger check here
        if (amount <= 0) throw new Error("Invalid transaction amount");

        // 2. The 10% Treasury Interception
        const treasuryFee = amount * 0.10;
        const userEarnings = amount * 0.90;

        // 3. Ghost Vault Routing (The 10%)
        // This sends the fee to your private node automatically
        await requestTreasuryTransfer(treasuryFee, { 
            type: 'escrow_fee', 
            pillar: pillarType,
            activityId: txData.activityId 
        });

        // 4. Distribution to Receiver (The 90%)
        // Update user wallets in the ledger
        console.log(`Escrow Success: ${userEarnings} released to ${receiverId}`);
        return { success: true, earned: userEarnings };

    } catch (err) {
        console.error("Escrow Engine Error:", err.message);
        throw new Error("Transaction failed at the Dispatcher level");
    }
};
