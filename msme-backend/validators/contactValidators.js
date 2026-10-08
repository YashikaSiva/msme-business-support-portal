const { body, param } = require('express-validator');

const createContactValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim().matches(/^[6-9]\d{9}$/)
    .withMessage('Phone must be a valid 10-digit Indian mobile number'),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 150 }),
  body('message').trim().notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be 10-2000 characters'),
];

const updateStatusValidator = [
  param('id').isMongoId().withMessage('Invalid message id'),
  body('status').notEmpty().withMessage('Status is required')
    .isIn(['new', 'in-progress', 'resolved']).withMessage('Invalid status value'),
];

const idParamValidator = [param('id').isMongoId().withMessage('Invalid message id')];

module.exports = { createContactValidator, updateStatusValidator, idParamValidator };
