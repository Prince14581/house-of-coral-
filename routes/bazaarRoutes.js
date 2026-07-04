const express = require('express');
const router = express.Router();
const bazaarController = require('../controllers/bazaarController');
const { verifyUser } = require('../middleware/auth');

// Bazaar Marketplace Routes
router.post('/add', verifyUser, bazaarController.createItem);
router.get('/items', bazaarController.listItems);
router.get('/items/:id', bazaarController.getItem);
router.post('/purchase', verifyUser, bazaarController.purchaseItem);
router.delete('/items/:id', verifyUser, bazaarController.deleteItem);
router.get('/my-listings', verifyUser, bazaarController.getMyListings);

module.exports = router;
