const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    status: { type: String, enum: ['live', 'offline'], default: 'offline' },
    viewerCount: { type: Number, default: 0 },
    streamKey: { type: String, required: true, unique: true }, // For RTMP
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Stream', streamSchema);
