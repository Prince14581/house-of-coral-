const WagerEngine = require('../../../core/arena/services/wager.service');
const GovernanceEngine = require('../../../core/governance/governance.engine');

exports.joinMatch = async (req, res) => {
    // 1. Policy Check: Does this user have a high enough Trust Score to bet?
    const allowed = await GovernanceEngine.canPerform(req.user.id, 'JOIN_ARENA');
    if (!allowed) return res.status(403).json({ message: "Access Denied: Arena requires higher Trust Score." });

    // 2. Lock the wager
    const wager = await WagerEngine.createWager(req.user, req.body.opponent, req.body.amount);
    res.status(200).json({ success: true, wager });
};
