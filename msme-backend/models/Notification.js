const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ['match', 'reminder', 'status', 'general'],
      default: 'general',
    },
    read: { type: Boolean, default: false },
    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
