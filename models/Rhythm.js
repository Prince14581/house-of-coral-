const mongoose = require('mongoose');

const RhythmSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    category: { type: String, enum: ['Music', 'Comedy'], required: true },
    url: { type: String, required: true }, // Link to stream
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rhythm', RhythmSchema);
