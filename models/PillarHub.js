const mongoose = require('mongoose');

const pillarHubSchema = new mongoose.Schema({
    streamerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['Stage', 'RhythmHub'], required: true },
    status: { type: String, enum: ['live', 'offline'], default: 'offline' },
    viewerCount: { type: Number, default: 0 },
    startedAt: { type: Date }
});

module.exports = mongoose.model('PillarHub', pillarHubSchema);
