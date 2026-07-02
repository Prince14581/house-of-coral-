// services/socialService.js
const SocialPrivacy = require('../models/SocialPrivacy');

exports.blockUser = async (userId, targetId) => {
    // Add targetId to the blockedUsers array
    return await SocialPrivacy.findOneAndUpdate(
        { userId },
        { $addToSet: { blockedUsers: targetId } },
        { upsert: true, new: true }
    );
};

exports.reportUser = async (userId, targetId, reason) => {
    return await SocialPrivacy.findOneAndUpdate(
        { userId },
        { $push: { reports: { targetId, reason } } },
        { upsert: true, new: true }
    );
};
