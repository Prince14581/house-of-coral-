// routes/heartStrings.js
const express = require('express');
const router = express.Router();
const pillarGuard = require('../middleware/pillarGuard');
const { sendConnectionRequest } = require('../services/heartStringsService');

router.use(pillarGuard);

router.post('/connect', async (req, res) => {
    try {
        const result = await sendConnectionRequest(req.user.id, req.body.targetId);
        res.json({ success: true, status: result.status });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
