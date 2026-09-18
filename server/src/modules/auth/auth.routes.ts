import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  register, login, refreshToken, logout, verifyEmail, resendVerificationEmail,
  getVerificationStatus,
  forgotPassword, resetPassword, sendPhoneOtp, verifyPhoneOtp, getMe,
  googleAuth, googleAuthRedirect, googleAuthCallback, syncNeonAuth
} from './auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/verify-email', verifyEmail);
router.post('/verify-email', verifyEmail);
router.post('/verify-email-otp', verifyEmail);
router.get('/verification-status', getVerificationStatus);
router.post('/resend-verification', resendVerificationEmail);
router.post('/resend-otp', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/send-otp', sendPhoneOtp);
router.post('/verify-otp', verifyPhoneOtp);
router.get('/me', authenticate, getMe);

// Google OAuth
router.post('/google', googleAuth);
router.post('/neon-sync', syncNeonAuth);
router.get('/google', googleAuthRedirect);
router.get('/google/callback', googleAuthCallback);

export default router;
