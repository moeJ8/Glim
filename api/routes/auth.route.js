import express from 'express';
import { signup, signin, google, facebook, verifyEmail } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', google);
router.post('/facebook', facebook);
router.get('/:userId/verify/:token', verifyEmail);

export default router;