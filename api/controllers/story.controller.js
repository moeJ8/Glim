import Story from "../models/story.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

export const createStory = async (req, res, next) => {
    if (!req.user.isAdmin && !req.user.isPublisher) {
        return next(errorHandler(403, "You are not authorized to create stories"));
    }

    if (!req.body.title || !req.body.body || !req.body.country || !req.body.category || 
        !req.body.contactPlatform || !req.body.contactUsername) {
        return next(errorHandler(400, "Please provide all required fields"));
    }

    const slug = req.body.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-") + "-" + Date.now();

    const newStory = new Story({
        ...req.body,
        slug,
        userId: req.user.id,
    });

    try {
        const savedStory = await newStory.save();
        res.status(201).json(savedStory);
    } catch (error) {
        next(error);
    }
};

export const getStories = async (req, res, next) => {
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.order === "asc" ? 1 : -1;
        const status = req.query.status || "approved";
        const searchTerm = req.query.searchTerm || "";
        const category = req.query.category || "";
        const country = req.query.country || "";
        
        // Build query
        let query = {};
        
        if (status !== "all") {
            query.status = status;
        }
        
        if (category) {
            query.category = category;
        }

        if (country) {
            query.country = country;
        }

        if (searchTerm) {
            query.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { body: { $regex: searchTerm, $options: 'i' } },
                { country: { $regex: searchTerm, $options: 'i' } },
                { userId: { $regex: searchTerm, $options: 'i' } }
            ];
        }
        
        const stories = await Story.find(query)
            .sort({ createdAt: sortDirection })
            .skip(startIndex)
            .limit(limit);

        const totalStories = await Story.countDocuments(query);
        
        const now = new Date();
        const oneMonthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
        );
        
        const lastMonthStories = await Story.countDocuments({
            status: "approved",
            createdAt: { $gte: oneMonthAgo }
        });

        res.status(200).json({
            stories,
            totalStories,
            lastMonthStories
        });
    } catch (error) {
        next(error);
    }
};

export const getStoryById = async (req, res, next) => {
    try {
        const story = await Story.findById(req.params.storyId);
        if (!story) {
            return next(errorHandler(404, "Story not found"));
        }
        
        // Increment views
        story.views += 1;
        await story.save();
        
        res.status(200).json(story);
    } catch (error) {
        next(error);
    }
};

export const getStoryBySlug = async (req, res, next) => {
    try {
        const story = await Story.findOne({ slug: req.params.slug });
        if (!story) {
            return next(errorHandler(404, "Story not found"));
        }
    
        story.views += 1;
        await story.save();
        
        res.status(200).json(story);
    } catch (error) {
        next(error);
    }
};

export const updateStory = async (req, res, next) => {
    try {
        const story = await Story.findById(req.params.storyId);
        if (!story) {
            return next(errorHandler(404, "Story not found"));
        }

        if (story.userId !== req.user.id && !req.user.isAdmin) {
            return next(errorHandler(403, "You are not allowed to update this story"));
        }

        if (!req.user.isAdmin) {
            req.body.status = "pending";
        }

        let updatedStory = req.body;
        if (req.body.title && req.body.title !== story.title) {
            const slug = req.body.title
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-") + "-" + Date.now();
            
            updatedStory.slug = slug;
        }
        
        const updated = await Story.findByIdAndUpdate(
            req.params.storyId,
            { $set: updatedStory },
            { new: true }
        );
        
        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
};

export const deleteStory = async (req, res, next) => {
    try {
        const story = await Story.findById(req.params.storyId);
        if (!story) {
            return next(errorHandler(404, "Story not found"));
        }

        if (story.userId !== req.user.id && !req.user.isAdmin) {
            return next(errorHandler(403, "You are not allowed to delete this story"));
        }
        
        await Story.findByIdAndDelete(req.params.storyId);
        res.status(200).json("Story has been deleted");
    } catch (error) {
        next(error);
    }
};

export const getUserStories = async (req, res, next) => {
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.order === "asc" ? 1 : -1;
        const userId = req.params.userId;
        const status = req.query.status || "all";
        
        if (userId !== req.user.id && !req.user.isAdmin) {
            return next(errorHandler(403, "You are not allowed to see other user's stories"));
        }
 
        let query = { userId };

        if (status !== "all") {
            query.status = status;
        }
        
        const stories = await Story.find(query)
            .sort({ createdAt: sortDirection })
            .skip(startIndex)
            .limit(limit);
            
        const totalStories = await Story.countDocuments(query);
        
        res.status(200).json({
            stories,
            totalStories
        });
    } catch (error) {
        next(error);
    }
};

export const updateStoryStatus = async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(errorHandler(403, "You are not authorized to perform this action"));
        }
        
        const { status } = req.body;
        if (!status || !["pending", "approved", "rejected"].includes(status)) {
            return next(errorHandler(400, "Invalid status"));
        }
        
        const story = await Story.findById(req.params.storyId);
        if (!story) {
            return next(errorHandler(404, "Story not found"));
        }
        
        const updated = await Story.findByIdAndUpdate(
            req.params.storyId,
            { $set: { status } },
            { new: true }
        );
        
        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
};

export const getPendingStories = async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            return next(errorHandler(403, "You are not authorized to perform this action"));
        }
        
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.order === "asc" ? 1 : -1;
        
        const stories = await Story.find({ status: "pending" })
            .sort({ createdAt: sortDirection })
            .skip(startIndex)
            .limit(limit);
            
        const totalPendingStories = await Story.countDocuments({ status: "pending" });
        
        res.status(200).json({
            stories,
            totalPendingStories
        });
    } catch (error) {
        next(error);
    }
};

export const getStoryCounts = async (req, res, next) => {
    try {
        const totalStories = await Story.countDocuments();
        const approvedStories = await Story.countDocuments({ status: "approved" });
        const pendingStories = await Story.countDocuments({ status: "pending" });
        const rejectedStories = await Story.countDocuments({ status: "rejected" });
        
        const now = new Date();
        const oneMonthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
        );
        
        // Count only approved stories for last month
        const lastMonthStories = await Story.countDocuments({
            status: "approved",
            createdAt: { $gte: oneMonthAgo }
        });
        
        res.status(200).json({
            totalStories,
            approvedStories,
            pendingStories,
            rejectedStories,
            lastMonthStories
        });
    } catch (error) {
        next(error);
    }
}; 