const ContactMessage = require('../models/ContactMessage');
const asyncHandler = require('../utils/asyncHandler');

// @route   POST /api/contact
// @access  Public
const createContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const contactMessage = await ContactMessage.create({ name, email, phone, subject, message });
  res.status(201).json({ success: true, data: contactMessage });
});

// @route   GET /api/contact
// @access  Private/Admin
const getContactMessages = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const messages = await ContactMessage.find(filter).sort('-createdAt');
  res.status(200).json({ success: true, count: messages.length, data: messages });
});

// @route   GET /api/contact/:id
// @access  Private/Admin
const getContactMessage = asyncHandler(async (req, res) => {
  const contactMessage = await ContactMessage.findById(req.params.id);
  if (!contactMessage) return res.status(404).json({ success: false, message: 'Message not found' });
  res.status(200).json({ success: true, data: contactMessage });
});

// @route   PUT /api/contact/:id/status
// @access  Private/Admin
const updateContactStatus = asyncHandler(async (req, res) => {
  const contactMessage = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!contactMessage) return res.status(404).json({ success: false, message: 'Message not found' });
  res.status(200).json({ success: true, data: contactMessage });
});

// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContactMessage = asyncHandler(async (req, res) => {
  const contactMessage = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!contactMessage) return res.status(404).json({ success: false, message: 'Message not found' });
  res.status(200).json({ success: true, message: 'Message deleted successfully' });
});

module.exports = {
  createContactMessage,
  getContactMessages,
  getContactMessage,
  updateContactStatus,
  deleteContactMessage,
};
