const express = require('express');
const router = express.Router();
const {
  getApplications, getApplication, createApplication, updateApplicationStage, deleteApplication,
} = require('../controllers/applicationController');
const {
  createApplicationValidator, updateStageValidator, idParamValidator,
} = require('../validators/applicationValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getApplications);
router.get('/:id', idParamValidator, validate, getApplication);
router.post('/', createApplicationValidator, validate, createApplication);
router.put('/:id/stage', updateStageValidator, validate, updateApplicationStage);
router.delete('/:id', idParamValidator, validate, deleteApplication);

module.exports = router;
