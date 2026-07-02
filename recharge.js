// routes/recharge.js
const express = require('express');
const router = express.Router();
const pillarGuard = require('../middleware/pillarGuard');
const { verifyPayment } = require('../services/paymentService');
const { fulfillRecharge } = require('../services/vtuService');
const Recharge = require('../models/Recharge'); // New model to track state

router.post('/buy-recharge', pillarGuard, async (req, res) => {
    const { userId, phone, amount, provider, reference } = req.body;

    try {
        // 1. Idempotency Check: Prevent duplicate processing of the same reference
        const existing = await Recharge.findOne({ reference });
        if (existing) return res.status(400).json({ error: "Transaction already processed." });

        // 2. Payment Verification (Must be confirmed before proceeding)
        const payment = await verifyPayment(reference);
        if (!payment.isSuccessful) throw new Error("Payment not confirmed.");

        // 3. Create tracking record
        const tx = await Recharge.create({ userId, phone, amount, reference, status: 'PENDING' });

        // 4. Fulfillment
        const result = await fulfillRecharge(phone, amount, provider);
        
        // 5. Finalize State
        tx.status = 'COMPLETED';
        tx.providerResponse = result;
        await tx.save();

        res.json({ success: true, transactionId: tx._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
