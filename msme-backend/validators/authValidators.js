const { body } = require('express-validator');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Phone must be a valid 10-digit Indian mobile number'),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  body('businessName').optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body('businessType').optional({ checkFalsy: true }).isIn(['Manufacturing', 'Service', 'Trading'])
    .withMessage('Invalid business type'),
  body('sector').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('state').optional({ checkFalsy: true }).trim(),
  body('district').optional({ checkFalsy: true }).trim(),
  body('businessAge').optional({ checkFalsy: true }).isIn(['New', '<3 years', '3-10 years', '10+ years'])
    .withMessage('Invalid business age'),
  body('category').optional({ checkFalsy: true })
    .isIn(['General', 'Women-owned', 'SC/ST', 'Differently-abled', 'Transgender'])
    .withMessage('Invalid category'),
];

const loginValidator = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

module.exports = { registerValidator, loginValidator };
