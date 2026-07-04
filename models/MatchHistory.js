// models/MatchHistory.js
const mongoose = require('mongoose');

const matchHistorySchema = new mongoose.Schema({
    matchId: { type: String, required: true, unique: true },
    players: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        result: { type: String, enum: ['WIN', 'LOSS', 'DRAW'] },
        score: Number
    }],
    duration: Number, // In seconds
    isFlagged: { type: Boolean, default: false }, // Set to true if anomalies detected
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MatchHistory', matchHistorySchema);
