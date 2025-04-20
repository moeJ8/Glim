import Notification from '../models/notification.model.js';
import { errorHandler } from '../utils/error.js';

export const createNotification = async (notificationData) => {
  try {
    const newNotification = new Notification(notificationData);
    await newNotification.save();
    return newNotification;
  } catch (err) {
    console.error('Error creating notification:', err);
    throw err;
  }
};
export const getNotifications = async (req, res, next) => {
  if (!req.user.id) {
    return next(errorHandler(401, 'Unauthorized'));
  }
  try {
    const limit = parseInt(req.query.limit) || 30;
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('triggeredBy', 'username profilePicture');
    res.status(200).json({ 
      success: true, 
      notifications 
    });
  } catch (err) {
    next(err);
  }
};

export const getUnreadCount = async (req, res, next) => {
  if (!req.user.id) {
    return next(errorHandler(401, 'Unauthorized'));
  }
  try {
    const count = await Notification.countDocuments({ 
      recipient: req.user.id,
      read: false 
    });

    res.status(200).json({ 
      success: true, 
      count 
    });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  const { notificationId } = req.params;
  if (!req.user.id) {
    return next(errorHandler(401, 'Unauthorized'));
  }
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return next(errorHandler(404, 'Notification not found'));
    }

    // checks if notification belongs to the user
    if (notification.recipient.toString() !== req.user.id) {
      return next(errorHandler(403, 'Forbidden'));
    }
    notification.read = true;
    await notification.save();
    res.status(200).json({ 
      success: true, 
      message: 'Notification marked as read' 
    });
  } catch (err) {
    next(err);
  }
};
export const markAllAsRead = async (req, res, next) => {
  if (!req.user.id) {
    return next(errorHandler(401, 'Unauthorized'));
  }
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({ 
      success: true, 
      message: 'All notifications marked as read' 
    });
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (req, res, next) => {
  const { notificationId } = req.params;
  if (!req.user.id) {
    return next(errorHandler(401, 'Unauthorized'));
  }
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return next(errorHandler(404, 'Notification not found'));
    }
    // make sure that the notification belongs to the user
    if (notification.recipient.toString() !== req.user.id) {
      return next(errorHandler(403, 'Forbidden'));
    }
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ 
      success: true, 
      message: 'Notification deleted' 
    });
  } catch (err) {
    next(err);
  }
}; 