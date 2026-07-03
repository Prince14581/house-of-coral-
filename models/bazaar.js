// /modules/bazaar.js
const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');

router.post('/purchase', async (req, res) => {
    const { userId, itemDescription, amount } = req.body;

    // 1. Calculate 10% Fee
    const fee = amount * 0.10;
    const netAmount = amount - fee;

    try {
        // 2. Log to Secure Ledger
        const newTransaction = new Transaction({
            userId,
            itemDescription,
            amount,
            fee,
            netAmount,
            treasuryStatus: 'processing'
        });

        await newTransaction.save();

        // 3. Routing logic to Private Treasury Node
        // This is a placeholder for your internal treasury API/Smart Contract
        await routeToTreasury(fee);

        newTransaction.treasuryStatus = 'completed';
        await newTransaction.save();

        res.status(200).json({ 
            message: 'Purchase successful', 
            details: { amount, feeCharged: fee } 
        });
    } catch (error) {
        res.status(500).json({ error: 'Transaction failed, check ledger logs.' });
    }
});

async function routeToTreasury(amount) {
    console.log(`Secured treasury transfer initiated for: ${amount}`);
    // Integration logic for private treasury node goes here
}

module.exports = router;
