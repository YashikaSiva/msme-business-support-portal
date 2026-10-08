const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort('-createdAt');
  const unreadCount = notifications.filter((n) => !n.read).length;
  res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
});

// @route   POST /api/notifications
// @access  Private (system/admin use, e.g. manually notifying a user)
const createNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create({
    user: req.body.userId || req.user.id,
    message: req.body.message,
    type: req.body.type,
    relatedApplication: req.body.relatedApplication,
  });
  res.status(201).json({ success: true, data: notification });
});

// @route   PUT /api/notifications/:id/read
// @access  Private (owner)
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
  if (notification.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden: not your notification' });
  }
  notification.read = true;
  await notification.save();
  res.status(200).json({ success: true, data: notification });
});

// @route   PUT /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

// @route   DELETE /api/notifications/:id
// @access  Private (owner)
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
  if (notification.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden: not your notification' });
  }
  await notification.deleteOne();
  res.status(200).json({ success: true, message: 'Notification deleted successfully' });
});

module.exports = { getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification };
