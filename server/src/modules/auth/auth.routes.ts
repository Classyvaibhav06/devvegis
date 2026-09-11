import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  register, login, refreshToken, logout, verifyEmail,
  forgotPassword, resetPassword, sendPhoneOtp, verifyPhoneOtp, getMe
} from './auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/send-otp', sendPhoneOtp);
router.post('/verify-otp', verifyPhoneOtp);
router.get('/me', authenticate, getMe);

export default router;
