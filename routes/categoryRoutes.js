const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Public access for filters
router.get('/:pillar', categoryController.getCategoryTree);

// Administrative access only
// router.post('/', apiGateway('Admin'), categoryController.createCategory);

module.exports = router;
