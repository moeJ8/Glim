import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { deleteUser, signout, updateUser, test, getUsers, getUser, getUserByUsername, updateUserRole, requestPublisher, getPublisherRequests, updatePublisherRequest } from '../controllers/user.controller.js';


const router = express.Router();

router.get('/test', test);
router.put('/update/:userId', verifyToken, updateUser);
router.delete('/delete/:userId', verifyToken, deleteUser);
router.post('/signout', signout);
router.get('/getusers',verifyToken, getUsers);
router.get('/username/:username', getUserByUsername);
router.get('/:userId', getUser);
router.put('/update-role',verifyToken, updateUserRole);
router.post('/request-publisher', verifyToken, requestPublisher);
router.get('/publisher-requests/get', verifyToken, getPublisherRequests);
router.put('/publisher-requests/update', verifyToken, updatePublisherRequest);



export default router;