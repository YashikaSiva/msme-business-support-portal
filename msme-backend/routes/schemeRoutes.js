const express = require('express');
const router = express.Router();
const {
  getSchemes, getScheme, createScheme, updateScheme, deleteScheme, getMatchesForMe,
} = require('../controllers/schemeController');
const {
  createSchemeValidator, updateSchemeValidator, idParamValidator,
} = require('../validators/schemeValidators');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/', getSchemes);
router.get('/match/me', protect, getMatchesForMe);
router.get('/:id', idParamValidator, validate, getScheme);

// Admin only
router.post('/', protect, authorize('admin'), createSchemeValidator, validate, createScheme);
router.put('/:id', protect, authorize('admin'), updateSchemeValidator, validate, updateScheme);
router.delete('/:id', protect, authorize('admin'), idParamValidator, validate, deleteScheme);

module.exports = router;
