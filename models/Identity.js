// models/Identity.js
const mongoose = require('mongoose');

const identitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    kycStatus: { 
        type: String, 
        enum: ['PENDING', 'VERIFIED', 'FAILED', 'REJECTED'], 
        default: 'PENDING' 
    },
    kycLevel: { type: Number, default: 0 },
    trustScore: { type: Number, default: 0, min: 0, max: 1000 },
    verificationDocs: [{
        docType: String,
        providerRef: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    lastScoreUpdate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Identity', identitySchema);
