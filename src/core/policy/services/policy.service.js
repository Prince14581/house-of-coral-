const IdentityService = require('../../identity/services/identity.service');

class PolicyService {
    static async canCreatePost(userId) {
        const trustScore = await IdentityService.getTrustScore(userId);
        // Rule: Users must have a trust score > 10 to post
        return trustScore >= 10;
    }
}
module.exports = PolicyService;
