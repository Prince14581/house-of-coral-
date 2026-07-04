const SettlementEngine = require('../../../core/settlement/services/settlement.service');
const GovernanceEngine = require('../../../core/governance/governance.engine');

exports.purchaseItem = async (req, res) => {
    const { listingId, price } = req.body;

    // 1. Policy/Governance Check
    const allowed = await GovernanceEngine.canPerform(req.user.id, 'PURCHASE_ITEM');
    if (!allowed) return res.status(403).json({ message: "Purchase forbidden by governance." });

    // 2. Settle the transaction (The 10% fee happens here automatically)
    const settlement = await SettlementEngine.settleTransaction(
        req.body.sellerId, 
        req.user.id, 
        price
    );

    res.status(200).json({ success: true, message: "Transaction settled.", settlement });
};
