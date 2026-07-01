const express = require('express');
const router = express.Router();
const arenaController = require('../controllers/arenaController');
const { verifyUser } = require('../middleware/auth');

router.post('/bet', verifyUser, arenaController.placeBet);
router.post('/settle', verifyUser, arenaController.settleBet); // Admin restricted in production
module.exports = router;
