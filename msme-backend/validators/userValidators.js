const { body, param } = require('express-validator');

const idParamValidator = [
  param('id').isMongoId().withMessage('Invalid user id'),
];

const updateUserValidator = [
  param('id').isMongoId().withMessage('Invalid user id'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('phone').optional().trim().matches(/^[6-9]\d{9}$/).withMessage('Phone must be a valid 10-digit Indian mobile number'),
  body('businessName').optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body('businessType').optional({ checkFalsy: true }).isIn(['Manufacturing', 'Service', 'Trading']),
  body('sector').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('state').optional({ checkFalsy: true }).trim(),
  body('district').optional({ checkFalsy: true }).trim(),
  body('businessAge').optional({ checkFalsy: true }).isIn(['New', '<3 years', '3-10 years', '10+ years']),
  body('category').optional({ checkFalsy: true })
    .isIn(['General', 'Women-owned', 'SC/ST', 'Differently-abled', 'Transgender']),
  body('email').not().exists().withMessage('Email cannot be changed via this endpoint'),
  body('password').not().exists().withMessage('Use the change-password endpoint to update password'),
];

module.exports = { idParamValidator, updateUserValidator };
