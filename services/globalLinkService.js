// services/globalLinkService.js
const GlobalLink = require('../models/globalLink');
const LedgerEngine = require('../src/core/ledger/services/ledger.service');

class GlobalLinkService {
    /**
     * Create a connection between two users across pillars
     */
    static async createConnection(userId, targetUserId, pillarContext) {
        const connection = await GlobalLink.create({
            userId,
            targetUserId,
            pillarContext,
            status: 'ACTIVE',
            createdAt: new Date()
        });

        // Log to ledger for audit trail
        await LedgerEngine.record(userId, 0, 'GLOBAL', {
            action: 'CONNECTION_CREATED',
            targetUser: targetUserId,
            pillar: pillarContext
        });

        return connection;
    }

    /**
     * Disconnect users
     */
    static async removeConnection(connectionId) {
        const result = await GlobalLink.findByIdAndUpdate(connectionId, {
            status: 'INACTIVE',
            removedAt: new Date()
        });
        return result;
    }

    /**
     * Get all active connections for a user
     */
    static async getUserConnections(userId) {
        return await GlobalLink.find({
            $or: [{ userId }, { targetUserId: userId }],
            status: 'ACTIVE'
        }).sort({ createdAt: -1 });
    }

    /**
     * Broadcast a message across pillars
     */
    static async broadcastMessage(userId, message, targetPillars) {
        // Create notification records for each pillar
        const notifications = [];
        for (const pillar of targetPillars) {
            notifications.push({
                userId,
                message,
                pillar,
                status: 'PENDING',
                createdAt: new Date()
            });
        }
        
        // Record in ledger
        await LedgerEngine.record(userId, 0, 'GLOBAL', {
            action: 'BROADCAST',
            pillars: targetPillars,
            messageCount: targetPillars.length
        });

        return notifications;
    }
}

module.exports = GlobalLinkService;
