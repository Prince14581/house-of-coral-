// src/modules/Governance/ProposalService.js

class ProposalService {
    static async castVote(userId, proposalId, voteChoice) {
        const proposal = await Proposal.findById(proposalId);
        
        // Refined Logic: Check expiration
        if (new Date() > proposal.expiresAt) {
            proposal.status = 'EXPIRED';
            await proposal.save();
            throw new Error('Proposal has expired');
        }

        if (proposal.status !== 'ACTIVE') throw new Error('Proposal not active');
        
        // ... (Existing voting logic)
    }

    // Cron job to run daily to mark expired proposals
    static async expireStaleProposals() {
        await Proposal.updateMany(
            { status: 'ACTIVE', expiresAt: { $lt: new Date() } },
            { $set: { status: 'EXPIRED' } }
        );
    }
}
