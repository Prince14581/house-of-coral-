const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const apiGateway = require('../middleware/apiGateway');

router.use(apiGateway('General'));

router.post('/upload', mediaController.uploadMedia);

module.exports = router;
