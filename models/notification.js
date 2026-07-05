const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pillar: { type: String, enum: ['Stage', 'Rhythm', 'GlobalLink', 'HeartStrings', 'Bazaar', 'TerraHouse', 'Arena', 'Jubilee'], required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  data: { type: Object } // Store dynamic links or IDs (e.g., productId)
}, { timestamps: true });

NotificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
