const { body, param } = require('express-validator');

const createNotificationValidator = [
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 500 }),
  body('type').optional().isIn(['match', 'reminder', 'status', 'general']).withMessage('Invalid notification type'),
  body('relatedApplication').optional().isMongoId().withMessage('Invalid relatedApplication id'),
];

const idParamValidator = [param('id').isMongoId().withMessage('Invalid notification id')];

module.exports = { createNotificationValidator, idParamValidator };
