import User from '../models/user.model.js';
import Comment from '../models/comment.model.js';
import { createNotification } from '../controllers/notification.controller.js';

/**
 * Create a comment notification
 * @param {String} postId - Post ID
 * @param {String} postSlug - Post slug
 * @param {String} postTitle - Post title
 * @param {String} commentId - Comment ID
 * @param {String} recipientId - User ID of the recipient
 * @param {String} commenterId - User ID of the commenter
 * @returns {Promise} Created notification
 */
export const createCommentNotification = async (
  postId,
  postSlug,
  postTitle,
  commentId,
  recipientId,
  commenterId
) => {
  try {
    // Don't create notification if the commenter is the recipient
    if (commenterId === recipientId) {
      return null;
    }
    const commenter = await User.findById(commenterId); 
    if (!commenter) {
      console.error('Commenter not found');
      return null;
    }
    
    const title = 'New Comment';
    const message = `${commenter.username} commented on your post "${postTitle.substring(0, 30)}${postTitle.length > 30 ? '...' : ''}"`;

    return await createNotification({
      recipient: recipientId,
      title,
      message,
      type: 'comment',
      postId,
      postSlug,
      commentId,
      triggeredBy: commenterId
    });
  } catch (err) {
    console.error('Error creating comment notification:', err);
    return null;
  }
};

/**
 * Create a reply notification
 * @param {String} postId - Post ID
 * @param {String} postSlug - Post slug
 * @param {String} postTitle - Post title
 * @param {String} commentId - Comment ID
 * @param {String} recipientId - User ID of the recipient
 * @param {String} replierId - User ID of the replier
 * @returns {Promise} Created notification
 */
export const createReplyNotification = async (
  postId,
  postSlug,
  postTitle,
  commentId,
  recipientId,
  replierId
) => {
  try {
    if (replierId === recipientId) {
      return null;
    }
    const replier = await User.findById(replierId);
    if (!replier) {
      console.error('Replier not found');
      return null;
    }
    const title = 'New Reply';
    const message = `${replier.username} replied to your comment on "${postTitle.substring(0, 30)}${postTitle.length > 30 ? '...' : ''}"`;

    return await createNotification({
      recipient: recipientId,
      title,
      message,
      type: 'reply',
      postId,
      postSlug,
      commentId,
      triggeredBy: replierId
    });
  } catch (err) {
    console.error('Error creating reply notification:', err);
    return null;
  }
};

/**
 * Create a like comment notification
 * @param {String} postId - Post ID
 * @param {String} postSlug - Post slug
 * @param {String} commentId - Comment ID
 * @param {String} commentContent - Comment content
 * @param {String} recipientId - User ID of the comment author
 * @param {String} likerId - User ID of the liker
 * @returns {Promise} Created notification
 */
export const createLikeCommentNotification = async (
  postId,
  postSlug,
  commentId,
  commentContent,
  recipientId,
  likerId
) => {
  try {
    if (likerId === recipientId) {
      return null;
    }
    const liker = await User.findById(likerId); 
    if (!liker) {
      console.error('Liker not found');
      return null;
    }
    
    const truncatedContent = commentContent.length > 40 
      ? `${commentContent.substring(0, 40)}...` 
      : commentContent;

    const title = 'Comment Liked';
    const message = `${liker.username} liked your comment: "${truncatedContent}"`;

    return await createNotification({
      recipient: recipientId,
      title,
      message,
      type: 'like_comment',
      postId,
      postSlug,
      commentId,
      triggeredBy: likerId
    });
  } catch (err) {
    console.error('Error creating like comment notification:', err);
    return null;
  }
};

/**
 * Create notifications for all admins when a new post is created
 * @param {String} postId - Post ID
 * @param {String} postSlug - Post slug
 * @param {String} postTitle - Post title
 * @param {String} authorId - User ID of the post author
 * @returns {Promise<Array>} - Array of created notifications
 */
export const createNewPostNotifications = async (
  postId,
  postSlug,
  postTitle,
  authorId
) => {
  try {
    const author = await User.findById(authorId);
    if (!author) {
      console.error('Author not found');
      return null;
    }

    const admins = await User.find({ 
      isAdmin: true,
      _id: { $ne: authorId } // Exclude the author
    }).select('_id');

    if (!admins || admins.length === 0) {
      return null;
    }
    const title = 'New Post Created';
    const message = `${author.username} created a new post: "${postTitle.substring(0, 30)}${postTitle.length > 30 ? '...' : ''}"`;

    const notifications = [];
    for (const admin of admins) {
      const notification = await createNotification({
        recipient: admin._id,
        title,
        message,
        type: 'new_post',
        postId,
        postSlug,
        triggeredBy: authorId
      });    
      if (notification) {
        notifications.push(notification);
      }
    }
    return notifications;
  } catch (err) {
    console.error('Error creating new post notifications:', err);
    return null;
  }
};

/**
 * Create notifications for all non-admin users (normal users and publishers) when a new donation case is created
 * @param {String} donationId - Donation case ID
 * @param {String} donationTitle - Donation case title
 * @param {String} creatorId - User ID of the admin who created the donation case
 * @returns {Promise<Array>} - Array of created notifications
 */
export const createNewDonationNotifications = async (
  donationId,
  donationTitle,
  creatorId
) => {
  try {
    const creator = await User.findById(creatorId);
    if (!creator) {
      console.error('Admin creator not found');
      return null;
    }
    // Find all non-admin users
    const users = await User.find({ 
      isAdmin: false,
    }).select('_id');

    if (!users || users.length === 0) {
      return null;
    }

    const title = 'New Donation Case';
    const message = `New donation case available: "${donationTitle.substring(0, 30)}${donationTitle.length > 30 ? '...' : ''}" - Donate now!`;

    const notifications = [];
    for (const user of users) {
      const notification = await createNotification({
        recipient: user._id,
        title,
        message,
        type: 'new_donation',
        donationId,
        triggeredBy: creatorId
      });

      if (notification) {
        notifications.push(notification);
      }
    }

    return notifications;
  } catch (error) {
    console.error('Error creating new donation notifications:', error);
    return null;
  }
};

/**
 * Create notifications for all admin users when someone donates to a case
 * @param {String} donationId - Donation case ID
 * @param {String} donationCaseTitle - Donation case title
 * @param {Number} amount - Donation amount
 * @param {String} donorName - Name of the donor
 * @param {String} donorId - User ID of the donor (can be null for anonymous donations)
 * @returns {Promise<Array>} - Array of created notifications
 */
export const createDonationTransactionNotifications = async (
  donationId,
  donationCaseTitle,
  amount,
  donorName,
  donorId
) => {
  try {
    // Find all admin users
    const admins = await User.find({ 
      isAdmin: true
    }).select('_id');

    if (!admins || admins.length === 0) {
      return null;
    }

    // If we have a donor user, get their details
    let donorDetails = donorName;
    if (donorId) {
      const donorUser = await User.findById(donorId);
      if (donorUser) {
        donorDetails = donorUser.username || donorName;
      }
    }

    const title = 'New Donation Received';
    const message = `${donorDetails} donated $${amount} to "${donationCaseTitle.substring(0, 30)}${donationCaseTitle.length > 30 ? '...' : ''}"`;

    const notifications = [];
    for (const admin of admins) {
      const notification = await createNotification({
        recipient: admin._id,
        title,
        message,
        type: 'donation_received',
        donationId,
        donationAmount: amount,
        triggeredBy: donorId || null
      });
      
      if (notification) {
        notifications.push(notification);
      }
    }

    return notifications;
  } catch (error) {
    console.error('Error creating donation transaction notifications:', error);
    return null;
  }
}; 