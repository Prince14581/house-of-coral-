const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');
const { Decimal128 } = mongoose.Types;

const ProductSchema = new mongoose.Schema({
    productId: { type: String, required: true, unique: true, default: () => uuidv4() },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, index: true },
    description: { type: String, maxlength: 2000 },
    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [] },
    slug: { type: String, required: true, unique: true, index: true },
    
    price: { 
        type: Decimal128, 
        required: true, 
        validate: { 
            validator(v) { return parseFloat(v.toString()) > 0; }, 
            message: 'Price must be greater than zero.' 
        } 
    },
    discountPrice: { type: Decimal128, default: null },
    
    stock: { type: Number, default: 0, min: 0 },
    reservedStock: { type: Number, default: 0, min: 0 },
    
    status: { type: String, enum: ['active', 'out-of-stock', 'pending', 'archived'], default: 'active' },
    approval: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    
    shipping: {
        free: { type: Boolean, default: false },
        fee: { type: Decimal128, default: () => Decimal128.fromString('0') }
    },

    images: [{
        url: { type: String, required: true, trim: true },
        alt: { type: String, trim: true, default: '' }
    }],

    // Audit Fields
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null, index: true },

    sellerSnapshot: {
        storeName: String,
        verified: Boolean
    }
}, { 
    timestamps: true, 
    optimisticConcurrency: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

// -- Indexes --
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' }, { weights: { name: 10, tags: 5, description: 2 } });
ProductSchema.index({ approval: 1, status: 1, deletedAt: 1 });
ProductSchema.index({ sellerId: 1, approval: 1, status: 1 });
ProductSchema.index({ createdAt: -1 });

// -- Virtuals --
ProductSchema.virtual('hasDiscount').get(function () { return !!this.discountPrice; });
ProductSchema.virtual('availableStock').get(function () { return this.stock - this.reservedStock; });

// -- Soft-Delete Middleware --
ProductSchema.pre(/^find/, function(next) {
    this.where({ deletedAt: null });
    next();
});

// -- Pre-Save Logic --
ProductSchema.pre('save', async function(next) {
    // Inventory Synchronization
    if (this.stock - this.reservedStock <= 0) {
        this.status = 'out-of-stock';
    } else if (this.status === 'out-of-stock') {
        this.status = 'active';
    }

    if (this.shipping.free) this.shipping.fee = Decimal128.fromString('0');
    
    // Slug generation with retry-logic at service layer (expecting E11000)
    if (this.isNew || this.isModified('name')) {
        let baseSlug = slugify(this.name, { lower: true, strict: true });
        this.slug = baseSlug;
    }
    next();
});

module.exports = mongoose.model('Product', ProductSchema);
