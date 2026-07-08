const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { Decimal128 } = mongoose.Types;

// Reusable validator for non-negative financial fields
const nonNegativeDecimal = {
    validator(v) { return v && parseFloat(v.toString()) >= 0; },
    message: 'Balance cannot be negative.'
};

const WalletSchema = new mongoose.Schema({
    walletId: { type: String, default: uuidv4, unique: true, immutable: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    walletType: { type: String, enum: ['personal', 'merchant', 'escrow', 'system'], default: 'personal', index: true },

    availableBalance: { type: Decimal128, default: () => Decimal128.fromString('0'), validate: nonNegativeDecimal },
    lockedBalance: { type: Decimal128, default: () => Decimal128.fromString('0'), validate: nonNegativeDecimal },
    pendingBalance: { type: Decimal128, default: () => Decimal128.fromString('0'), validate: nonNegativeDecimal },

    currency: { type: String, enum: ['HFC', 'NGN', 'USD', 'EUR'], default: 'HFC', uppercase: true },
    status: { type: String, enum: ['active', 'frozen', 'suspended', 'closed'], default: 'active', index: true },
    freezeReason: { type: String, trim: true },
    
    isVerified: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    
    schemaVersion: { type: Number, default: 1 },
    lastTransactionAt: { type: Date, default: null },
    lastCreditAt: { type: Date, default: null },
    lastDebitAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null, index: true }
}, { 
    timestamps: true, 
    optimisticConcurrency: true, 
    versionKey: false,
    toJSON: { 
        virtuals: true,
        transform(doc, ret) {
            delete ret.deletedAt;
            delete ret.schemaVersion;
            return ret;
        }
    },
    toObject: { 
        virtuals: true,
        transform(doc, ret) {
            delete ret.deletedAt;
            delete ret.schemaVersion;
            return ret;
        }
    }
});

// -- Virtuals --
WalletSchema.virtual('totalBalance').get(function () {
    return (parseFloat(this.availableBalance.toString()) + parseFloat(this.lockedBalance.toString()) + parseFloat(this.pendingBalance.toString()));
});

// -- Business Logic Rules --
WalletSchema.pre('validate', function(next) {
    // Ensure freezeReason exists if status is frozen
    if (this.status === 'frozen' && !this.freezeReason) {
        return next(new Error('A reason must be provided when freezing a wallet.'));
    }
    // Prevent clearing freezeReason if still frozen
    if (this.status === 'frozen' && this.isModified('freezeReason') && !this.freezeReason) {
        return next(new Error('Cannot remove freeze reason while wallet is frozen.'));
    }
    next();
});

// -- Middleware --
WalletSchema.pre(/^find/, function(next) {
    this.where({ deletedAt: null });
    next();
});

// -- Indexes --
WalletSchema.index({ ownerId: 1, status: 1 });
WalletSchema.index({ status: 1, currency: 1 });

module.exports = mongoose.model('Wallet', WalletSchema);
