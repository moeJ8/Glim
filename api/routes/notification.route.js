import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  getUnreadCount,
  deleteNotification
} from '../controllers/notification.controller.js';

const router = express.Router();

// Get all notifications for the current user
router.get('/', verifyToken, getNotifications);

// Get unread notification count
router.get('/unread-count', verifyToken, getUnreadCount);

// Mark a notification as read
router.put('/:notificationId/read', verifyToken, markAsRead);

// Mark all notifications as read
router.put('/read-all', verifyToken, markAllAsRead);

// Delete a notification
router.delete('/:notificationId', verifyToken, deleteNotification);

export default router; 