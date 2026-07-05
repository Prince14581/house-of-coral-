const Review = require('../models/Review');

exports.addReview = async (req, res) => {
  const { targetId, targetType, rating, comment } = req.body;
  try {
    const review = await Review.create({
      userId: req.user.id,
      targetId,
      targetType,
      rating,
      comment
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: 'Review submission failed. Likely a duplicate.' });
  }
};

exports.getReviews = async (req, res) => {
  const { targetId } = req.params;
  try {
    const reviews = await Review.find({ targetId }).populate('userId', 'username');
    const stats = await Review.aggregate([
      { $match: { targetId: new mongoose.Types.ObjectId(targetId) } },
      { $group: { _id: '$targetId', average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    res.status(200).json({ reviews, stats: stats[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};
