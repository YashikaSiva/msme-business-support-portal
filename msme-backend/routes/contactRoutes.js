const express = require('express');
const router = express.Router();
const {
  createContactMessage, getContactMessages, getContactMessage, updateContactStatus, deleteContactMessage,
} = require('../controllers/contactController');
const {
  createContactValidator, updateStatusValidator, idParamValidator,
} = require('../validators/contactValidators');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

// Public: anyone can submit the contact form
router.post('/', createContactValidator, validate, createContactMessage);

// Admin only: view / manage submissions
router.get('/', protect, authorize('admin'), getContactMessages);
router.get('/:id', protect, authorize('admin'), idParamValidator, validate, getContactMessage);
router.put('/:id/status', protect, authorize('admin'), updateStatusValidator, validate, updateContactStatus);
router.delete('/:id', protect, authorize('admin'), idParamValidator, validate, deleteContactMessage);

module.exports = router;
