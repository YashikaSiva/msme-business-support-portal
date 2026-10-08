const { body, param } = require('express-validator');

const createSchemeValidator = [
  body('schemeId').trim().notEmpty().withMessage('schemeId is required')
    .isSlug().withMessage('schemeId must be a URL-friendly slug (e.g. pmegp, stand-up-india)'),
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 150 }),
  body('authority').trim().notEmpty().withMessage('Authority is required')
    .isIn(['Central', 'Tamil Nadu']).withMessage('Authority must be Central or Tamil Nadu'),
  body('category').trim().notEmpty().withMessage('Category is required').isLength({ max: 100 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }),
  body('subsidyText').trim().notEmpty().withMessage('Subsidy text is required').isLength({ max: 300 }),
  body('minAge').optional().isInt({ min: 0, max: 120 }).withMessage('minAge must be between 0 and 120'),
  body('maxAge').optional().isInt({ min: 0, max: 120 }).withMessage('maxAge must be between 0 and 120'),
  body('minInvestment').optional().isFloat({ min: 0 }).withMessage('minInvestment must be a positive number'),
  body('maxInvestment').optional().isFloat({ min: 0 }).withMessage('maxInvestment must be a positive number'),
  body('businessTypes').isArray({ min: 1 }).withMessage('businessTypes must have at least one entry'),
  body('businessTypes.*').isIn(['Manufacturing', 'Service', 'Trading']).withMessage('Invalid business type value'),
];

const updateSchemeValidator = [
  param('id').isMongoId().withMessage('Invalid scheme id'),
  body('name').optional().trim().isLength({ max: 150 }),
  body('authority').optional().isIn(['Central', 'Tamil Nadu']),
  body('category').optional().trim().isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('subsidyText').optional().trim().isLength({ max: 300 }),
  body('minAge').optional().isInt({ min: 0, max: 120 }),
  body('maxAge').optional().isInt({ min: 0, max: 120 }),
  body('minInvestment').optional().isFloat({ min: 0 }),
  body('maxInvestment').optional().isFloat({ min: 0 }),
  body('businessTypes').optional().isArray({ min: 1 }),
  body('businessTypes.*').optional().isIn(['Manufacturing', 'Service', 'Trading']),
  body('isActive').optional().isBoolean().withMessage('isActive must be true or false'),
];

const idParamValidator = [param('id').isMongoId().withMessage('Invalid scheme id')];

module.exports = { createSchemeValidator, updateSchemeValidator, idParamValidator };
