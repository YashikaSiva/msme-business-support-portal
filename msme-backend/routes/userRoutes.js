const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');
const { idParamValidator, updateUserValidator } = require('../validators/userValidators');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('admin'), getUsers);
router.get('/:id', idParamValidator, validate, getUser);
router.put('/:id', updateUserValidator, validate, updateUser);
router.delete('/:id', idParamValidator, validate, deleteUser);

module.exports = router;
