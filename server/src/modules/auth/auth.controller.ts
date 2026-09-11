import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/prisma';
import { config } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { logger } from '../../utils/logger';
import { sendEmail } from '../../utils/email';
import { Role } from '@prisma/client';

function generateTokens(userId: string, email: string, role: Role, name: string) {
  const accessToken = jwt.sign(
    { id: userId, email, role, name },
    config.JWT_ACCESS_SECRET,
    { expiresIn: config.JWT_ACCESS_EXPIRES_IN } as jwt.SignOptions
  );
  const refreshToken = jwt.sign(
    { id: userId },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
  );
  return { accessToken, refreshToken };
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateReferralCode(name: string): string {
  const clean = name.replace(/\s+/g, '').toUpperCase().substring(0, 5);
  return `${clean}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               referralCode:
 *                 type: string
 */
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password, phone, referralCode, role } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
  });

  if (existingUser) {
    throw new AppError(
      existingUser.email === email ? 'Email already registered' : 'Phone already registered',
      409, 'DUPLICATE_USER'
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const emailVerifyToken = uuidv4();
  const userReferralCode = generateReferralCode(name);

  // Find referrer
  let referredBy: string | undefined;
  if (referralCode) {
    const referrer = await prisma.user.findUnique({ where: { referralCode } });
    if (referrer) referredBy = referrer.id;
  }

  const allowedSelfRoles: Role[] = [Role.CUSTOMER, Role.WHOLESALE_BUYER];
  const assignedRole = allowedSelfRoles.includes(role) ? role : Role.CUSTOMER;

  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      name,
      email,
      phone,
      password: hashedPassword,
      role: assignedRole,
      emailVerifyToken,
      referralCode: userReferralCode,
      referredBy,
    },
    select: { id: true, name: true, email: true, role: true, phone: true },
  });

  // Create wallet
  await prisma.wallet.create({ data: { userId: user.id } });

  // Handle referral reward
  if (referredBy) {
    await prisma.referral.create({
      data: { referrerId: referredBy, referredId: user.id },
    });
  }

  // Send verification email (non-blocking)
  sendEmail({
    to: email,
    subject: '🌿 Welcome to DevVegis — Verify your email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #16a34a; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🥦 DevVegis</h1>
          <p style="color: #bbf7d0; margin: 5px 0;">Fresh Fruits & Vegetables Delivered in Minutes</p>
        </div>
        <div style="padding: 30px;">
          <h2>Welcome, ${name}! 🎉</h2>
          <p>Thank you for joining DevVegis. Please verify your email to get started.</p>
          <a href="${config.APP_URL}/verify-email?token=${emailVerifyToken}" 
             style="background: #16a34a; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 20px 0;">
            Verify Email Address
          </a>
          <p style="color: #6b7280; font-size: 14px;">Link expires in 24 hours.</p>
        </div>
      </div>
    `,
  }).catch(err => logger.error('Failed to send verification email:', err));

  const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role, user.name);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email.',
    data: { user, accessToken },
  });
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, phone: true, password: true, role: true, isActive: true, isEmailVerified: true, avatar: true },
  });

  if (!user) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  if (!user.isActive) throw new AppError('Account has been deactivated', 403, 'ACCOUNT_DEACTIVATED');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');

  const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role, user.name);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken, lastLoginAt: new Date() },
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: 'Login successful',
    data: { user: userWithoutPassword, accessToken },
  });
};

export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  const token = req.cookies.refreshToken || req.headers['x-refresh-token'];

  if (!token) throw new AppError('Refresh token required', 401, 'NO_REFRESH_TOKEN');

  const payload = jwt.verify(token, config.JWT_REFRESH_SECRET) as { id: string };

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, name: true, email: true, role: true, isActive: true, refreshToken: true },
  });

  if (!user || !user.isActive || user.refreshToken !== token) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    user.id, user.email, user.role, user.name
  );

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, data: { accessToken } });
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (userId) {
    await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
  }

  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
};

export const verifyEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  const { token } = req.query as { token: string };

  const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });

  if (!user) throw new AppError('Invalid or expired verification link', 400, 'INVALID_TOKEN');

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, emailVerifyToken: null },
  });

  // Give welcome bonus
  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (wallet && wallet.balance === 0) {
    await prisma.wallet.update({
      where: { userId: user.id },
      data: { balance: { increment: 50 }, totalCredits: { increment: 50 } },
    });
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'CREDIT',
        amount: 50,
        balance: 50,
        description: '🎁 Welcome bonus for verifying email',
      },
    });
  }

  res.json({ success: true, message: 'Email verified successfully! ₹50 added to your wallet.' });
};

export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to prevent user enumeration
  if (user) {
    const resetToken = uuidv4();
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken: resetToken }, // Reuse field for reset
    });

    sendEmail({
      to: email,
      subject: '🔐 DevVegis — Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #16a34a; padding: 20px; text-align: center;">
            <h1 style="color: white;">🥦 DevVegis</h1>
          </div>
          <div style="padding: 30px;">
            <h2>Reset Your Password</h2>
            <p>Click the button below to reset your password. This link expires in 1 hour.</p>
            <a href="${config.APP_URL}/reset-password?token=${resetToken}" 
               style="background: #16a34a; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; display: inline-block; margin: 20px 0;">
              Reset Password
            </a>
            <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `,
    }).catch(err => logger.error('Failed to send reset email:', err));
  }

  res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { token, password } = req.body;

  const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });

  if (!user) throw new AppError('Invalid or expired reset link', 400, 'INVALID_TOKEN');

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, emailVerifyToken: null, refreshToken: null },
  });

  res.json({ success: true, message: 'Password reset successfully. Please login.' });
};

export const sendPhoneOtp = async (req: AuthRequest, res: Response): Promise<void> => {
  const { phone } = req.body;
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // In production, integrate with SMS provider (Twilio/AWS SNS/MSG91)
  logger.info(`[DEV] Phone OTP for ${phone}: ${otp}`);

  let user = await prisma.user.findUnique({ where: { phone } });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { phoneOtp: otp, phoneOtpExpiry: otpExpiry },
    });
  }

  res.json({ success: true, message: 'OTP sent successfully', ...(config.NODE_ENV === 'development' ? { otp } : {}) });
};

export const verifyPhoneOtp = async (req: AuthRequest, res: Response): Promise<void> => {
  const { phone, otp } = req.body;

  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user || user.phoneOtp !== otp) throw new AppError('Invalid OTP', 400, 'INVALID_OTP');
  if (user.phoneOtpExpiry && new Date() > user.phoneOtpExpiry) {
    throw new AppError('OTP has expired', 400, 'OTP_EXPIRED');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isPhoneVerified: true, phoneOtp: null, phoneOtpExpiry: null },
  });

  res.json({ success: true, message: 'Phone verified successfully' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true, name: true, email: true, phone: true, role: true, avatar: true,
      isEmailVerified: true, isPhoneVerified: true, referralCode: true, createdAt: true,
      wallet: { select: { balance: true } },
      _count: { select: { orders: true, wishlist: true } },
    },
  });

  if (!user) throw new AppError('User not found', 404);

  res.json({ success: true, data: user });
};
