import Report from '../models/report.model.js';
import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';
import { errorHandler } from '../utils/error.js';
import { createNotification } from './notification.controller.js';

export const createReport = async (req, res, next) => {
    try {
        const { targetType, targetId, reason } = req.body;
        
        if (!targetType || !targetId || !reason) {
            return next(errorHandler(400, 'All fields are required'));
        }
        
        // Validate that target exists
        let targetContent;
        if (targetType === 'post') {
            const post = await Post.findById(targetId);
            if (!post) {
                return next(errorHandler(404, 'Post not found'));
            }
            targetContent = post;
        } else if (targetType === 'comment') {
            const comment = await Comment.findById(targetId);
            if (!comment) {
                return next(errorHandler(404, 'Comment not found'));
            }
            targetContent = comment;
            
            // Check if this comment is a reply for better notification message
            const isReply = comment.isReply || comment.parentId !== null;
            if (isReply) {
                targetContent.isReply = true;
            }
        } else {
            return next(errorHandler(400, 'Invalid target type'));
        }
        
        const existingReport = await Report.findOne({
            userId: req.user.id,
            targetType,
            targetId
        });
        
        if (existingReport) {
            return next(errorHandler(400, 'You have already reported this item'));
        }
        
        const newReport = new Report({
            userId: req.user.id,
            targetType,
            targetId,
            reason
        });
        
        await newReport.save();

        const admins = await User.find({ isAdmin: true });
        
        for (const admin of admins) {
            // Create notification for each admin with more specific content type
            let notificationMessage;
            if (targetType === 'post') {
                notificationMessage = `A user has reported a post: ${targetContent.title}`;
            } else if (targetType === 'comment') {
                notificationMessage = targetContent.isReply 
                    ? 'A user has reported a reply comment' 
                    : 'A user has reported a comment';
            }
            await createNotification(req, {
                recipient: admin._id,
                title: 'New Content Report',
                message: notificationMessage,
                type: 'report',
                triggeredBy: req.user.id
            });
        }
        
        res.status(201).json({
            success: true,
            message: 'Report submitted successfully'
        });
        
    } catch (error) {
        next(error);
    }
};

export const getReports = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        
        const query = {};
        if (status) {
            query.status = status;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const reports = await Report.find(query)
            .populate('userId', 'username profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await Report.countDocuments(query);

        const populatedReports = await Promise.all(reports.map(async (report) => {
            const reportObj = report.toObject();
            
            if (report.targetType === 'post') {
                const post = await Post.findById(report.targetId)
                    .select('title slug userId')
                    .populate('userId', 'username profilePicture');
                reportObj.targetContent = post;
                if (post) {
                    reportObj.contentOwner = post.userId;
                }
            } else if (report.targetType === 'comment') {
                // fixed view in context for the reports
                const comment = await Comment.findById(report.targetId)
                    .select('content parentId isReply postId userId')
                    .populate('postId', 'title slug')
                    .populate('userId', 'username profilePicture');
                
                reportObj.targetContent = comment;
                if (comment) {
                    reportObj.contentOwner = comment.userId;
                }
            }
            
            return reportObj;
        }));
        
        res.status(200).json({
            success: true,
            reports: populatedReports,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            totalReports: total
        });
        
    } catch (error) {
        next(error);
    }
};

export const updateReportStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status || !['pending', 'reviewed'].includes(status)) {
            return next(errorHandler(400, 'Invalid status'));
        }
        
        const report = await Report.findById(id);
        
        if (!report) {
            return next(errorHandler(404, 'Report not found'));
        }
        
        report.status = status;
        await report.save();
        if (status === 'reviewed') {
            let contentInfo = '';
            
            if (report.targetType === 'post') {
                const post = await Post.findById(report.targetId).select('title');
                if (post) {
                    contentInfo = `post "${post.title}"`;
                }
            } else if (report.targetType === 'comment') {
                const comment = await Comment.findById(report.targetId);
                if (comment) {
                    contentInfo = comment.parentId || comment.isReply ? 'reply' : 'comment';
                }
            }
            await createNotification(req, {
                recipient: report.userId,
                title: 'Report Reviewed',
                message: `Your report about the ${contentInfo} has been reviewed.`,
                type: 'report',
                triggeredBy: req.user.id
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Report status updated successfully'
        });
        
    } catch (error) {
        next(error);
    }
};

export const deleteReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!req.user.isAdmin) {
            return next(errorHandler(403, 'You are not authorized to delete reports'));
        }  
        const report = await Report.findById(id);
        
        if (!report) {
            return next(errorHandler(404, 'Report not found'));
        }
        await Report.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}; 