const Wishlist = require('../models/Wishlist');

exports.toggleItem = async (req, res) => {
  const { targetId, targetType } = req.body;
  const userId = req.user.userId;

  try {
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) wishlist = await Wishlist.create({ userId, items: [] });

    const exists = wishlist.items.find(i => i.targetId.toString() === targetId);
    
    if (exists) {
      // Remove if exists (Toggle OFF)
      wishlist.items = wishlist.items.filter(i => i.targetId.toString() !== targetId);
    } else {
      // Add (Toggle ON)
      wishlist.items.push({ targetId, targetType });
    }

    await wishlist.save();
    res.status(200).json({ items: wishlist.items });
  } catch (err) {
    res.status(500).json({ error: 'Wishlist sync failed' });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.userId });
    res.status(200).json(wishlist ? wishlist.items : []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve wishlist' });
  }
};
