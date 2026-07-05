const express = require('express');
const router = express.Router();
const jubileeController = require('../controllers/jubileeController');
const apiGateway = require('../middleware/apiGateway');

// Use Gateway for all Jubilee actions
router.use(apiGateway('Jubilee'));

router.get('/events', jubileeController.listEvents); // Implemented via query filters
router.post('/events/:eventId/book', jubileeController.bookTicket);
router.post('/events/create', jubileeController.createEvent);

module.exports = router;
