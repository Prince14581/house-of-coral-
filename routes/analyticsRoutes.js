const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const apiGateway = require('../middleware/apiGateway');

// Protect analytics access via Gateway
router.use(apiGateway('Bazaar'));

router.get('/dashboard', analyticsController.getVendorDashboard);

module.exports = router;
