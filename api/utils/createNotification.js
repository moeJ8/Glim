import User from '../models/user.model.js';
import Comment from '../models/comment.model.js';
import { createNotification } from '../controllers/notification.controller.js';

/**
 * Create a comment notification
 * @param {Object} req - Express request object
 * @param {String} postId - Post ID
 * @param {String} postSlug - Post slug
 * @param {String} postTitle - Post title
 * @param {String} commentId - Comment ID
 * @param {String} recipientId - User ID of the recipient
 * @param {String} commenterId - User ID of the commenter
 * @returns {Promise} Created notification
 */
export const createCommentNotification = async (
  req,
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

    return await createNotification(req, {
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
 * @param {Object} req - Express request object
 * @param {String} postId - Post ID
 * @param {String} postSlug - Post slug
 * @param {String} postTitle - Post title
 * @param {String} commentId - Comment ID
 * @param {String} recipientId - User ID of the recipient
 * @param {String} replierId - User ID of the replier
 * @returns {Promise} Created notification
 */
export const createReplyNotification = async (
  req,
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

    return await createNotification(req, {
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
 * @param {Object} req - Express request object
 * @param {String} postId - Post ID
 * @param {String} postSlug - Post slug
 * @param {String} commentId - Comment ID
 * @param {String} commentContent - Comment content
 * @param {String} recipientId - User ID of the comment author
 * @param {String} likerId - User ID of the liker
 * @returns {Promise} Created notification
 */
export const createLikeCommentNotification = async (
  req,
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

    return await createNotification(req, {
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
 * @param {Object} req - Express request object
 * @param {String} postId - Post ID
 * @param {String} postSlug - Post slug
 * @param {String} postTitle - Post title
 * @param {String} authorId - User ID of the post author
 * @returns {Promise<Array>} - Array of created notifications
 */
export const createNewPostNotifications = async (
  req,
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
      const notification = await createNotification(req, {
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
 * Create notifications for all admins when a new donation case is created
 * @param {Object} req - Express request object
 * @param {String} donationId - Donation case ID
 * @param {String} donationTitle - Donation case title
 * @param {String} creatorId - User ID of the donation case creator
 * @returns {Promise<Array>} - Array of created notifications
 */
export const createNewDonationNotifications = async (
  req,
  donationId,
  donationTitle,
  creatorId
) => {
  try {
    const creator = await User.findById(creatorId);
    if (!creator) {
      console.error('Creator not found');
      return null;
    }

    // Find all admins except the creator
    const admins = await User.find({ 
      isAdmin: true,
      _id: { $ne: creatorId } // Exclude the creator
    }).select('_id');

    if (!admins || admins.length === 0) {
      return null;
    }

    const title = 'New Donation Case';
    const message = `${creator.username} created a new donation case: "${donationTitle.substring(0, 30)}${donationTitle.length > 30 ? '...' : ''}"`;

    const notifications = [];
    for (const admin of admins) {
      const notification = await createNotification(req, {
        recipient: admin._id,
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
  } catch (err) {
    console.error('Error creating new donation notifications:', err);
    return null;
  }
};

/**
 * Create notification for donation transaction
 * @param {Object} req - Express request object
 * @param {String} donationId - Donation case ID
 * @param {String} donationCaseTitle - Donation case title
 * @param {Number} amount - Donation amount
 * @param {String} donorName - Name of the donor
 * @param {String} donorId - User ID of the donor
 * @returns {Promise<Array>} - Notification for admins
 */
export const createDonationTransactionNotifications = async (
  req,
  donationId,
  donationCaseTitle,
  amount,
  donorName,
  donorId
) => {
  try {
    // Find all admins
    const admins = await User.find({ isAdmin: true }).select('_id');
    
    if (!admins || admins.length === 0) {
      return null;
    }
    
    const truncatedTitle = donationCaseTitle.length > 30 
      ? `${donationCaseTitle.substring(0, 30)}...` 
      : donationCaseTitle;
    
    const formatAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);

    const title = 'New Donation Received';
    const message = `${donorName} donated ${formatAmount} to "${truncatedTitle}"`;

    const notifications = [];
    for (const admin of admins) {
      // Skip if the admin is the donor (although this case is unlikely)
      if (admin._id.toString() === donorId) continue;
      
      const notification = await createNotification(req, {
        recipient: admin._id,
        title,
        message,
        type: 'donation_received',
        donationId,
        triggeredBy: donorId || null // might be null for anonymous donations
      });
      
      if (notification) {
        notifications.push(notification);
      }
    }
    return notifications;
  } catch (err) {
    console.error('Error creating donation transaction notifications:', err);
    return null;
  }
};

/**
 * Create notifications for followers when a user publishes a new post
 * @param {Object} req - Express request object
 * @param {String} postId - Post ID
 * @param {String} postSlug - Post slug
 * @param {String} postTitle - Post title
 * @param {String} authorId - User ID of the post author
 * @returns {Promise<Array>} - Array of created notifications
 */
export const createFollowerNotifications = async (
  req,
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

    // Find the author's followers
    const followers = await User.find({ 
      following: authorId
    }).select('_id');

    if (!followers || followers.length === 0) {
      return null;
    }

    const title = 'New Post From User You Follow';
    const message = `${author.username} published a new post: "${postTitle.substring(0, 30)}${postTitle.length > 30 ? '...' : ''}"`;

    const notifications = [];
    for (const follower of followers) {
      const notification = await createNotification(req, {
        recipient: follower._id,
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
    console.error('Error creating follower notifications:', err);
    return null;
  }
};

/**
 * Extract mentions from comment content
 * @param {String} content - Comment or reply content
 * @returns {Array} Array of mentioned usernames
 */
export const extractMentions = (content) => {
  if (!content) return [];
  
  // Regular expression to match @username pattern
  // Username can contain letters, numbers, underscores, and hyphens
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const matches = content.match(mentionRegex);
  
  if (!matches) return [];
  
  // Remove @ symbol and return unique mentions
  return [...new Set(matches.map(match => match.substring(1)))];
};

/**
 * Create mention notifications for users mentioned in a comment
 * @param {Object} req - Express request object
 * @param {String} postId - Post ID
 * @param {String} postSlug - Post slug
 * @param {String} postTitle - Post title
 * @param {String} commentId - Comment ID
 * @param {String} content - Comment content
 * @param {String} mentionerId - User ID of the person mentioning
 * @returns {Promise<Array>} - Array of created notifications
 */
export const createMentionNotifications = async (
  req,
  postId,
  postSlug,
  postTitle,
  commentId,
  content,
  mentionerId
) => {
  try {
    const mentioner = await User.findById(mentionerId);
    if (!mentioner) {
      console.error('Mentioner not found');
      return null;
    }
    
    // Extract usernames from mentions
    const mentionedUsernames = extractMentions(content);
    if (mentionedUsernames.length === 0) return null;
    
    // Find mentioned users
    const mentionedUsers = await User.find({
      username: { $in: mentionedUsernames },
      _id: { $ne: mentionerId } // Don't notify the user who is mentioning
    });
    
    if (!mentionedUsers || mentionedUsers.length === 0) return null;
    
    const title = 'You Were Mentioned';
    const truncatedTitle = postTitle ? 
      `${postTitle.substring(0, 30)}${postTitle.length > 30 ? '...' : ''}` : 
      'a post';
    
    const notifications = [];
    
    for (const user of mentionedUsers) {
      const message = `${mentioner.username} mentioned you in a comment on "${truncatedTitle}"`;
      
      const notification = await createNotification(req, {
        recipient: user._id,
        title,
        message,
        type: 'mention',
        postId,
        postSlug,
        commentId,
        triggeredBy: mentionerId
      });
      
      if (notification) {
        notifications.push(notification);
      }
    }
    
    return notifications;
  } catch (err) {
    console.error('Error creating mention notifications:', err);
    return null;
  }
}; 