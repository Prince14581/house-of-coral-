const mongoose = require('mongoose');

const transactionHistorySchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    // This links directly to your TreasuryLogs transactionId for auditing
    transactionId: { 
        type: String, 
        required: true 
    },
    purchasePrice: { 
        type: Number, 
        required: true 
    },
    pillar: { 
        type: String, 
        default: 'Bazaar' 
    },
    status: { 
        type: String, 
        enum: ['completed', 'refunded'], 
        default: 'completed' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('TransactionHistory', transactionHistorySchema);
