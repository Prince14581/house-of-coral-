// services/ArenaMatchmakingService.js
const Identity = require('../models/Identity');
const ArenaQueue = require('../models/ArenaQueue'); // Temporary storage for active queue

class ArenaMatchmakingService {
    /**
     * Attempts to find a match for a user
     * @param {string} userId 
     * @param {number} rankRange - Skill variance allowed
     */
    static async findMatch(userId, rankRange = 100) {
        const userIdentity = await Identity.findOne({ userId });
        
        // Gatekeeper: Only users with sufficient TrustScore can enter the queue
        if (userIdentity.trustScore < 300) {
            throw new Error('Trust Score too low to enter the Arena.');
        }

        // Find potential opponents within rank range
        const potentialOpponents = await ArenaQueue.find({
            rank: { 
                $gte: userIdentity.rank - rankRange, 
                $lte: userIdentity.rank + rankRange 
            },
            userId: { $ne: userId }
        }).sort({ trustScore: -1 }); // Priority to higher trust

        if (potentialOpponents.length > 0) {
            return this.createMatch(userId, potentialOpponents[0]);
        } else {
            // Add user to queue if no match found
            await ArenaQueue.create({ userId, rank: userIdentity.rank, trustScore: userIdentity.trustScore });
            return { status: 'QUEUED' };
        }
    }

    static async createMatch(p1, p2) {
        // Logic to move both users to a GameSession object
        console.log(`Match created: ${p1} vs ${p2.userId}`);
        return { status: 'MATCHED', opponent: p2.userId };
    }
}
