import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { 
    createStory, 
    deleteStory, 
    getStories, 
    getStoryById, 
    getStoryBySlug, 
    getPendingStories, 
    getStoryCounts, 
    getUserStories, 
    updateStory, 
    updateStoryStatus 
} from '../controllers/story.controller.js';

const router = express.Router();

// Public routes
router.get('/get', getStories);
router.get('/get/:storyId', getStoryById);
router.get('/getbyslug/:slug', getStoryBySlug);
router.get('/counts', getStoryCounts);

// Protected routes
router.post('/create', verifyToken, createStory);
router.put('/update/:storyId', verifyToken, updateStory);
router.delete('/delete/:storyId', verifyToken, deleteStory);
router.get('/user/:userId', verifyToken, getUserStories);

// Admin routes
router.put('/status/:storyId', verifyToken, updateStoryStatus);
router.get('/pending', verifyToken, getPendingStories);

export default router; 