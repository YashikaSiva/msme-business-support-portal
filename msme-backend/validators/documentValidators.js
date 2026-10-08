const { body, param } = require('express-validator');

const DOC_TYPES = [
  'Aadhaar Card',
  'PAN Card',
  'Project Report',
  'Business Registration',
  'Bank Statement',
  'Caste Certificate',
  'Address Proof',
  'Other',
];

const createDocumentValidator = [
  body('applicationId').isMongoId().withMessage('A valid applicationId is required'),
  body('documentType').notEmpty().withMessage('documentType is required')
    .isIn(DOC_TYPES).withMessage(`documentType must be one of: ${DOC_TYPES.join(', ')}`),
  body('fileName').trim().notEmpty().withMessage('fileName is required').isLength({ max: 255 }),
  body('fileUrl').trim().notEmpty().withMessage('fileUrl is required')
    .isURL({ require_tld: false }).withMessage('fileUrl must be a valid URL'),
];

const uploadDocumentValidator = [
  body('applicationId').isMongoId().withMessage('A valid applicationId is required'),
  body('documentType').notEmpty().withMessage('documentType is required')
    .isIn(DOC_TYPES).withMessage(`documentType must be one of: ${DOC_TYPES.join(', ')}`),
  body('fileName').trim().notEmpty().withMessage('fileName is required').isLength({ max: 255 }),
  body('fileData').notEmpty().withMessage('fileData is required'),
];

const updateStatusValidator = [
  param('id').isMongoId().withMessage('Invalid document id'),
  body('status').notEmpty().withMessage('Status is required')
    .isIn(['missing', 'uploaded', 'verified', 'rejected']).withMessage('Invalid status value'),
];

const idParamValidator = [param('id').isMongoId().withMessage('Invalid document id')];

module.exports = { createDocumentValidator, uploadDocumentValidator, updateStatusValidator, idParamValidator };
