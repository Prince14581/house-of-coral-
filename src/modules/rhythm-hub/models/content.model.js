const mongoose = require('mongoose');

const rhythmContentSchema = new mongoose.Schema({
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    mediaUrl: { type: String, required: true },
    type: { type: String, enum: ['MUSIC', 'COMEDY_SKIT', 'PODCAST'], required: true },
    royaltySplit: { type: Number, default: 0.10 }, // 10% royalty to platform treasury node
    status: { type: String, enum: ['pending', 'live', 'flagged'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RhythmContent', rhythmContentSchema);
