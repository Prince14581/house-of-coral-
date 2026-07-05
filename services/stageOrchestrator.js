const crypto = require('crypto');
const StageSession = require('../models/StageSession');

class StageOrchestrator {
  // Generate a secure, unique ingest key for streamers
  async generateStreamKey(streamerId) {
    const key = crypto.createHmac('sha256', process.env.STREAM_SECRET)
                      .update(`${streamerId}-${Date.now()}`)
                      .digest('hex');
    return key;
  }

  // Update session status when a stream goes live
  async initiateBroadcast(streamKey) {
    const session = await StageSession.findOneAndUpdate(
      { streamKey },
      { status: 'live', startTime: new Date() },
      { new: true }
    );
    return session;
  }
}

module.exports = new StageOrchestrator();
