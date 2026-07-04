const eventBus = require('../../../shared/events/event.bus');
const PredictionService = require('../prediction/prediction.service');

// When the Intelligence Engine updates a match, the Prediction module
// automatically closes the window for strategy submissions if the match goes LIVE.
eventBus.on('MATCH_DATA_UPDATED', async (data) => {
    if (data.data.status === 'LIVE') {
        await PredictionService.lockSubmissions(data.matchId);
        console.log(`[Arena] Predictions locked for live match: ${data.matchId}`);
    }
});
