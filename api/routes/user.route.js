import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { deleteUser, signout, updateUser, test, getUsers, getUser, getUserByUsername, updateUserRole, requestPublisher, getPublisherRequests, updatePublisherRequest, searchUsers, resendVerificationLink, followUser, unfollowUser, getUserFollowers, getUserFollowing, banUser, unbanUser, refreshUserData } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/test', test);
router.put('/update/:userId', verifyToken, updateUser);
router.delete('/delete/:userId', verifyToken, deleteUser);
router.post('/signout', signout);
router.get('/getusers',verifyToken, getUsers);
router.get('/search', searchUsers);
router.get('/username/:username', getUserByUsername);
router.get('/:userId', getUser);
router.put('/update-role',verifyToken, updateUserRole);
router.post('/request-publisher', verifyToken, requestPublisher);
router.get('/publisher-requests/get', verifyToken, getPublisherRequests);
router.put('/publisher-requests/update', verifyToken, updatePublisherRequest);
router.post('/:userId/resend-verification', verifyToken, resendVerificationLink);
router.put('/follow/:id', verifyToken, followUser);
router.put('/unfollow/:id', verifyToken, unfollowUser);
router.get('/:id/followers', getUserFollowers);
router.get('/:id/following', getUserFollowing);
router.post('/ban', verifyToken, banUser);
router.post('/unban/:userId', verifyToken, unbanUser);
router.get('/refresh-token/data', verifyToken, refreshUserData);

// token validation
router.head('/validate-token', verifyToken, (req, res) => {
  res.status(200).end();
});

export default router;