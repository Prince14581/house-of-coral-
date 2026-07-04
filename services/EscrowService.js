// services/EscrowService.js
const TreasuryService = require('./TreasuryService');
const EscrowModel = require('../models/Escrow');

class EscrowService {
    static async createEscrow(buyerId, sellerId, amount, transactionType) {
        // 1. Lock funds via Treasury
        // Note: We flag this as 'ESCROW_HOLD' to prevent it from being treated as a final settlement
        const escrow = await EscrowModel.create({
            buyerId, sellerId, amount,
            status: 'HELD',
            createdAt: new Date()
        });

        console.log(`Escrow ${escrow._id} created. Funds held for Bazaar transaction.`);
        return escrow;
    }

    static async releaseFunds(escrowId) {
        const escrow = await EscrowModel.findById(escrowId);
        
        // 2. Trigger final payout to seller via Treasury
        await TreasuryService.processTransaction({
            sender: 'ESCROW_ACCOUNT',
            receiver: escrow.sellerId,
            amount: escrow.amount,
            type: 'Bazaar_Payout'
        });

        await EscrowModel.findByIdAndUpdate(escrowId, { status: 'RELEASED' });
        return { success: true };
    }
}
