// /modules/adminDashboard.js
const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');

// GET: View all transactions and total treasury balance
router.get('/treasury-stats', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ timestamp: -1 });
        
        // Calculate total treasury balance
        const totalTreasury = transactions
            .filter(t => t.treasuryStatus === 'completed')
            .reduce((sum, t) => sum + t.fee, 0);

        res.json({
            totalTreasury,
            transactionCount: transactions.length,
            recentTransactions: transactions.slice(0, 10)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch treasury data' });
    }
});

module.exports = router;
