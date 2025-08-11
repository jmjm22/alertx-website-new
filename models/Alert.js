const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['police', 'fire', 'ambulance'], required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    lat: { type: Number },
    lng: { type: Number },
    status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
    userId: { type: String }
  },
  { timestamps: true }
);

AlertSchema.index({ createdAt: -1 });
AlertSchema.index({ type: 1, status: 1 });
AlertSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Alert', AlertSchema);
