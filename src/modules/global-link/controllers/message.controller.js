const { MessageService } = require('../services/message.service');
const GovernanceEngine = require('../../../core/governance/governance.engine');

exports.sendMessage = async (req, res) => {
    const { recipientId, content } = req.body;

    // Check if user is allowed to send messages (Policy Engine)
    const allowed = await GovernanceEngine.canPerform(req.user.id, 'SEND_MESSAGE');
    if (!allowed) return res.status(403).json({ message: "Trust Score too low to message." });

    const message = await MessageService.send(req.user.id, recipientId, content);
    res.status(200).json({ success: true, data: message });
};
