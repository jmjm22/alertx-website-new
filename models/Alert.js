const mongoose = require('mongoose');
const { Schema } = mongoose;

const AlertSchema = new Schema(
  {
    type: { type: String, required: true, enum: ['police', 'fire', 'ambulance'] },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, default: 'new' },
    phone: { type: String },
    createdAtClient: { type: Date },
    userId: { type: String, required: true },
    userName: { type: String }, 
    extraServices: { type: [String], default: [] },
    city: { type: String },// for display
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number], 
        required: true
      }
    }
  },
  { timestamps: true }
);


AlertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Alert', AlertSchema);
