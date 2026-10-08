const express = require('express');
const router = express.Router();
const {
  getStats, listUsers, updateUserAccess, deleteUserAdmin, listApplications, listSchemes,
} = require('../controllers/adminController');
const { updateAccessValidator, idParamValidator } = require('../validators/adminValidators');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

// Every admin route requires a valid token AND the admin role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', listUsers);
router.put('/users/:id/access', updateAccessValidator, validate, updateUserAccess);
router.delete('/users/:id', idParamValidator, validate, deleteUserAdmin);
router.get('/applications', listApplications);
router.get('/schemes', listSchemes);

module.exports = router;
