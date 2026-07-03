// /modules/arena.js
const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');

router.post('/place-bet', async (req, res) => {
    const { userId, betAmount, eventId } = req.body;
    
    // Calculate 10% fee for the house
    const fee = betAmount * 0.10;
    
    try {
        const transaction = new Transaction({
            userId,
            itemDescription: `Bet placed on event: ${eventId}`,
            amount: betAmount,
            fee,
            netAmount: betAmount - fee,
            treasuryStatus: 'completed'
        });

        await transaction.save();
        res.status(200).json({ message: 'Bet accepted', feeCharged: fee });
    } catch (error) {
        res.status(500).json({ error: 'Arena transaction error' });
    }
});

module.exports = router;
