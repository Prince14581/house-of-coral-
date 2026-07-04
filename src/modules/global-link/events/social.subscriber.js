const { socialEvents } = require('../services/social.service');
const IdentityService = require('../../../core/identity/services/identity.service');

// When a follower milestone is hit, update the Identity Profile
socialEvents.on('USER_FOLLOWED', async (data) => {
    // 1. Increment count
    await IdentityProfile.updateOne(
        { userId: data.followingId }, 
        { $inc: { followerCount: 1 } }
    );
    
    // 2. Synchronize Tier (Automatically promotes to Merchant/Sovereign)
    await IdentityService.syncTier(data.followingId);
});
