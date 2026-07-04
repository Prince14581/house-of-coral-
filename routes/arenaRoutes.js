const express = require('express');
const router = express.Router();
const arenaController = require('../controllers/arenaController');
const { verifyUser } = require('../middleware/auth');

// Arena Wager Routes
router.post('/bet', verifyUser, arenaController.placeBet);
router.post('/settle', verifyUser, arenaController.settleBet);
router.get('/wagers/:userId', verifyUser, arenaController.getWagers);
router.get('/leaderboard', arenaController.getLeaderboard);

module.exports = router;
