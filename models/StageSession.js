const mongoose = require('mongoose');

const StageSessionSchema = new mongoose.Schema({
  streamerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  streamKey: { type: String, required: true, unique: true }, // HMAC-SHA256 based key
  status: { type: String, enum: ['offline', 'live', 'transcoding'], default: 'offline' },
  viewerCount: { type: Number, default: 0 },
  cdnUrl: { type: String }, // HLS/DASH manifest URL
  startTime: Date
}, { timestamps: true });

module.exports = mongoose.model('StageSession', StageSessionSchema);
