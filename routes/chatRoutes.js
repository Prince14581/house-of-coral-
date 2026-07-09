const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/:senderId/:receiverId', chatController.getMessages);

module.exports = router;
