// services/streamService.js
const Stream = require('../models/Stream'); // Assume a Stream schema exists

exports.initiateStream = async (userId, title) => {
    // 1. Logic to signal to your media server to start ingest
    const stream = await Stream.create({
        ownerId: userId,
        title,
        status: 'LIVE',
        startTime: new Date()
    });
    return { streamId: stream._id, rtmpKey: `rtmp://live.houseofcoral.com/app/${stream._id}` };
};

exports.endStream = async (streamId) => {
    await Stream.findByIdAndUpdate(streamId, { status: 'ENDED', endTime: new Date() });
};
