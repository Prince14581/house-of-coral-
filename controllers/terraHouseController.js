const mongoose = require('mongoose');
const Property = require('../models/Property');
const AuditService = require('../core/services/auditService');
const { validateObjectId, AppError } = require('../utils/helpers');
const validator = require('validator');

// Platform Configuration Constants
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MIN_TITLE_LENGTH = 10;
const MAX_TITLE_LENGTH = 200;
const PROPERTY_TYPES = ['residential', 'commercial', 'land', 'industrial'];

/**
 * Create Property Listing: Atomic, audited, and strictly validated
 */
exports.createListing = async (req, res, next) => {
  const startTime = Date.now();
  const session = await mongoose.startSession();
  let newProperty;

  try {
    const { title, description, price, propertyType, location } = req.body;

    // 1. Strict Validation
    if (!title || typeof title !== 'string' || title.trim().length < MIN_TITLE_LENGTH) {
      throw new AppError(`Title must be at least ${MIN_TITLE_LENGTH} characters`, 400);
    }
    const cleanTitle = validator.escape(title.trim());
    if (cleanTitle.length > MAX_TITLE_LENGTH) throw new AppError('Title too long', 400);
    
    if (!PROPERTY_TYPES.includes(propertyType)) throw new AppError('Invalid property type', 400);
    if (!Number.isFinite(price) || price <= 0) throw new AppError('Valid price required', 400);

    const cleanDesc = description ? validator.escape(description.trim()) : '';

    await session.withTransaction(async () => {
      [newProperty] = await Property.create([{
        owner: req.user.id,
        title: cleanTitle,
        description: cleanDesc,
        price,
        propertyType,
        location,
        status: 'active'
      }], { session });

      await AuditService.log(session, {
        actorId: req.user.id,
        action: 'PROPERTY_LISTING_CREATED',
        documentId: newProperty._id,
        metadata: { price, propertyType, ip: req.ip }
      });
    });

    res.status(201).json({
      status: 'success',
      data: newProperty,
      meta: { requestId: req.id, executionTimeMs: Date.now() - startTime, generatedAt: new Date().toISOString() }
    });
  } catch (error) { next(error); }
  finally { session.endSession(); }
};

/**
 * Get Property Feed: Optimized filtering and pagination
 */
exports.getProperties = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { propertyType, minPrice, maxPrice } = req.query;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? DEFAULT_LIMIT);

    if (!Number.isInteger(page) || page < 1) throw new AppError('Invalid page', 400);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) throw new AppError('Invalid limit', 400);

    const query = { status: 'active', deletedAt: null };
    if (propertyType) {
      if (!PROPERTY_TYPES.includes(propertyType)) throw new AppError('Invalid property type', 400);
      query.propertyType = propertyType;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const [data, total] = await Promise.all([
      Property.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('owner', 'username')
        .maxTimeMS(5000)
        .lean(),
      Property.countDocuments(query)
    ]);

    res.status(200).json({
      status: 'success',
      data,
      meta: {
        requestId: req.id,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        executionTimeMs: Date.now() - startTime,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) { next(error); }
};
