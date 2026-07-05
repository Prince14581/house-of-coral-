const EventBus = require('./pubSubService');

class DataSyncService {
  constructor() {
    this.pillars = ['Bazaar', 'Stage', 'Rhythm', 'Jubilee', 'TerraHouse', 'Arena', 'GlobalLink'];
  }

  /**
   * Pushes profile updates to the entire ecosystem
   */
  async broadcastProfileUpdate(userId, updatedData) {
    console.log(`[DataSync] Propagating profile update for user: ${userId}`);

    // Publish to a global channel that all pillars subscribe to
    await EventBus.publish('user.profile.updated', {
      userId,
      data: updatedData,
      timestamp: Date.now()
    });
  }

  /**
   * Each pillar calls this listener to update their local cache/database
   */
  initSubscriber(pillarName) {
    EventBus.subscribe('user.profile.updated', (payload) => {
      console.log(`[${pillarName}] Syncing local profile for ${payload.userId}`);
      // Logic to update local database collection here
    });
  }
}

module.exports = new DataSyncService();
