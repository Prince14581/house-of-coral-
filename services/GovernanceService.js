// services/GovernanceService.js
const DisputeModel = require('../models/Dispute');
const EscrowService = require('./EscrowService');

class GovernanceService {
    /**
     * Initiates a formal dispute for an escrow transaction
     */
    static async initiateDispute(escrowId, reason, complainantId) {
        return await DisputeModel.create({
            escrowId,
            reason,
            complainantId,
            status: 'OPEN',
            evidence: []
        });
    }

    /**
     * Resolves a dispute and triggers financial settlement
     */
    static async resolveDispute(disputeId, decision) {
        const dispute = await DisputeModel.findById(disputeId);
        
        // Logic: 'REFUND_BUYER' or 'RELEASE_TO_SELLER'
        if (decision === 'REFUND_BUYER') {
            await EscrowService.refundFunds(dispute.escrowId);
        } else if (decision === 'RELEASE_TO_SELLER') {
            await EscrowService.releaseFunds(dispute.escrowId);
        }

        return await DisputeModel.findByIdAndUpdate(disputeId, { 
            status: 'RESOLVED', 
            decision 
        });
    }
}
