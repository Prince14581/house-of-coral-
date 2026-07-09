const mongoose = require('mongoose');
const Review = require('../models/Review');
const User = require('../models/User');
const AuditService = require('../core/services/auditService');
const { validateObjectId, AppError } = require('../utils/helpers');
const validator = require('validator');

// Platform Configuration Constants
const MAX_COMMENT_LENGTH = 500;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const RATING_RANGE = { min: 1, max: 5 };

/**
 * Create Review: Standardized enterprise-grade creation
 */
exports.createReview = async (req, res, next) => {
  const startTime = Date.now();
  const session = await mongoose.startSession();
  let newReview;

  try {
    const { targetUserId, rating, comment } = req.body;
    
    if (!validateObjectId(targetUserId)) throw new AppError('Invalid target', 400);
    if (req.user.id === targetUserId) throw new AppError('Self-review forbidden', 400);
    if (!Number.isInteger(rating) || rating < RATING_RANGE.min || rating > RATING_RANGE.max) {
      throw new AppError('Rating must be integer 1-5', 400);
    }
    
    const cleanComment = typeof comment === 'string' ? validator.escape(comment.trim()) : '';
    if (cleanComment.length > MAX_COMMENT_LENGTH) throw new AppError('Comment too long', 400);

    await session.withTransaction(async () => {
      const targetUser = await User.findOne({
        _id: targetUserId, status: 'active', isBanned: false, isSuspended: false, deletedAt: null
      }).session(session);

      if (!targetUser) throw new AppError('Target unavailable', 404);

      try {
        [newReview] = await Review.create([{
          author: req.user.id,
          target: targetUserId,
          rating,
          comment: cleanComment
        }], { session });

        await AuditService.log(session, {
          actorId: req.user.id, action: 'REVIEW_CREATED', documentId: newReview._id,
          metadata: { targetUserId, rating, ip: req.ip, ua: req.get('user-agent') }
        });
      } catch (err) {
        if (err.code === 11000) throw new AppError('Already reviewed', 409);
        throw err;
      }
    });

    res.status(201).json({ 
      status: 'success', data: newReview,
      meta: { requestId: req.id, executionTimeMs: Date.now() - startTime, reportDate: new Date().toISOString() }
    });
  } catch (error) { next(error); } 
  finally { session.endSession(); }
};

/**
 * Paginated Fetch: Optimized aggregation and standardized response
 */
exports.getUserReviews = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { targetUserId } = req.params;
    if (!validateObjectId(targetUserId)) throw new AppError('Invalid ID', 400);
    
    const targetObjectId = new mongoose.Types.ObjectId(targetUserId);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);

    const [data, stats] = await Promise.all([
      Review.find({ target: targetObjectId, deletedAt: null })
        .select('author rating comment createdAt')
        .populate('author', 'username avatar')
        .sort({ createdAt: -1 })
        .hint({ target: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .maxTimeMS(5000)
        .lean(),
      Review.aggregate([
        { $match: { target: targetObjectId, deletedAt: null } },
        { $group: { _id: "$rating", count: { $sum: 1 } } }
      ])
    ]);

    const totalCount = stats.reduce((acc, curr) => acc + curr.count, 0);
    const sum = stats.reduce((acc, curr) => acc + (curr._id * curr.count), 0);
    const distribution = { "1":0,"2":0,"3":0,"4":0,"5":0 };
    stats.forEach(s => distribution[s._id] = s.count);

    res.status(200).json({
      status: 'success',
      data,
      stats: { avg: totalCount ? Number((sum / totalCount).toFixed(1)) : 0, count: totalCount, distribution },
      meta: { 
        requestId: req.id, page, limit, total: totalCount, 
        executionTimeMs: Date.now() - startTime, generatedAt: new Date().toISOString() 
      }
    });
  } catch (error) { next(error); }
};
