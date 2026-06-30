const express = require('express');
const router = express.Router();
const stageController = require('../controllers/stageController');

// Route to check stream status
router.get('/status', stageController.getStreamStatus);

module.exports = router;
