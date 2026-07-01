const mongoose = require('mongoose');

const RelationshipSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        required: true, 
        index: true 
    },
    targetUserId: { 
        type: String, 
        required: true, 
        index: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'connected', 'blocked'], 
        default: 'pending' 
    },
    interests: { 
        type: [String], 
        default: [] 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Create a compound index to prevent duplicate requests
RelationshipSchema.index({ userId: 1, targetUserId: 1 }, { unique: true });

module.exports = mongoose.model('Relationship', RelationshipSchema);
