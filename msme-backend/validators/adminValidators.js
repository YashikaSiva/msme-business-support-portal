const { body, param } = require('express-validator');

const userIdParam = param('id').isMongoId().withMessage('Invalid user id');

const updateAccessValidator = [
  userIdParam,
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  body('isActive').optional().isBoolean().withMessage('isActive must be true or false').toBoolean(),
  body().custom((value) => {
    if (value.role === undefined && value.isActive === undefined) {
      throw new Error('Provide role and/or isActive');
    }
    return true;
  }),
];

const idParamValidator = [userIdParam];

module.exports = { updateAccessValidator, idParamValidator };
