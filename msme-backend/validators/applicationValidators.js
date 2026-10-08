const { body, param } = require('express-validator');

const createApplicationValidator = [
  body('schemeId').isMongoId().withMessage('A valid schemeId (Mongo _id) is required'),
  body('note').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  body('applicantDetails.businessName').optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body('applicantDetails.investmentAmount').optional().isFloat({ min: 0 }).withMessage('investmentAmount must be a positive number'),
  body('applicantDetails.loanAmountRequested').optional().isFloat({ min: 0 }).withMessage('loanAmountRequested must be a positive number'),
];

const updateStageValidator = [
  param('id').isMongoId().withMessage('Invalid application id'),
  body('stage').notEmpty().withMessage('Stage is required')
    .isIn(['Preparing', 'Submitted', 'Waiting for Decision', 'Approved', 'Rejected', 'Needs More Info'])
    .withMessage('Invalid stage value'),
  body('note').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
];

const idParamValidator = [param('id').isMongoId().withMessage('Invalid application id')];

module.exports = { createApplicationValidator, updateStageValidator, idParamValidator };
