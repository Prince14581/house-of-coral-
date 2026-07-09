// terraHouseRoutes.js
const express = require('express');
const router = express.Router();
const terraHouseController = require('../controllers/terraHouseController');
const { verifyUser } = require('../middleware/auth');

// TerraHouse Real Estate Routes
router.post('/list', verifyUser, terraHouseController.listProperty);
router.get('/properties', terraHouseController.getAllProperties);
router.get('/search', terraHouseController.searchNearby);
router.get('/properties/:id', terraHouseController.getProperty);
router.post('/purchase', verifyUser, terraHouseController.purchaseProperty);
router.get('/my-properties', verifyUser, terraHouseController.getMyProperties);

module.exports = router;
