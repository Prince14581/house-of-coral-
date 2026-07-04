const eventBus = require('../../../shared/events/event.bus');
const AnalyticsEntry = require('../models/analytics.model');

class AnalyticsService {
    static init() {
        console.log("[Analytics] Engine active. Monitoring platform events...");

        // Subscribe to ALL significant business events
        const trackedEvents = [
            'ORDER_COMPLETED', 
            'WAGER_PLACED', 
            'USER_FOLLOWED', 
            'USER_REGISTERED', 
            'PLATFORM_FEE'
        ];

        trackedEvents.forEach(eventName => {
            eventBus.on(eventName, (data) => {
                this.recordEvent(eventName, data);
            });
        });
    }

    static async recordEvent(eventName, data) {
        await AnalyticsEntry.create({
            event: eventName,
            payload: data,
            timestamp: new Date()
        });
    }
}

module.exports = AnalyticsService;
