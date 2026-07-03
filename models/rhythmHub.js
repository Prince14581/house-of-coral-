// /modules/rhythmHub.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per window
});

router.get('/stream', limiter, (req, res) => {
    res.send('Rhythm Hub: Music & Comedy Stream');
});

module.exports = router;
