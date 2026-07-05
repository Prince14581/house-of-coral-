const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const apiGateway = require('../middleware/apiGateway');

router.use(apiGateway('General'));

router.get('/', async (req, res) => {
  const notes = await notificationService.getRecent(req.user.userId);
  res.status(200).json(notes);
});

router.patch('/:id/read', async (req, res) => {
  const note = await notificationService.markAsRead(req.params.id, req.user.userId);
  res.status(200).json(note);
});

module.exports = router;
