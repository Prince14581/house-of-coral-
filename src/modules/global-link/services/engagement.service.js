const YieldService = require('../../../core/treasury/services/yield.service');

// Listen for high-engagement events
socialEvents.on('POST_TRENDING', async (data) => {
    // Reward the creator for high engagement
    await YieldService.processActivityYield(data.authorId, 'SOCIAL_TRENDING', 1);
});
