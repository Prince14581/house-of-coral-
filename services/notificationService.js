const Notification = require('../models/Notification');

class NotificationService {
  async create(userId, pillar, message, data = {}) {
    const note = await Notification.create({ userId, pillar, message, data });

    // Assuming global.io is initialized in server.js
    if (global.io) {
      global.io.to(userId.toString()).emit('new_notification', note);
    }
    return note;
  }

  async getRecent(userId) {
    return await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
  }

  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );
  }
}

module.exports = new NotificationService();
