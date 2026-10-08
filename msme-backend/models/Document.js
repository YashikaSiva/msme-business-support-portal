const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application reference is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      enum: [
        'Aadhaar Card',
        'PAN Card',
        'Project Report',
        'Business Registration',
        'Bank Statement',
        'Caste Certificate',
        'Address Proof',
        'Other',
      ],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
      maxlength: 255,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['missing', 'uploaded', 'verified', 'rejected'],
      default: 'uploaded',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', DocumentSchema);
