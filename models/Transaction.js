/**
 * @fileoverview Transaction Model - House-of-Coral Enterprise Orchestrator
 * Frozen Enterprise Contract: Immutable, Audit-Ready, and Architecturally Sound.
 */

const mongoose = require('mongoose');
const { Decimal128 } = mongoose.Schema.Types;
const { randomUUID, createHash } = require('crypto');

const ZERO = () => mongoose.Types.Decimal128.fromString('0.00000000');

const transactionSchema = new mongoose.Schema({
    // --- Identity & Relationships ---
    transactionId: { type: String, default: randomUUID, unique: true, immutable: true },
    reference: { type: String, required: true, unique: true, immutable: true },
    idempotencyKey: { type: String, unique: true, sparse: true, index: true },
    requestId: { type: String, required: true },
    schemaVersion: { type: Number, default: 1, immutable: true },
    parentTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    reversesTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    settlementBatchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    
    pillar: { type: String, enum: ["Bazaar", "TerraHouse", "HFC-Challenge", "Jubilee", "RhythmHub", "TheStage", "GlobalLink", "HeartStrings"], required: true, index: true },
    source: { type: String, enum: ["web", "android", "ios", "api", "system", "admin"], required: true },
    processor: { type: String, required: true, default: 'internal_hfc', immutable: true },
    processorReference: { type: String, immutable: true },

    // --- Participants ---
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    fromWalletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true, immutable: true },
    toWalletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true, immutable: true },
    treasuryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Treasury', required: true, immutable: true },

    // --- Financials ---
    transactionType: { type: String, enum: ["purchase", "deposit", "withdrawal", "transfer", "refund", "escrow", "settlement", "treasury_fee", "bonus", "reward", "subscription", "commission"], required: true, immutable: true },
    amount: { type: Decimal128, required: true },
    totalFee: { type: Decimal128, required: true },
    netAmount: { type: Decimal128, required: true },
    fees: {
        platform: { type: Decimal128, default: ZERO },
        gateway: { type: Decimal128, default: ZERO },
        tax: { type: Decimal128, default: ZERO },
        commission: { type: Decimal128, default: ZERO },
        fx: { type: Decimal128, default: ZERO }
    },
    treasuryAllocation: {
        reserve: { type: Decimal128, default: ZERO },
        operations: { type: Decimal128, default: ZERO },
        rewards: { type: Decimal128, default: ZERO },
        insurance: { type: Decimal128, default: ZERO }
    },
    originalCurrency: { type: String, enum: ['USD', 'EUR', 'NGN', 'HFC'], uppercase: true, trim: true, required: true },
    settlementCurrency: { type: String, enum: ['USD', 'EUR', 'NGN', 'HFC'], uppercase: true, trim: true, required: true },
    exchangeRate: { type: Decimal128, required: true },

    // --- Lifecycle & Settlement ---
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed', 'reversed', 'voided'], default: 'pending', index: true },
    ledgerStatus: { type: String, enum: ["pending", "posted", "failed"], default: "pending", index: true },
    treasurySettlement: { 
        status: { type: String, enum: ["pending", "settled", "failed"], default: "pending" }, 
        settledAt: Date 
    },
    reconciliation: {
        status: { type: String, enum: ["pending", "matched", "failed"], default: "pending", index: true },
        reconciledAt: Date,
        reconciledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    },
    balanceSnapshot: {
        senderBefore: { type: Decimal128, default: ZERO, immutable: true },
        senderAfter: { type: Decimal128, default: ZERO, immutable: true },
        receiverBefore: { type: Decimal128, default: ZERO, immutable: true },
        receiverAfter: { type: Decimal128, default: ZERO, immutable: true }
    },
    timestamps: { initiatedAt: { type: Date, default: Date.now }, processingAt: Date, completedAt: Date, failedAt: Date, reversedAt: Date },
    expiresAt: { type: Date, default: null, index: true },

    // --- Governance, Compliance & Audit ---
    risk: { score: { type: Number, default: 0 }, level: { type: String, enum: ["low", "medium", "high"], default: "low" }, flagged: { type: Boolean, default: false } },
    approval: { status: { type: String, enum: ["not_required", "pending", "approved", "rejected"], default: "not_required" }, approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, approvedAt: Date },
    compliance: { amlStatus: String, sanctionsChecked: Boolean, kycVerified: Boolean },
    device: { ip: String, userAgent: String, fingerprint: String },
    failure: { code: String, message: String, source: String },
    auditLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "AuditLog" }],
    retry: { count: { type: Number, default: 0 }, nextRetryAt: Date, lastRetryAt: Date },
    
    // --- Infrastructure ---
    transactionHash: { type: String, required: true, immutable: true, unique: true, index: true },
    eventVersion: { type: Number, default: 1, immutable: true },
    events: { status: { type: String, enum: ["pending", "published", "failed"], default: "pending" }, publishedAt: Date, failedAt: Date, retryCount: { type: Number, default: 0 } },
    ledgerEntries: { 
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ledger' }], 
        validate: [v => new Set(v.map(id => id.toString())).size === v.length, 'Duplicate Ledger Entry'] 
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    metadata: { type: Map, of: String, default: () => new Map() }
}, { 
    timestamps: true, 
    versionKey: 'version',
    optimisticConcurrency: true,
    minimize: false,
    strict: 'throw'
});

// --- Middleware: Invariants & Integrity ---
transactionSchema.post('init', function() { this._originalStatus = this.status; });

transactionSchema.pre('save', function(next) {
    // 1. Terminal State Integrity
    if (!this.isNew && ['completed', 'reversed', 'voided'].includes(this._originalStatus)) return next(new Error('Immutable: Terminal state reached.'));
    if (['completed', 'reversed', 'voided'].includes(this.status)) this.expiresAt = null;

    // 2. Soft-Delete Sync
    if (this.isModified('isDeleted')) this.deletedAt = this.isDeleted ? new Date() : null;

    // 3. Automated Lifecycle & Hashing
    if (this.isNew && !this.transactionHash) {
        this.transactionHash = createHash('sha256').update([this.reference, this.transactionId, this.userId, this.amount.toString(), Date.now()].join('|')).digest('hex');
    }
    if (this.isModified('status')) {
        const transitions = { pending: ["processing", "failed", "voided"], processing: ["completed", "failed", "reversed"], completed: [], failed: [], reversed: [], voided: [] };
        if (!this.isNew && !transitions[this._originalStatus]?.includes(this.status)) return next(new Error('Illegal transition.'));
        this.timestamps[`${this.status}At`] = new Date();
    }
    
    next();
});

// --- Query/Aggregate Protection ---
const protect = ['find', 'findOne', 'findOneAndUpdate', 'updateOne', 'updateMany', 'countDocuments', 'aggregate'];
protect.forEach(h => transactionSchema.pre(h, function(next) {
    if (h === 'aggregate') {
        const pipeline = this.pipeline();
        if (pipeline.length && pipeline[0].$geoNear) pipeline.splice(1, 0, { $match: { isDeleted: false } });
        else pipeline.unshift({ $match: { isDeleted: false } });
    } else if (this.getQuery) this.where({ isDeleted: false });
    next();
}));

module.exports = mongoose.model('Transaction', transactionSchema);
