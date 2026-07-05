const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  totalStock: { type: Number, required: true, min: 0 },
  reservedStock: { type: Number, default: 0 }, // Stock held in shopping carts
  warehouseLocation: { type: String, default: 'Main' },
  lowStockThreshold: { type: Number, default: 5 },
  lastRestocked: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for fast availability queries
InventorySchema.index({ productId: 1, totalStock: 1 });

module.exports = mongoose.model('Inventory', InventorySchema);
