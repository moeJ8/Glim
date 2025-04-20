import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js"
import { createNewPostNotifications } from "../utils/createNotification.js";

export const create = async (req, res, next) => {
    if (!req.user.isAdmin && !req.user.isPublisher) {
        return res.status(403).json({ message: "Access denied." });
    }
    if(!req.body.title || !req.body.content){
        return next(errorHandler(400, "please provide all required fields"))
    }
    const slug = req.body.title.split(" ").join("-").toLowerCase().replace(/[^a-zA-Z0-9-]/g, "");
    const newPost = new Post ({
        ...req.body,
        slug,
        userId: req.user.id,
    });
    try {
        const savedPost = await newPost.save();  
        // Create notifications for admins about the new post
        await createNewPostNotifications(
            req,
            savedPost._id,
            savedPost.slug,
            savedPost.title,
            req.user.id
        );
        res.status(201).json(savedPost);
    } catch (err) {
        next(err);
    }
};

export const getposts = async (req, res, next) => {
    try{
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.sort === 'asc' ? 1 : -1;
        const categoryFilter = req.query.category && req.query.category !== 'uncategorized' ? { category: req.query.category } : {};
        
        // Determine sort criteria based on sort parameter
        let sortCriteria = {};
        if (req.query.sort === 'views') {
            sortCriteria = { views: -1, updatedAt: -1 };
        } else if (req.query.sort === 'asc') {
            sortCriteria = { updatedAt: 1 };
        } else {
            sortCriteria = { updatedAt: -1 };
        }
        
        const posts = await Post.find({
            ...(req.query.userId && {userId: req.query.userId}),
            ...categoryFilter,
            ...(req.query.slug && {slug: req.query.slug}),
            ...(req.query.postId && {_id: req.query.postId}),
            ...(req.query.searchTerm && {
                $or: [
                    {title: {$regex: req.query.searchTerm, $options: 'i'}},
                    {content: {$regex: req.query.searchTerm, $options: 'i'}},
                ],
            }),
        })
        .sort(sortCriteria)
        .skip(startIndex)
        .limit(limit)
        .populate('userId', 'username profilePicture');
        
        const totalPosts = await Post.countDocuments();

        const now = new Date();
        const oneMonthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
        );

        const lastMonthPosts = await Post.countDocuments({
            createdAt: {$gte: oneMonthAgo},
        });
         
        res.status(200).json({
            posts,
            totalPosts,
            lastMonthPosts,
        });

    }catch(err){
        next(err);
    }
};

export const deletepost = async (req, res, next) => {
    // Allow admins to delete any post, or the post author to delete their own post
    if(!req.user.isAdmin && req.user.id !== req.params.userId){
        return next(errorHandler(403, 'You are not allowed to delete this post'))
    }
    try{
        await Post.findByIdAndDelete(req.params.postId);
        res.status(200).json('Post has been deleted')
    }catch(err){
        next(err);
    }
};

export const updatepost = async (req, res, next) => {
    // Allow admins to update any post, or the post author to update their own post
    if(!req.user.isAdmin && req.user.id !== req.params.userId){
        return next(errorHandler(403, 'You are not allowed to update this post'))
    }
    try{
        const updatedpost = await Post.findByIdAndUpdate(
            req.params.postId,
            {
                $set:{
                    title: req.body.title,
                    content: req.body.content,
                    category: req.body.category,
                    image: req.body.image,
                }
            }, {new: true}
        );
        res.status(200).json(updatedpost);
    } catch(err){
        next(err);
    }
};

export const increaseView = async (req, res, next) => {
    try {
        await Post.findByIdAndUpdate(
            req.params.postId,
            {
                $inc: { views: 1 }
            },
            { timestamps: false }
        );
        res.status(200).json({ message: 'View count increased' });
    } catch (err) {
        next(err);
    }
};

export const getMostReadPosts = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        
        const posts = await Post.find()
            .sort({ views: -1, updatedAt: -1 })
            .limit(limit)
            .populate('userId', 'username profilePicture');
            
        res.status(200).json({ posts });
    } catch (err) {
        next(err);
    }
};