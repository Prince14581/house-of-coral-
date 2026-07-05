const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Open search endpoint (No Gateway middleware required for public discovery)
router.get('/unified', searchController.searchUnified);

module.exports = router;
