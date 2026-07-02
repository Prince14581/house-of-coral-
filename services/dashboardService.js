// services/dashboardService.js
const SystemStatus = require('../models/SystemStatus');
const Ledger = require('../models/Ledger');
const RhythmContent = require('../models/RhythmContent');

exports.getGlobalDashboard = async (userId) => {
    // Aggregates data from multiple pillars
    const [system, activeRhythm, recentActivity] = await Promise.all([
        SystemStatus.findOne({ id: 'global_config' }),
        RhythmContent.findOne({ status: 'LIVE' }),
        Ledger.find({ userId }).sort({ timestamp: -1 }).limit(5)
    ]);

    return {
        isLocked: system.isLocked,
        liveContent: activeRhythm,
        recentActivity,
        timestamp: new Date()
    };
};
