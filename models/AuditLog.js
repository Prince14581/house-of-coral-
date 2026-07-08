const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Define actions for strict consistency across pillars
const AUDIT_ACTIONS = [
    'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT',
    'CREATE_ORDER', 'UPDATE_ORDER',
    'CREATE_WALLET', 'UPDATE_WALLET',
    'CREATE_LEDGER_ENTRY',
    'CREATE_ESCROW', 'RELEASE_ESCROW', 'REFUND_ESCROW',
    'LOGIN', 'LOGOUT'
];

const AuditLogSchema = new mongoose.Schema({
    auditLogId: { type: String, default: uuidv4, unique: true, immutable: true, index: true },
    collectionName: { type: String, required: true, index: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    action: { type: String, enum: AUDIT_ACTIONS, required: true, uppercase: true, index: true },
    
    // Outcome Tracking
    status: { type: String, enum: ['success', 'failed'], default: 'success', index: true },
    errorMessage: { type: String },

    // State & Actor
    changes: { type: mongoose.Schema.Types.Mixed },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    
    // Request Context
    ipAddress: { type: String },
    userAgent: { type: String },
    requestId: { type: String, index: true },
    sessionId: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    
    createdAt: { type: Date, default: Date.now, immutable: true }
}, { versionKey: false });

// -- Indexes --
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ collectionName: 1, documentId: 1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

// -- Strict Immutability Guards --
const blockModification = function(next) {
    next(new Error('Audit logs are immutable and cannot be modified or deleted.'));
};

AuditLogSchema.pre('save', function(next) {
    if (!this.isNew) return next(new Error('Audit logs cannot be updated.'));
    next();
});

// Block all mutation pathways
AuditLogSchema.pre('updateOne', blockModification);
AuditLogSchema.pre('updateMany', blockModification);
AuditLogSchema.pre('findOneAndUpdate', blockModification);
AuditLogSchema.pre('replaceOne', blockModification);
AuditLogSchema.pre('findOneAndReplace', blockModification);
AuditLogSchema.pre('deleteOne', blockModification);
AuditLogSchema.pre('deleteMany', blockModification);
AuditLogSchema.pre('findOneAndDelete', blockModification);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
