// models/HeartStrings.js
const mongoose = require('mongoose');

const HeartStringsSchema = new mongoose.Schema({
    userA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
        type: String, 
        enum: ['PENDING', 'CONNECTED', 'BLOCKED'], 
        default: 'PENDING' 
    },
    updatedAt: { type: Date, default: Date.now }
});

// Prevent duplicate relationship entries
HeartStringsSchema.index({ userA: 1, userB: 1 }, { unique: true });

module.exports = mongoose.model('HeartStrings', HeartStringsSchema);
