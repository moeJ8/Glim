import { errorHandler } from "../utils/error.js";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import mongoose from "mongoose";

export const createComment = async (req, res, next) => {
    try {
        const {content, postId, userId} = req.body;

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0)); 
        const endOfDay = new Date(now.setHours(23, 59, 59, 999)); 
        
        // Convert string IDs to ObjectIDs for the query
        const postObjectId = new mongoose.Types.ObjectId(postId);
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        const commentsToday = await Comment.countDocuments({
            userId: userObjectId,
            postId: postObjectId, 
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            isReply: false
        });

        if (commentsToday >= 4) {
            return next(errorHandler(403, "You can only comment 4 times per post per 24 hours"));
        }

        if(userId !== req.user.id){
            return next(errorHandler(403, "You are not allowed to create a comment on this post"));
        }
        
        if (!content || content.trim() === "") {
            return next(errorHandler(400, "Comment cannot be empty"));
        }
        
        const newComment = new Comment({
            content,
            postId: postObjectId,
            userId: userObjectId,
            isReply: false
        });
        
        await newComment.save();
        
        // Populate the comment with user and post info before returning
        const populatedComment = await Comment.findById(newComment._id)
            .populate('userId', 'username profilePicture')
            .populate('postId', 'title slug');

        res.status(200).json(populatedComment);
    } catch(err){
        next(err);
    }
}

export const createReply = async (req, res, next) => {
    try {
        const {content, postId, userId, parentId} = req.body;

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0)); 
        const endOfDay = new Date(now.setHours(23, 59, 59, 999)); 
        
        // Convert string IDs to ObjectIDs for the query
        const postObjectId = new mongoose.Types.ObjectId(postId);
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const parentObjectId = new mongoose.Types.ObjectId(parentId);
        
        // Check if parent comment exists
        const parentComment = await Comment.findById(parentId);
        if (!parentComment) {
            return next(errorHandler(404, "Parent comment not found"));
        }
        
        // Check replies count for today
        const repliesToday = await Comment.countDocuments({
            userId: userObjectId,
            postId: postObjectId,
            isReply: true,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        if (repliesToday >= 4) {
            return next(errorHandler(403, "You can only reply 4 times per post per 24 hours"));
        }

        if(userId !== req.user.id){
            return next(errorHandler(403, "You are not allowed to reply to this comment"));
        }
        
        if (!content || content.trim() === "") {
            return next(errorHandler(400, "Reply cannot be empty"));
        }
        
        const newReply = new Comment({
            content,
            postId: postObjectId,
            userId: userObjectId,
            parentId: parentObjectId,
            isReply: true
        });
        
        await newReply.save();
        
        // Add reply to parent comment's replies array
        parentComment.replies.push(newReply._id);
        await parentComment.save();
        
        // Populate the reply with user and post info before returning
        const populatedReply = await Comment.findById(newReply._id)
            .populate('userId', 'username profilePicture')
            .populate('postId', 'title slug');

        res.status(200).json(populatedReply);
    } catch(err){
        next(err);
    }
}

export const getPostComments = async (req, res, next) => {
    try {
        const comments = await Comment.find({
            postId: req.params.postId,
            isReply: false
        })
            .sort({createdAt: -1})
            .populate('userId', 'username profilePicture')
            .populate('postId', 'title slug')
            .populate({
                path: 'replies',
                populate: {
                    path: 'userId',
                    select: 'username profilePicture'
                },
                options: { sort: { createdAt: 1 } }
            });
            
        res.status(200).json(comments);
    } catch(err) {
        next(err);
    }
}

export const getReplies = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId)
            .populate({
                path: 'replies',
                populate: {
                    path: 'userId',
                    select: 'username profilePicture'
                },
                options: { sort: { createdAt: 1 } }
            });
            
        if (!comment) {
            return next(errorHandler(404, "Comment not found"));
        }
        
        res.status(200).json(comment.replies);
    } catch(err) {
        next(err);
    }
}

export const likeComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return next(errorHandler(404, "Comment not found"));
        }
        
        // Check if user ID is in the likes array
        const userIdStr = req.user.id;
        const userIndex = comment.likes.indexOf(userIdStr);
        
        if (userIndex === -1) {
            comment.numberOfLikes += 1;
            comment.likes.push(userIdStr);
        } else {
            comment.numberOfLikes -= 1;
            comment.likes.splice(userIndex, 1);
        }
        
        await comment.save();
        res.status(200).json(comment);
    } catch (err) {
        next(err);
    }
}

export const editComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return next(errorHandler(404, "Comment not found"));
        }
        
        // Compare userId as strings
        if (comment.userId.toString() !== req.user.id && !req.user.isAdmin) {
            return next(errorHandler(403, "You are not allowed to edit this comment"));
        }
        
        const editedComment = await Comment.findByIdAndUpdate(
            req.params.commentId,
            {
                content: req.body.content,
            },
            {new: true}
        )
        .populate('userId', 'username profilePicture')
        .populate('postId', 'title slug');
        
        res.status(200).json(editedComment);
    } catch (err) {
        next(err);
    }
}

export const deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return next(errorHandler(404, "Comment not found"));
        }
        
        // Compare userId as strings
        if (comment.userId.toString() !== req.user.id && !req.user.isAdmin) {
            return next(errorHandler(403, "You are not allowed to delete this comment"));
        }
        
        // If this is a reply, remove it from parent's replies array
        if (comment.isReply && comment.parentId) {
            await Comment.findByIdAndUpdate(comment.parentId, {
                $pull: { replies: comment._id }
            });
        }
        
        // If this is a parent comment, delete all its replies
        if (!comment.isReply && comment.replies.length > 0) {
            await Comment.deleteMany({ _id: { $in: comment.replies } });
        }
        
        await Comment.findByIdAndDelete(req.params.commentId);
        res.status(200).json("Comment has been deleted");
    } catch (err) {
        next(err);
    }
}

export const getComments = async (req, res, next) => {
    if(!req.user.isAdmin){
        return next(errorHandler(403, "You are not allowed to view the comments"));
    }
    try{
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.sort === "asc" ? 1 : -1;
        const comments = await Comment.find()
            .sort({ createdAt: sortDirection })
            .skip(startIndex)
            .limit(limit)
            .populate('userId', 'username profilePicture')
            .populate('postId', 'title slug');
            
        const totalComments = await Comment.countDocuments();
        const now = new Date();
        const oneMonthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
        );
        const lastMonthComments = await Comment.countDocuments({
            createdAt: { $gte: oneMonthAgo },
        })
        res.status(200).json({
            comments,
            totalComments,
            lastMonthComments,
        })
    }catch(err){
        next(err)
    }
}

export const getPublisherComments = async (req, res, next) => {
    if(!req.user.isAdmin && !req.user.isPublisher){
        return next(errorHandler(403, "You are not allowed to view these comments"));
    }
    
    try{
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.sort === "asc" ? 1 : -1;
        
        // Get all posts by the publisher
        const publisherPosts = await Post.find({ userId: req.user.id }).select('_id');
        const postIds = publisherPosts.map(post => post._id.toString());
        
        if (postIds.length === 0) {
            return res.status(200).json({
                comments: [],
                totalComments: 0
            });
        }
        
        // Find comments on the publisher's posts
        const comments = await Comment.find({ postId: { $in: postIds } })
            .sort({ createdAt: sortDirection })
            .skip(startIndex)
            .limit(limit)
            .populate('userId', 'username profilePicture')
            .populate('postId', 'title slug');
            
        const totalComments = await Comment.countDocuments({ postId: { $in: postIds } });
        
        res.status(200).json({
            comments,
            totalComments
        });
    } catch(err) {
        next(err);
    }
}