import webpush from 'web-push';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:glimapp2@gmail.com';

// Initialize web-push with VAPID keys
if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
  );
}

/**
 * Get VAPID public key
 * @returns {String} VAPID public key
 */
export const getVapidPublicKey = () => {
  return vapidPublicKey;
};

/**
 * Generate VAPID keys
 * This should only be run once to generate the keys which should then be stored in environment variables
 * @returns {Object} Generated VAPID keys
 */
export const generateVapidKeys = () => {
  return webpush.generateVAPIDKeys();
};

/**
 * Send push notification to a user
 * @param {String} userId - User ID
 * @param {Object} notificationData - Notification data
 * @returns {Promise} - Promise resolving to the send results
 */
export const sendPushNotification = async (userId, notificationData) => {
  try {
    // Skip if VAPID keys are not configured
    if (!vapidPublicKey || !vapidPrivateKey) {
      return null;
    }

    // Find user
    const user = await User.findById(userId);
    if (!user || !user.pushSubscription) {
      return null;
    }

    // Skip if user has disabled push notifications
    if (user.pushNotificationsEnabled === false) {
      return null;
    }

    // Send push notification
    const pushResult = await webpush.sendNotification(
      JSON.parse(user.pushSubscription),
      JSON.stringify(notificationData)
    ).catch(error => {
      // Handle expired or invalid subscriptions
      if (error.statusCode === 404 || error.statusCode === 410) {
        // Subscription no longer valid, remove it from user
        User.findByIdAndUpdate(userId, { 
          $unset: { pushSubscription: 1 },
          pushNotificationsEnabled: false
        }).exec();
      }
      throw error;
    });

    return pushResult;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return null;
  }
};

/**
 * Save push subscription for a user
 * @param {String} userId - User ID
 * @param {Object} subscription - Push subscription object
 * @returns {Promise} - Promise resolving to the updated user
 */
export const savePushSubscription = async (userId, subscription) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        pushSubscription: JSON.stringify(subscription),
        pushNotificationsEnabled: true
      },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    console.error('Error saving push subscription:', error);
    throw error;
  }
};

/**
 * Update push notification settings for a user
 * @param {String} userId - User ID
 * @param {Boolean} enabled - Whether push notifications are enabled
 * @returns {Promise} - Promise resolving to the updated user
 */
export const updatePushNotificationSettings = async (userId, enabled) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { pushNotificationsEnabled: enabled },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    console.error('Error updating push notification settings:', error);
    throw error;
  }
}; 