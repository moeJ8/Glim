import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  getUnreadCount,
  deleteNotification,
  subscribeToNotifications,
  updatePushSettings,
  getVapidKey
} from '../controllers/notification.controller.js';

const router = express.Router();

// Get all notifications for the current user
router.get('/', verifyToken, getNotifications);
router.get('/unread-count', verifyToken, getUnreadCount);
router.put('/:notificationId/read', verifyToken, markAsRead);
router.put('/read-all', verifyToken, markAllAsRead);
router.delete('/:notificationId', verifyToken, deleteNotification);

// Push notification endpoints
router.get('/vapid-public-key', getVapidKey);
router.post('/subscribe', verifyToken, subscribeToNotifications);
router.put('/push-settings', verifyToken, updatePushSettings);

export default router; 