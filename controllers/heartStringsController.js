const HeartStrings = require('../models/HeartStrings');
const HeartStringsService = require('../services/heartStringsService');

exports.addFriend = async (req, res) => {
  const { friendId } = req.body;
  const userId = req.user.userId;

  try {
    const profile = await HeartStrings.findOne({ userId });
    profile.friends.push(friendId);
    await profile.save();

    await HeartStringsService.notifyConnection(friendId, 'You have a new friend request!');
    res.status(200).json({ message: 'Friend added' });
  } catch (err) {
    res.status(500).json({ error: 'Connection failed' });
  }
};
