// scripts/ReconcileTreasury.js
require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');

const SECRET_KEY = process.env.TREASURY_SECRET;

async function reconcile() {
    console.log("--- Starting Treasury Reconciliation Audit ---");
    
    await mongoose.connect(process.env.MONGO_URI);
    const transactions = await Transaction.find({});
    
    let tamperedCount = 0;
    let totalExpectedFees = 0;

    for (const tx of transactions) {
        // 1. Verify HMAC Integrity
        const storedSignature = tx.signature;
        
        // Re-create payload for verification (excluding the _id and signature itself)
        const payload = {
            sender: tx.sender,
            receiver: tx.receiver,
            amount: tx.amount,
            fee: tx.fee,
            netAmount: tx.netAmount,
            type: tx.type,
            timestamp: tx.timestamp
        };

        const calculatedSignature = crypto
            .createHmac('sha256', SECRET_KEY)
            .update(JSON.stringify(payload))
            .digest('hex');

        if (storedSignature !== calculatedSignature) {
            console.error(`[ALERT] Tampered Transaction Detected: ID ${tx._id}`);
            tamperedCount++;
        }

        totalExpectedFees += tx.fee;
    }

    console.log(`--- Audit Complete ---`);
    console.log(`Total Transactions Audited: ${transactions.length}`);
    console.log(`Total Fee Volume: ${totalExpectedFees.toFixed(2)}`);
    console.log(`Tampered Records Found: ${tamperedCount}`);

    process.exit(tamperedCount > 0 ? 1 : 0);
}

reconcile().catch(err => {
    console.error("Audit failed to execute:", err);
    process.exit(1);
});
