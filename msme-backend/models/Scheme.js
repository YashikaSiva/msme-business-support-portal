const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema(
  {
    schemeId: {
      type: String,
      required: [true, 'schemeId is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: [true, 'Scheme name is required'],
      trim: true,
      maxlength: 150,
    },
    authority: {
      type: String,
      required: [true, 'Authority is required'],
      enum: ['Central', 'Tamil Nadu'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    subsidyText: {
      type: String,
      required: [true, 'Subsidy text is required'],
      trim: true,
      maxlength: 300,
    },
    minAge: { type: Number, min: 0, max: 120 },
    maxAge: { type: Number, min: 0, max: 120 },
    minInvestment: { type: Number, min: 0 },
    maxInvestment: { type: Number, min: 0 },
    businessTypes: {
      type: [String],
      enum: ['Manufacturing', 'Service', 'Trading'],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one business type is required',
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SchemeSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Scheme', SchemeSchema);
