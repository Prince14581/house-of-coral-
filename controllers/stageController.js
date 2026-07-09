const mongoose = require('mongoose');
const LiveStream = require('../models/LiveStream');
const AuditService = require('../core/services/auditService');
const { validateObjectId, AppError } = require('../utils/helpers');
const validator = require('validator');

// Platform Configuration Constants
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 150;
const STREAM_CATEGORIES = ['gaming', 'music', 'education', 'sports', 'podcast'];
const ACTIVE_STREAM_FILTER = { status: 'live', deletedAt: null };

/**
 * Stage Controller: Enterprise-grade live stream orchestration
 */
exports.createStream = async (req, res, next) => {
  const startTime = Date.now();
  const session = await mongoose.startSession();
  let newStream;

  try {
    const { title, category } = req.body;
    
    // 1. Strict Validation
    if (typeof title !== 'string' || !validator.trim(title)) throw new AppError('Valid title required', 400);
    const cleanTitle = validator.escape(title.trim());
    if (cleanTitle.length < MIN_TITLE_LENGTH || cleanTitle.length > MAX_TITLE_LENGTH) {
      throw new AppError(`Title must be ${MIN_TITLE_LENGTH}-${MAX_TITLE_LENGTH} chars`, 400);
    }
    if (!STREAM_CATEGORIES.includes(category)) throw new AppError('Invalid category', 400);

    await session.withTransaction(async () => {
      [newStream] = await LiveStream.create([{
        host: req.user.id,
        title: cleanTitle,
        category,
        status: 'live'
      }], { session });

      await AuditService.log(session, {
        actorId: req.user.id,
        action: 'LIVE_STREAM_STARTED',
        documentId: newStream._id,
        metadata: { title: cleanTitle, category, ip: req.ip }
      });
    });

    res.status(201).json({
      status: 'success',
      data: newStream,
      meta: { requestId: req.id, executionTimeMs: Date.now() - startTime, generatedAt: new Date().toISOString() }
    });
  } catch (error) { next(error); }
  finally { session.endSession(); }
};

/**
 * Get Active Streams: High-performance feed
 */
exports.getActiveStreams = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? DEFAULT_LIMIT);
    if (!Number.isInteger(page) || page < 1) throw new AppError('Invalid page', 400);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) throw new AppError('Invalid limit', 400);

    const [streams, total] = await Promise.all([
      LiveStream.find(ACTIVE_STREAM_FILTER)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('host', 'username avatar')
        .maxTimeMS(5000)
        .lean(),
      LiveStream.countDocuments(ACTIVE_STREAM_FILTER)
    ]);

    res.status(200).json({
      status: 'success',
      data: streams,
      meta: {
        requestId: req.id,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        executionTimeMs: Date.now() - startTime,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) { next(error); }
};

/**
 * End Stream: Atomic state transition with precise duration audit
 */
exports.endStream = async (req, res, next) => {
  const { streamId } = req.params;
  if (!validateObjectId(streamId)) throw new AppError('Invalid ID', 400);

  const session = await mongoose.startSession();
  let updatedStream;

  try {
    await session.withTransaction(async () => {
      const now = new Date();
      updatedStream = await LiveStream.findOneAndUpdate(
        { _id: streamId, host: req.user.id, status: 'live', deletedAt: null },
        { status: 'ended', endedAt: now },
        { session, new: true }
      );

      if (!updatedStream) throw new AppError('Active stream not found', 404);

      const durationMs = now.getTime() - updatedStream.createdAt.getTime();
      await AuditService.log(session, {
        actorId: req.user.id,
        action: 'LIVE_STREAM_ENDED',
        documentId: streamId,
        metadata: { durationMs }
      });
    });

    res.status(200).json({ 
      status: 'success', 
      data: { streamId: updatedStream._id, status: updatedStream.status, endedAt: updatedStream.endedAt } 
    });
  } catch (error) { next(error); }
  finally { session.endSession(); }
};
