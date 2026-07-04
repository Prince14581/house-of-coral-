const Stream = require('../models/stream.model');
const GovernanceEngine = require('../../../core/governance/governance.engine');

exports.onPublish = async (req, res) => {
    const { streamKey } = req.body; // Sent by streaming server

    try {
        // 1. Find the stream
        const stream = await Stream.findOne({ streamKey });
        if (!stream) return res.status(404).send("Invalid Key");

        // 2. Governance check (Double-check authorization)
        const allowed = await GovernanceEngine.canPerform(stream.creatorId, 'HOST_LIVE');
        if (!allowed) {
            return res.status(403).send("Unauthorized");
        }

        // 3. Update Status
        await Stream.updateOne({ streamKey }, { status: 'live' });
        
        res.status(200).send("OK");
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};
