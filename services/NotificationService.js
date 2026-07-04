// services/NotificationService.js
const io = require('../sockets/SocketServer'); // Your existing Socket.io instance

class NotificationService {
    /**
     * Send event to a specific user
     */
    static send(userId, eventType, data) {
        // Namespace-based broadcasting for security
        io.to(`user_${userId}`).emit('notification', {
            type: eventType,
            data,
            timestamp: new Date()
        });
    }

    /**
     * Example: Notify user of dispute resolution
     */
    static notifyDisputeResolution(userId, disputeId, decision) {
        this.send(userId, 'DISPUTE_RESOLVED', { disputeId, decision });
    }
}

module.exports = NotificationService;
