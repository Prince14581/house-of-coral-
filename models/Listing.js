const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { Decimal128 } = mongoose.Types;
const slugify = require('slugify');

const ListingSchema = new mongoose.Schema({
    listingId: { type: String, default: uuidv4, unique: true, immutable: true, index: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true },
    
    // Financials
    price: { 
        type: Decimal128, 
        required: true,
        validate: { validator(v) { return v && parseFloat(v.toString()) > 0; }, message: 'Price must be > 0.' }
    },
    currency: { type: String, enum: ['HFC', 'NGN', 'USD', 'EUR'], default: 'HFC', uppercase: true },
    shippingFee: { 
        type: Decimal128, 
        default: () => Decimal128.fromString('0'),
        validate: { validator(v) { return v && parseFloat(v.toString()) >= 0; }, message: 'Shipping fee >= 0.' }
    },
    
    // Inventory & Status
    stockQuantity: { type: Number, default: 1, min: 0 },
    category: { type: String, required: true, trim: true, lowercase: true, index: true },
    status: { type: String, enum: ['active', 'paused', 'sold_out', 'archived'], default: 'active', index: true },
    approval: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    visibility: { type: String, enum: ['public', 'private', 'draft'], default: 'public' },
    
    // Approval & Management Audit
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Media, Tags & Analytics
    images: [{ url: { type: String, required: true, trim: true }, alt: { type: String, trim: true, default: '' } }],
    tags: { type: [String], default: [] },
    views: { type: Number, default: 0, min: 0 },
    soldCount: { type: Number, default: 0, min: 0 },
    rating: { average: { type: Number, default: 0, min: 0, max: 5 }, count: { type: Number, default: 0, min: 0 } },
    
    deletedAt: { type: Date, default: null, index: true }
}, { 
    timestamps: true, 
    optimisticConcurrency: true, 
    versionKey: false,
    toJSON: { virtuals: true, transform(doc, ret) { delete ret.deletedAt; return ret; } },
    toObject: { virtuals: true, transform(doc, ret) { delete ret.deletedAt; return ret; } }
});

// -- Virtuals --
ListingSchema.virtual('isAvailable').get(function () {
    return (this.status === 'active' && this.approval === 'approved' && this.stockQuantity > 0);
});

// -- Indexes --
ListingSchema.index({ title: 'text', description: 'text', category: 'text' }, { weights: { title: 10, category: 5, description: 2 } });
ListingSchema.index({ sellerId: 1, approval: 1, deletedAt: 1 });
ListingSchema.index({ category: 1, price: 1 });
ListingSchema.index({ createdAt: -1 });

// -- Logic Hooks --
ListingSchema.pre('validate', function(next) {
    if (this.approval === 'approved' && (!this.images || this.images.length === 0)) return next(new Error('Approved listings require images.'));
    if (this.approval === 'approved' && (!this.approvedBy || !this.approvedAt)) return next(new Error('Approved listings require approval metadata.'));
    if (this.rating.count === 0 && this.rating.average > 0) return next(new Error('Invalid rating state.'));
    next();
});

ListingSchema.pre('save', function(next) {
    if (this.isModified('title')) this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + uuidv4().slice(0, 8);
    if (this.tags?.length) this.tags = [...new Set(this.tags.map(t => t.trim().toLowerCase()))];
    if (this.stockQuantity <= 0) this.status = 'sold_out';
    else if (this.status === 'sold_out') this.status = 'active';
    next();
});

// -- Middlewares --
ListingSchema.pre(/^find/, function(next) { this.where({ deletedAt: null }); next(); });
ListingSchema.pre('aggregate', function(next) { this.pipeline().unshift({ $match: { deletedAt: null } }); next(); });

module.exports = mongoose.model('Listing', ListingSchema);
