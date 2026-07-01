const express = require('express');
const router = express.Router();
const jubileeController = require('../controllers/jubileeController');
const { verifyUser } = require('../middleware/auth');

router.post('/buy-ticket', verifyUser, jubileeController.buyTicket);

module.exports = router;
