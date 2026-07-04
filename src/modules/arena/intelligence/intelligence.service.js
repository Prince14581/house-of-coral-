const DataProviderService = require('../../../core/arena/services/data.provider.service');
const eventBus = require('../../../shared/events/event.bus');

class IntelligenceService {
    static async syncMatch(matchId) {
        const data = await DataProviderService.fetchMatchData(matchId);
        
        // Broadcast the update so other modules react instantly
        eventBus.publish('MATCH_DATA_UPDATED', { matchId, data });
        
        return data;
    }
}
module.exports = IntelligenceService;
