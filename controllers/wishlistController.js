const mongoose = require('mongoose');
const WishlistItem = require('../models/WishlistItem');
const Product = require('../models/Product');
const AuditService = require('../core/services/auditService');
const Logger = require('../core/services/logger');
const { eventBus } = require('../core/events/eventBus');
const { validateObjectId, AppError } = require('../utils/helpers');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Add Item: Atomic, lifecycle-aware, and enterprise-hardened
 */
exports.addItem = async (req, res, next) => {
  const startTime = Date.now();
  const { productId } = req.body;
  const session = await mongoose.startSession();

  try {
    if (!req.user?.id) throw new AppError('Unauthorized', 401);
    if (!validateObjectId(productId)) throw new AppError('Invalid product ID', 400);

    let wasCreated = false;
    await session.withTransaction(async () => {
      // 1. Restore Lifecycle Check: Only allow active, existing products
      const productExists = await Product.exists({ 
        _id: productId, status: 'active', deletedAt: null 
      }).session(session);
      
      if (!productExists) throw new AppError('Product unavailable or not found', 404);

      // 2. Atomic Upsert with uniqueness protection
      try {
        const result = await WishlistItem.updateOne(
          { user: req.user.id, product: productId },
          { $setOnInsert: { user: req.user.id, product: productId } },
          { upsert: true, session }
        );
        wasCreated = result.upsertedCount > 0;

        if (wasCreated) {
          await AuditService.log(session, {
            actorId: req.user.id, action: 'WISHLIST_ITEM_ADDED',
            documentId: productId, metadata: { ip: req.ip }
          });
        }
      } catch (error) {
        if (error.code === 11000) throw new AppError('Item already exists in wishlist', 409);
        throw error;
      }
    });

    // 3. Post-Transaction Event
    if (wasCreated) {
      try { eventBus.emit('WishlistItemAdded', { userId: req.user.id, productId }); } 
      catch (error) { Logger.error('EventBus error', { error, userId: req.user.id, productId }); }
    }

    res.status(200).json({
      status: 'success',
      data: { productId, created: wasCreated },
      meta: { requestId: req.id, executionTimeMs: Date.now() - startTime, generatedAt: new Date().toISOString() }
    });
  } catch (error) { next(error); }
  finally { session.endSession(); }
};

/**
 * Get Wishlist: Optimized pipeline with lifecycle enforcement
 */
exports.getWishlist = async (req, res, next) => {
  const startTime = Date.now();
  if (!req.user?.id) throw new AppError('Unauthorized', 401);

  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? DEFAULT_LIMIT);
  if (!Number.isInteger(page) || page < 1) throw new AppError('Invalid page', 400);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) throw new AppError('Invalid limit', 400);

  try {
    const [result] = await WishlistItem.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { 
        $lookup: { 
          from: 'products',
          let: { pid: '$product' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$pid'] }, status: 'active', deletedAt: null } },
            { $project: { title: 1, price: 1, mediaUrl: 1 } }
          ],
          as: 'productDoc' 
        } 
      },
      { $unwind: '$productDoc' },
      { $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $sort: { createdAt: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit }]
        }
      }
    ]).maxTimeMS(5000);

    const items = result?.data || [];
    const total = result?.metadata[0]?.total || 0;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      data: items,
      meta: { 
        requestId: req.id, page, limit, total, totalPages,
        hasNext: page < totalPages,
        executionTimeMs: Date.now() - startTime,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) { next(error); }
};
