// services/rhythmTransitionEngine.js
const RhythmContent = require('../models/RhythmContent');

exports.performTransition = async () => {
    try {
        const now = new Date();

        // 1. Archive current LIVE content
        await RhythmContent.updateMany(
            { status: 'LIVE' },
            { status: 'ARCHIVED' }
        );

        // 2. Find and activate next scheduled content
        const nextContent = await RhythmContent.findOneAndUpdate(
            { 
                status: 'PENDING', 
                scheduledAt: { $lte: now } 
            },
            { status: 'LIVE' },
            { sort: { scheduledAt: 1 }, new: true }
        );

        if (nextContent) {
            console.log(`Transition Success: ${nextContent.title} is now LIVE.`);
        }
        return nextContent;
    } catch (err) {
        console.error("Transition Logic Error:", err.message);
        throw err;
    }
};
