// repositories/TreasuryRepository.js
const TransactionModel = require('../models/Transaction');

class TreasuryRepository {
    static async logTransaction(data) {
        return await TransactionModel.create(data);
    }
    
    static async getTreasuryBalance() {
        // Aggregate all fees collected
        return await TransactionModel.aggregate([
            { $group: { _id: null, total: { $sum: "$fee" } } }
        ]);
    }
}

module.exports = TreasuryRepository;
