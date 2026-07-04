class DataProviderService {
    static async fetchMatchData(matchId) {
        // This is a bridge. It fetches raw data and normalizes it 
        // into a "House-of-Coral Standard Format"
        const raw = await this.callExternalProvider(matchId);
        return {
            id: raw.id,
            sport: raw.sport_category,
            competitors: raw.participants,
            status: raw.state, // e.g., 'SCHEDULED', 'LIVE', 'FINISHED'
            statistics: raw.stats
        };
    }
}
module.exports = DataProviderService;
