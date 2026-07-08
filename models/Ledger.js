const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Helper for precision-safe comparisons
const isNegativeDecimal = (val) => val.toString().startsWith('-');

const LedgerSchema = new mongoose.Schema({
  // Identity & Integrity
  ledgerId: { type: String, unique: true, required: true, default: uuidv4, immutable: true },
  reference: { type: String, unique: true, required: true, immutable: true, index: true },
  signature: { type: String, required: true, immutable: true },
  recordHash: { type: String, required: true, immutable: true, index: true },
  version: { type: Number, default: 1 },
  
  // Account Mapping
  fromWalletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', index: true, immutable: true },
  toWalletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', index: true, immutable: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, immutable: true },
  
  // Financial Data
  amount: { type: mongoose.Schema.Types.Decimal128, required: true },
  currency: { type: String, default: 'HFC', uppercase: true, immutable: true },
  exchangeRate: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('1') },
  debit: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0') },
  credit: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0') },
  balanceAfter: { type: mongoose.Schema.Types.Decimal128, required: true },
  
  // Categorization & Context
  pillar: { 
    type: String, required: true, index: true,
    enum: ['Bazaar', 'TerraHouse', 'HFC-Challenge', 'Jubilee', 'RhythmHub', 'TheStage', 'GlobalLink', 'HeartStrings'] 
  },
  entryType: { 
    type: String, required: true, index: true,
    enum: ['credit', 'debit', 'fee', 'refund', 'reward', 'bonus', 'withdrawal', 'deposit', 'transfer'] 
  },
  status: { type: String, enum: ['pending', 'posted', 'reversed'], default: 'posted' },
  reconciliation: {
    status: { type: String, enum: ['pending', 'matched', 'failed'], default: 'pending' },
    reconciledAt: Date
  },
  description: { type: String, maxlength: 500 },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  
  // Audit & Governance
  postedAt: { type: Date, default: Date.now, immutable: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isArchived: { type: Boolean, default: false },
  reversedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reversedAt: Date,
  reversalReason: { type: String, maxlength: 500 },

  // Linking
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', index: true, immutable: true },
  activityId: { type: String, required: true, unique: true, index: true, immutable: true }
}, { 
  timestamps: true, 
  strict: 'throw', 
  optimisticConcurrency: true, 
  minimize: false, 
  versionKey: false 
});

// --- Advanced Validations ---

LedgerSchema.pre('validate', function(next) {
  // 1. Circular transfer and non-zero logic
  if (this.fromWalletId && this.toWalletId && this.fromWalletId.equals(this.toWalletId)) {
    return next(new Error('Source and destination wallets cannot be the same.'));
  }
  
  // 2. Precision-safe validation
  const amt = this.amount.toString();
  const d = this.debit.toString();
  const c = this.credit.toString();
  const bal = this.balanceAfter;

  if (amt === '0') return next(new Error('Amount must be greater than zero.'));
  if ((d !== '0') === (c !== '0')) return next(new Error('Exactly one of debit or credit must be non-zero.'));
  if (d !== '0' && amt !== d) return next(new Error('Amount must match debit value.'));
  if (c !== '0' && amt !== c) return next(new Error('Amount must match credit value.'));
  if (isNegativeDecimal(bal)) return next(new Error('Balance after transaction cannot be negative.'));
  
  // 3. Mandatory reversal audit & Archival Logic
  if (this.status === 'reversed' && (!this.reversedBy || !this.reversedAt || !this.reversalReason)) {
    return next(new Error('Reversal requires reversedBy, reversedAt, and reversalReason.'));
  }
  if (this.isArchived && this.status !== 'reversed') {
    return next(new Error('Only reversed ledger entries may be archived.'));
  }
  
  next();
});

// Enforced Immutability
LedgerSchema.pre('save', function(next) {
  if (!this.isNew && this.status === 'posted' && this.isModified()) {
    return next(new Error('Posted ledger entries are immutable.'));
  }
  next();
});

// Optimized Performance Indexes
LedgerSchema.index({ fromWalletId: 1, status: 1, createdAt: -1 });
LedgerSchema.index({ toWalletId: 1, status: 1, createdAt: -1 });
LedgerSchema.index({ userId: 1, pillar: 1, createdAt: -1 });
LedgerSchema.index({ transactionId: 1, status: 1 });
LedgerSchema.index({ activityId: 1, status: 1 });

module.exports = mongoose.model('Ledger', LedgerSchema);
