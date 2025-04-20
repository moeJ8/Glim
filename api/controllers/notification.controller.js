import Notification from '../models/notification.model.js';
import { errorHandler } from '../utils/error.js';

// Helper function to get and emit unread count for a user
const getAndEmitUnreadCount = async (req, userId) => {
  try {
    // Get the io instance and online users map
    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');
    
    if (!io || !onlineUsers) {
      console.log('Socket.io not available for emitting unread count');
      return;
    }
    
    // Get unread count for this user
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false
    });
    
    // If user is online, send them the current unread count
    if (onlineUsers.has(userId.toString())) {
      const socketId = onlineUsers.get(userId.toString());
      
      io.to(socketId).emit('unread-count-update', {
        unreadCount
      });
    }
    
    return unreadCount;
  } catch (err) {
    console.error('Error getting/emitting unread count:', err);
  }
};

export const createNotification = async (req, notificationData) => {
  try {
    const newNotification = new Notification(notificationData);
    await newNotification.save();
    
    // Get the io instance and online users map
    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');
    
    // If recipient is online, send real-time notification
    if (onlineUsers && onlineUsers.has(notificationData.recipient.toString())) {
      const recipientSocketId = onlineUsers.get(notificationData.recipient.toString());
      
      // Populate triggerBy user details
      const populatedNotification = await Notification.findById(newNotification._id)
        .populate('triggeredBy', 'username profilePicture');
      
      // Count unread notifications for this user
      const unreadCount = await Notification.countDocuments({ 
        recipient: notificationData.recipient,
        read: false 
      });
      
      console.log(`Emitting new notification to user ${notificationData.recipient} (Socket: ${recipientSocketId}), unread count: ${unreadCount}`);
      
      // Emit both a specific notification event and a general unread count update
      io.to(recipientSocketId).emit('new-notification', {
        notification: populatedNotification,
        unreadCount: unreadCount
      });
      
      // Also emit a separate unread count update that the client can use for immediate updates
      io.to(recipientSocketId).emit('unread-count-update', {
        unreadCount: unreadCount
      });
    } else {
      // Log removed as requested
    }
    
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
    
    // Only update if not already read
    if (!notification.read) {
      notification.read = true;
      await notification.save();
      
      // Get updated unread count
      const unreadCount = await Notification.countDocuments({ 
        recipient: req.user.id,
        read: false 
      });
      
      // Get the io instance and online users map
      const io = req.app.get('io');
      const onlineUsers = req.app.get('onlineUsers');
      
      // If user is online, update unread count in real-time
      if (onlineUsers && onlineUsers.has(req.user.id)) {
        const userSocketId = onlineUsers.get(req.user.id);
        
        // Emit the specific notification read event
        io.to(userSocketId).emit('notification-read', {
          notificationId,
          unreadCount
        });
        
        // Also emit the general unread count update
        io.to(userSocketId).emit('unread-count-update', {
          unreadCount
        });
      }
      
      res.status(200).json({ 
        success: true, 
        message: 'Notification marked as read',
        unreadCount
      });
    } else {
      // Notification already read, just return current unread count
      const unreadCount = await Notification.countDocuments({ 
        recipient: req.user.id,
        read: false 
      });
      
      // Emit updated count just in case
      await getAndEmitUnreadCount(req, req.user.id);
      
      res.status(200).json({ 
        success: true, 
        message: 'Notification already read',
        unreadCount
      });
    }
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  if (!req.user.id) {
    return next(errorHandler(401, 'Unauthorized'));
  }
  try {
    // Count unread before updating
    const unreadBefore = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });
    
    if (unreadBefore === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No unread notifications',
        unreadCount: 0
      });
    }
    
    // Update all unread notifications to read
    const result = await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    
    // Get the io instance and online users map
    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');
    
    // If user is online, update unread count in real-time
    if (onlineUsers && onlineUsers.has(req.user.id)) {
      const userSocketId = onlineUsers.get(req.user.id);
      
      // Emit the specific all-read event
      io.to(userSocketId).emit('all-notifications-read', {
        unreadCount: 0
      });
      
      // Also emit the general unread count update
      io.to(userSocketId).emit('unread-count-update', {
        unreadCount: 0
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `${result.modifiedCount} notifications marked as read`,
      unreadCount: 0
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
    
    // Store whether the notification was unread before deleting
    const wasUnread = !notification.read;
    
    // Delete the notification
    await Notification.findByIdAndDelete(notificationId);
    
    // Get updated unread count
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user.id,
      read: false 
    });
    
    // Get the io instance and online users map
    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');
    
    // If user is online, update deleted notification in real-time
    if (onlineUsers && onlineUsers.has(req.user.id)) {
      const userSocketId = onlineUsers.get(req.user.id);
      
      // Emit the specific notification deleted event
      io.to(userSocketId).emit('notification-deleted', {
        notificationId,
        unreadCount
      });
      
      // If it was unread, also emit the general unread count update
      if (wasUnread) {
        io.to(userSocketId).emit('unread-count-update', {
          unreadCount
        });
      }
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Notification deleted',
      unreadCount
    });
  } catch (err) {
    console.error('Error deleting notification:', err);
    next(err);
  }
}; 