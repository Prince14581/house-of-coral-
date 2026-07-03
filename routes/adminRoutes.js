const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth'); // Your existing JWT middleware
const isAdmin = require('../middleware/adminMiddleware');
const { runTransactionSimulator } = require('../utils/transactionSimulator');

router.post('/run-simulation', verifyToken, isAdmin, async (req, res) => {
    try {
        const { userCount, txPerUser } = req.body;
        // Run simulator
        await runTransactionSimulator(userCount || 10, txPerUser || 5);
        res.status(200).json({ message: "Simulation completed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Simulation failed", error: error.message });
    }
});

module.exports = router;
