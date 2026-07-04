const { GovernanceService } = require('../../../core/governance/services/governance.service');
const SettlementEngine = require('../../../core/settlement/services/settlement.service');
const eventBus = require('../../../shared/events/event.bus');

exports.placeWager = async (req, res) => {
    try {
        // 1. Governance Gate
        await GovernanceService.validateAction(req.user.id, 'PLACE_WAGER');

        // 2. Delegate to Settlement
        const { opponentId, amount, matchId } = req.body;
        const result = await SettlementEngine.processTransaction(req.user.id, opponentId, amount, matchId);

        // 3. Event-Driven: Trigger the match engine
        eventBus.publish('WAGER_PLACED', { matchId, amount, participants: [req.user.id, opponentId] });

        res.status(200).json({ success: true, result });
    } catch (error) {
        res.status(403).json({ success: false, error: error.message });
    }
};
