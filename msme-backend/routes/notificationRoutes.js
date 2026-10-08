const express = require('express');
const router = express.Router();
const {
  getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification,
} = require('../controllers/notificationController');
const { createNotificationValidator, idParamValidator } = require('../validators/notificationValidators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getNotifications);
router.post('/', createNotificationValidator, validate, createNotification);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', idParamValidator, validate, markAsRead);
router.delete('/:id', idParamValidator, validate, deleteNotification);

module.exports = router;
