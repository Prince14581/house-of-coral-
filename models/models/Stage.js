const mongoose = require('mongoose');

const StageSchema = new mongoose.Schema({
    streamerId: { type: String, required: true },
    title: { type: String, required: true },
    status: { type: String, enum: ['offline', 'live'], default: 'offline' },
    streamKey: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Stage', StageSchema);
