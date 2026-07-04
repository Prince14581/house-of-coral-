const Stream = require('../models/stream.model');
const GovernanceEngine = require('../../../core/governance/governance.engine');
const YieldService = require('../../../core/treasury/services/yield.service');

class StageService {
    static async startStream(creatorId, title) {
        // Governance check: Is this user allowed to stream?
        const allowed = await GovernanceEngine.canPerform(creatorId, 'HOST_LIVE');
        if (!allowed) throw new Error("Tier upgrade required for live streaming.");

        return await Stream.create({ creatorId, title, status: 'live' });
    }

    static async processEngagement(creatorId, engagementVolume) {
        // Automatically reward the streamer using the Yield Engine
        return await YieldService.processActivityYield(
            creatorId, 
            'LIVE_STREAM_ENGAGEMENT', 
            engagementVolume
        );
    }
}

module.exports = StageService;
