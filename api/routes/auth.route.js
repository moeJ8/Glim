import express from 'express';
import { signup, signin, google, facebook, verifyEmail, requestPasswordReset, resetPassword } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', google);
router.post('/facebook', facebook);
router.get('/:userId/verify/:token', verifyEmail);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:userId/:token', resetPassword);

export default router;