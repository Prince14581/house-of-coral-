// /modules/terraHouse.js
const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');

// Mock property listings
const properties = [{ id: 1, name: 'Coral Villa', price: 5000 }];

router.post('/buy-property', async (req, res) => {
    const { userId, propertyId, amount } = req.body;
    
    // Calculate 10% fee as required by platform policy
    const fee = amount * 0.10;
    
    try {
        const transaction = new Transaction({
            userId,
            itemDescription: `Property purchase: ${propertyId}`,
            amount,
            fee,
            netAmount: amount - fee,
            treasuryStatus: 'completed'
        });

        await transaction.save();
        res.status(200).json({ message: 'Property acquired, fee processed', fee });
    } catch (error) {
        res.status(500).json({ error: 'TerraHouse transaction failed' });
    }
});

module.exports = router;
