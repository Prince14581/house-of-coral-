// src/services/identity/IdentityService.js
const Identity = require('./IdentityModel');

class IdentityService {
    /**
     * Updates user reputation based on platform actions
     * @param {string} userId 
     * @param {number} points (Positive for good, negative for bad)
     */
    static async updateTrustScore(userId, points) {
        const user = await Identity.findOneAndUpdate(
            { userId },
            { $inc: { trustScore: points } },
            { new: true }
        );
        return user;
    }

    static async getProfile(userId) {
        return await Identity.findOne({ userId }).select('-otpSecret'); // Never leak secrets
    }
}

module.exports = IdentityService;
