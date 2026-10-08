const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      lowercase: true,
      trim: true,
    },
    scheme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: [true, 'Scheme reference is required'],
    },
    schemeId: { type: String, required: true, trim: true },
    schemeName: { type: String, required: true, trim: true },
    stage: {
      type: String,
      enum: ['Preparing', 'Submitted', 'Waiting for Decision', 'Approved', 'Rejected', 'Needs More Info'],
      default: 'Preparing',
    },
    note: { type: String, trim: true, maxlength: 1000 },
    applicantDetails: {
      businessName: { type: String, trim: true },
      investmentAmount: { type: Number, min: 0 },
      loanAmountRequested: { type: Number, min: 0 },
    },
  },
  { timestamps: true }
);

// A user should not apply for the same scheme twice
ApplicationSchema.index({ user: 1, scheme: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
