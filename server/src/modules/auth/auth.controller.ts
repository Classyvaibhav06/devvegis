import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/prisma';
import { config } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { logger } from '../../utils/logger';
import { sendEmail, sendVerificationEmail, sendVerificationOtpEmail } from '../../utils/email';
import { verifyTurnstileToken } from '../../utils/turnstile';
import { memoryCache } from '../../utils/cache';
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
  const { name, email, password, phone, referralCode, role, turnstileToken } = req.body;

  const turnstileResult = await verifyTurnstileToken(turnstileToken, req.ip);
  if (!turnstileResult.success) {
    throw new AppError(turnstileResult.error || 'Turnstile verification failed', 400, 'BOT_VERIFICATION_FAILED');
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
  });

  if (existingUser) {
    if (existingUser.isEmailVerified) {
      throw new AppError(
        existingUser.email === email ? 'Email already registered. Please sign in.' : 'Phone already registered',
        409, 'DUPLICATE_USER'
      );
    }

    // Existing account is unverified — refresh credentials & send fresh OTP
    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    const allowedSelfRoles: Role[] = [Role.CUSTOMER, Role.WHOLESALE_BUYER];
    const assignedRole = allowedSelfRoles.includes(role) ? role : Role.CUSTOMER;

    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name,
        password: hashedPassword,
        phone: phone || existingUser.phone,
        role: assignedRole,
        emailVerifyToken: otp,
        phoneOtp: otp,
        phoneOtpExpiry: otpExpiry,
      },
      select: { id: true, name: true, email: true, role: true, phone: true },
    });

    let emailSent = false;
    try {
      const emailResult = await sendVerificationOtpEmail({
        to: email,
        name,
        otp,
      });
      emailSent = emailResult.success === true;
      if (!emailSent) {
        logger.warn(`[Email Notice] Direct delivery to ${email} was restricted or failed. Verification OTP is: ${otp}`);
      }
    } catch (err) {
      logger.error('[Resend Verification] Failed to send verification OTP:', err);
      emailSent = false;
    }

    res.status(200).json({
      success: true,
      message: 'Account pending verification! A new 6-digit verification code has been sent to your email.',
      data: {
        user: updatedUser,
        email: updatedUser.email,
        emailSent,
      },
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
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
      isEmailVerified: false,
      emailVerifyToken: otp,
      phoneOtp: otp,
      phoneOtpExpiry: otpExpiry,
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

  // Send verification OTP email via Resend
  let emailSent = false;
  try {
    const emailResult = await sendVerificationOtpEmail({
      to: email,
      name,
      otp,
    });
    emailSent = emailResult.success === true;
    if (!emailSent) {
      logger.warn(`[Email Notice] Direct delivery to ${email} was restricted or failed. Verification OTP is: ${otp}`);
    }
  } catch (err) {
    logger.error('[Resend Verification] Failed to send verification OTP:', err);
    emailSent = false;
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful! A 6-digit verification code has been sent to your email.',
    data: {
      user,
      email: user.email,
      emailSent,
    },
  });
};

// ── Per-account login lockout constants ──────────────────────────────────────
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCKOUT_SECONDS = 15 * 60; // 15 minutes

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password, turnstileToken } = req.body;

  if (!email) throw new AppError('Email is required', 400, 'VALIDATION_ERROR');

  const normalizedEmail = String(email).trim().toLowerCase();
  const lockoutKey = `login_lockout:${normalizedEmail}`;
  const attemptsKey = `login_attempts:${normalizedEmail}`;

  // ── Check if this account is currently locked out ──────────────────────────
  const isLockedOut = memoryCache.get<boolean>(lockoutKey);
  if (isLockedOut) {
    throw new AppError(
      'Too many failed login attempts. This account is temporarily locked for 15 minutes.',
      429,
      'ACCOUNT_TEMPORARILY_LOCKED'
    );
  }

  const turnstileResult = await verifyTurnstileToken(turnstileToken, req.ip);
  if (!turnstileResult.success) {
    throw new AppError(turnstileResult.error || 'Turnstile verification failed', 400, 'BOT_VERIFICATION_FAILED');
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, name: true, email: true, phone: true, password: true, role: true, isActive: true, isEmailVerified: true, avatar: true },
  });

  if (!user) {
    // Increment attempt counter even for non-existent accounts to prevent user enumeration
    const attempts = (memoryCache.get<number>(attemptsKey) ?? 0) + 1;
    if (attempts >= LOGIN_MAX_ATTEMPTS) {
      memoryCache.set(lockoutKey, true, LOGIN_LOCKOUT_SECONDS);
      memoryCache.del(attemptsKey);
    } else {
      memoryCache.set(attemptsKey, attempts, LOGIN_LOCKOUT_SECONDS);
    }
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) throw new AppError('Account has been deactivated', 403, 'ACCOUNT_DEACTIVATED');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    // Increment per-account failure counter
    const attempts = (memoryCache.get<number>(attemptsKey) ?? 0) + 1;
    if (attempts >= LOGIN_MAX_ATTEMPTS) {
      memoryCache.set(lockoutKey, true, LOGIN_LOCKOUT_SECONDS);
      memoryCache.del(attemptsKey);
      logger.warn(`[AUTH] Account locked after ${LOGIN_MAX_ATTEMPTS} failed attempts: ${normalizedEmail}`);
      throw new AppError(
        'Too many failed login attempts. This account is temporarily locked for 15 minutes.',
        429,
        'ACCOUNT_TEMPORARILY_LOCKED'
      );
    }
    memoryCache.set(attemptsKey, attempts, LOGIN_LOCKOUT_SECONDS);
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isEmailVerified && user.role !== 'ADMIN') {
    throw new AppError('Please verify your email address before logging in.', 403, 'EMAIL_NOT_VERIFIED');
  }

  // ── Successful login — reset any per-account failure counters ────────────
  memoryCache.del(attemptsKey);
  memoryCache.del(lockoutKey);

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
  const email = (req.body?.email || req.query?.email || '') as string;
  const otp = (req.body?.otp || req.query?.otp || req.query?.token || '') as string;

  if (!otp) {
    throw new AppError('Verification code (OTP) is required', 400, 'MISSING_OTP');
  }

  // Match by email if provided, or directly by OTP
  const user = await prisma.user.findFirst({
    where: email
      ? { email }
      : { OR: [{ emailVerifyToken: otp }, { phoneOtp: otp }] },
  });

  if (!user) {
    throw new AppError('User not found or invalid verification code', 400, 'INVALID_OTP');
  }

  if (user.isEmailVerified) {
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role, user.name);
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      success: true,
      message: 'Account is already verified! Logged in successfully.',
      data: { user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }, accessToken },
    });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const lockoutKey = `email_otp_lockout:${cleanEmail}`;
  if (cleanEmail && memoryCache.get<boolean>(lockoutKey)) {
    throw new AppError('Too many failed verification attempts. Please wait 15 minutes before trying again.', 429, 'OTP_VERIFY_LOCKOUT');
  }

  const isMatch = user.emailVerifyToken === otp || user.phoneOtp === otp;
  if (!isMatch) {
    if (cleanEmail) {
      const failKey = `email_otp_fails:${cleanEmail}`;
      const fails = (memoryCache.get<number>(failKey) ?? 0) + 1;
      if (fails >= 5) {
        memoryCache.set(lockoutKey, true, 900);
        memoryCache.del(failKey);
        throw new AppError('Too many invalid attempts. This account is temporarily locked for 15 minutes.', 429, 'OTP_VERIFY_LOCKOUT');
      }
      memoryCache.set(failKey, fails, 900);
    }
    throw new AppError('Invalid 6-digit verification code. Please check and try again.', 400, 'INVALID_OTP');
  }

  if (cleanEmail) {
    memoryCache.del(lockoutKey);
    memoryCache.del(`email_otp_fails:${cleanEmail}`);
  }

  if (user.phoneOtpExpiry && new Date() > user.phoneOtpExpiry) {
    throw new AppError('Verification code has expired. Please click resend to get a new code.', 400, 'OTP_EXPIRED');
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerifyToken: null,
      phoneOtp: null,
      phoneOtpExpiry: null,
    },
    select: { id: true, name: true, email: true, role: true, phone: true },
  });

  const { accessToken, refreshToken } = generateTokens(updatedUser.id, updatedUser.email, updatedUser.role, updatedUser.name);
  await prisma.user.update({ where: { id: updatedUser.id }, data: { refreshToken } });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    message: 'Email verified successfully! Welcome to DevVegis.',
    data: { user: updatedUser, accessToken },
  });
};

export const resendVerificationEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, turnstileToken } = req.body;
  if (!email) throw new AppError('Email address is required', 400);

  if (turnstileToken) {
    const turnstileResult = await verifyTurnstileToken(turnstileToken, req.ip);
    if (!turnstileResult.success) {
      throw new AppError(turnstileResult.error || 'Turnstile verification failed', 400, 'BOT_VERIFICATION_FAILED');
    }
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cooldownKey = `email_otp_cooldown:${cleanEmail}`;
  if (memoryCache.get<boolean>(cooldownKey)) {
    throw new AppError('Please wait 60 seconds before requesting another code.', 429, 'OTP_COOLDOWN');
  }

  const countKey = `email_otp_count:${cleanEmail}`;
  const count = memoryCache.get<number>(countKey) ?? 0;
  if (count >= 5) {
    throw new AppError('Too many verification requests for this email. Please try again after 1 hour.', 429, 'OTP_TARGET_RATE_LIMITED');
  }

  memoryCache.set(cooldownKey, true, 60);
  memoryCache.set(countKey, count + 1, 3600);

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user) {
    res.json({ success: true, message: 'If this email is registered, a new verification code has been sent.' });
    return;
  }

  if (user.isEmailVerified) {
    res.json({ success: true, message: 'This account is already verified. You can log in directly.' });
    return;
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifyToken: otp,
      phoneOtp: otp,
      phoneOtpExpiry: otpExpiry,
    },
  });

  let emailSent = false;
  try {
    const result = await sendVerificationOtpEmail({ to: user.email, name: user.name, otp });
    emailSent = result.success === true;
    if (!emailSent) {
      logger.warn(`[Email Notice] Direct delivery to ${email} was restricted or failed. Resend OTP is: ${otp}`);
    }
  } catch (err) {
    logger.error('[Resend Verification] Failed to resend email:', err);
    emailSent = false;
  }

  res.json({
    success: true,
    message: 'A new 6-digit verification code has been sent to your email.',
    data: {
      email: user.email,
      emailSent,
    },
  });
};

export const getVerificationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const email = (req.query.email as string || '').trim().toLowerCase();
  if (!email) throw new AppError('Email query parameter is required', 400);

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true, email: true, isEmailVerified: true, phoneOtpExpiry: true },
  });

  if (!user) throw new AppError('User not found', 404);

  res.json({
    success: true,
    data: {
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      isExpired: user.phoneOtpExpiry ? new Date() > user.phoneOtpExpiry : false,
    },
  });
};


export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, turnstileToken } = req.body;

  if (turnstileToken || config.NODE_ENV === 'production') {
    const turnstileResult = await verifyTurnstileToken(turnstileToken, req.ip);
    if (!turnstileResult.success) {
      throw new AppError(turnstileResult.error || 'Security verification failed', 400, 'BOT_VERIFICATION_FAILED');
    }
  }

  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) {
    throw new AppError('Valid email address is required', 400, 'VALIDATION_ERROR');
  }

  // Per-email rate limit: max 3 reset emails per 15 minutes to stop email flooding/bombing
  const rateLimitKey = `forgot_pwd_count_${cleanEmail}`;
  const attempts = memoryCache.get<number>(rateLimitKey) || 0;
  if (attempts >= 3) {
    logger.warn(`[ForgotPassword] Rate limit hit for email: ${cleanEmail}`);
    res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
    return;
  }
  memoryCache.set(rateLimitKey, attempts + 1, 900); // 15-minute window

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

  // Always return success to prevent user enumeration
  if (user) {
    const resetToken = uuidv4();
    const expiresAt = Date.now() + 60 * 60 * 1000; // Strictly 1 hour from now

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken: `RESET:${resetToken}:${expiresAt}` },
    });

    // Determine correct app URL: prefer caller origin on devvegis.com over default localhost
    const reqOrigin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : '');
    const baseUrl = reqOrigin && (reqOrigin.includes('devvegis.com') || reqOrigin.includes('localhost'))
      ? reqOrigin.replace(/\/$/, '')
      : (config.APP_URL || 'https://devvegis.com').replace(/\/$/, '');

    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    sendEmail({
      to: cleanEmail,
      subject: '🔐 DevVegis — Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background: #10b981; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">DevVegis</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 4px 0 0; font-size: 13px;">Security & Account Protection</p>
          </div>
          <div style="padding: 32px; background: #ffffff; color: #1e293b;">
            <h2 style="font-size: 18px; margin: 0 0 12px; color: #0f172a;">Reset Your Password</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px;">
              Hello ${user.name || 'there'},<br />
              We received a request to reset the password for your DevVegis account (<strong>${cleanEmail}</strong>). Click the button below to choose a new password:
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetUrl}" 
                 style="background: #10b981; color: white; padding: 14px 32px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
                Reset My Password
              </a>
            </div>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 8px;">
              ⏱ <strong>Note:</strong> This secure reset link is valid for <strong>1 hour</strong> only and can only be used once.
            </p>
            <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 16px 0 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
              If you didn't request this password reset, no action is needed. Your account remains completely secure.
            </p>
          </div>
        </div>
      `,
    }).catch(err => logger.error('Failed to send reset email:', err));
  }

  res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
};

export const verifyResetToken = async (req: AuthRequest, res: Response): Promise<void> => {
  const token = String(req.query.token || '').trim();
  if (!token) {
    throw new AppError('Reset token is required', 400, 'INVALID_TOKEN');
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { emailVerifyToken: { startsWith: `RESET:${token}:` } },
        { emailVerifyToken: token },
      ],
    },
    select: { id: true, email: true, emailVerifyToken: true },
  });

  if (!user || !user.emailVerifyToken) {
    throw new AppError('Invalid or expired reset link. Please request a new one.', 400, 'INVALID_TOKEN');
  }

  if (user.emailVerifyToken.startsWith('RESET:')) {
    const parts = user.emailVerifyToken.split(':');
    if (parts.length === 3 && Date.now() > Number(parts[2])) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerifyToken: null },
      });
      throw new AppError('Password reset link has expired. Please request a new one.', 400, 'TOKEN_EXPIRED');
    }
  }

  res.json({
    success: true,
    data: { email: user.email },
    message: 'Reset token is valid',
  });
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { token, password, turnstileToken } = req.body;

  if (turnstileToken || config.NODE_ENV === 'production') {
    const turnstileResult = await verifyTurnstileToken(turnstileToken, req.ip);
    if (!turnstileResult.success) {
      throw new AppError(turnstileResult.error || 'Security verification failed', 400, 'BOT_VERIFICATION_FAILED');
    }
  }

  // Rate limiting per IP to prevent brute-force attacks on reset tokens
  const ipKey = `reset_pwd_ip_${req.ip}`;
  const ipAttempts = memoryCache.get<number>(ipKey) || 0;
  if (ipAttempts >= 10) {
    throw new AppError('Too many password reset attempts. Please try again after 15 minutes.', 429, 'RATE_LIMITED');
  }
  memoryCache.set(ipKey, ipAttempts + 1, 900);

  const cleanToken = String(token || '').trim();
  if (!cleanToken) {
    throw new AppError('Invalid reset token', 400, 'INVALID_TOKEN');
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new AppError('Password must be at least 8 characters long.', 400, 'WEAK_PASSWORD');
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { emailVerifyToken: { startsWith: `RESET:${cleanToken}:` } },
        { emailVerifyToken: cleanToken },
      ],
    },
  });

  if (!user || !user.emailVerifyToken) {
    throw new AppError('Invalid or expired reset link. Please request a new one.', 400, 'INVALID_TOKEN');
  }

  // Check 1-hour expiration timestamp
  if (user.emailVerifyToken.startsWith('RESET:')) {
    const parts = user.emailVerifyToken.split(':');
    if (parts.length === 3 && Date.now() > Number(parts[2])) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerifyToken: null },
      });
      throw new AppError('Password reset link has expired. Please request a new one.', 400, 'TOKEN_EXPIRED');
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      emailVerifyToken: null,
      refreshToken: null,
      isEmailVerified: true,
    },
  });

  logger.info(`[AUTH] Password successfully reset for user ${user.email}`);

  res.json({ success: true, message: 'Password reset successfully. Please sign in with your new password.' });
};

export const sendPhoneOtp = async (req: AuthRequest, res: Response): Promise<void> => {
  const { phone, turnstileToken } = req.body;

  if (!phone || typeof phone !== 'string') {
    throw new AppError('Valid phone number is required', 400, 'VALIDATION_ERROR');
  }

  // 1. CAPTCHA verification
  const turnstileResult = await verifyTurnstileToken(turnstileToken, req.ip);
  if (!turnstileResult.success) {
    throw new AppError(turnstileResult.error || 'Turnstile verification failed', 400, 'BOT_VERIFICATION_FAILED');
  }

  // 2. Strict phone format validation (Indian 10-digit mobile or +91 standard)
  const cleanPhone = phone.trim().replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  if (!phoneRegex.test(cleanPhone)) {
    throw new AppError('Invalid mobile number format. Please provide a valid 10-digit mobile number.', 400, 'INVALID_PHONE_FORMAT');
  }

  // 3. Per-target cooldown (60 seconds)
  const cooldownKey = `phone_otp_cooldown:${cleanPhone}`;
  if (memoryCache.get<boolean>(cooldownKey)) {
    throw new AppError('Please wait 60 seconds before requesting another OTP.', 429, 'OTP_COOLDOWN');
  }

  // 4. Per-target hourly rate limit (max 5 per hour)
  const hourlyCountKey = `phone_otp_count:${cleanPhone}`;
  const hourlyCount = memoryCache.get<number>(hourlyCountKey) ?? 0;
  if (hourlyCount >= 5) {
    throw new AppError('Too many OTP requests for this phone number. Please try again after 1 hour.', 429, 'OTP_TARGET_RATE_LIMITED');
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  memoryCache.set(cooldownKey, true, 60);
  memoryCache.set(hourlyCountKey, hourlyCount + 1, 3600);

  // In production, integrate with SMS provider (Twilio/AWS SNS/MSG91)
  logger.info(`[Phone OTP] Sent to ${cleanPhone}: ${otp}`);

  let user = await prisma.user.findUnique({ where: { phone: cleanPhone } });

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

  if (!phone || !otp) {
    throw new AppError('Phone and OTP are required', 400, 'VALIDATION_ERROR');
  }

  const cleanPhone = String(phone).trim().replace(/[\s\-\(\)]/g, '');
  const lockoutKey = `phone_otp_lockout:${cleanPhone}`;
  if (memoryCache.get<boolean>(lockoutKey)) {
    throw new AppError('Too many invalid attempts. This phone number is temporarily locked for 15 minutes.', 429, 'PHONE_OTP_LOCKED');
  }

  const user = await prisma.user.findUnique({ where: { phone: cleanPhone } });

  const failKey = `phone_otp_fails:${cleanPhone}`;
  const failCount = memoryCache.get<number>(failKey) ?? 0;

  if (!user || user.phoneOtp !== otp) {
    const newCount = failCount + 1;
    if (newCount >= 5) {
      memoryCache.set(lockoutKey, true, 900); // 15 minutes lockout
      memoryCache.del(failKey);
      throw new AppError('Too many invalid attempts. This phone number is temporarily locked for 15 minutes.', 429, 'PHONE_OTP_LOCKED');
    }
    memoryCache.set(failKey, newCount, 900);
    throw new AppError('Invalid OTP', 400, 'INVALID_OTP');
  }

  if (user.phoneOtpExpiry && new Date() > user.phoneOtpExpiry) {
    throw new AppError('OTP has expired', 400, 'OTP_EXPIRED');
  }

  memoryCache.del(failKey);
  memoryCache.del(lockoutKey);

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

/**
 * Google OAuth: Handle Google Token / One-Tap / Credential POST
 */
export const googleAuth = async (req: AuthRequest, res: Response): Promise<void> => {
  const { credential, email: bodyEmail, name: bodyName, avatar: bodyAvatar, role: requestedRole } = req.body;

  let email = bodyEmail;
  let name = bodyName;
  let avatar = bodyAvatar;

  // 1. If Google ID token (credential) was passed from Google Identity Services
  if (credential) {
    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (response.ok) {
        const payload: any = await response.json();
        email = payload.email || email;
        name = payload.name || name || 'Google User';
        avatar = payload.picture || avatar;
      } else {
        const base64Url = credential.split('.')[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            Buffer.from(base64, 'base64')
              .toString('utf-8')
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const parsed = JSON.parse(jsonPayload);
          email = parsed.email || email;
          name = parsed.name || name || 'Google User';
          avatar = parsed.picture || avatar;
        }
      }
    } catch (err) {
      logger.warn('Google token decode warning, using payload fallback:', err);
    }
  }

  if (!email) {
    throw new AppError('Google email address is required', 400, 'INVALID_GOOGLE_DATA');
  }

  email = email.toLowerCase().trim();

  // 2. Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      isEmailVerified: true,
      avatar: true,
    },
  });

  if (user && !user.isActive) {
    throw new AppError('Account has been deactivated', 403, 'ACCOUNT_DEACTIVATED');
  }

  // 3. If new user, create in PostgreSQL
  if (!user) {
    const randomPassword = await bcrypt.hash(uuidv4(), 10);
    const userReferralCode = generateReferralCode(name || 'USER');
    const targetRole = requestedRole === 'WHOLESALE_BUYER' ? Role.WHOLESALE_BUYER : Role.CUSTOMER;

    try {
      user = await prisma.user.create({
        data: {
          id: uuidv4(),
          name: name || 'Google User',
          email,
          password: randomPassword,
          role: targetRole,
          avatar: avatar || null,
          isEmailVerified: true,
          referralCode: userReferralCode,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          avatar: true,
        },
      });

      // Create wallet for new user
      try {
        await prisma.wallet.create({ data: { userId: user.id } });
      } catch (e) {
        logger.warn('Wallet creation failed or already exists:', e);
      }
    } catch (err: any) {
      if (err?.code === 'P2002') {
        user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            isEmailVerified: true,
            avatar: true,
          },
        });
      } else {
        throw err;
      }
    }
  }

  if (!user) {
    throw new AppError('Failed to synchronize user account', 500);
  }

  // Ensure email is verified and update avatar if newly provided
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      avatar: avatar || user.avatar,
      lastLoginAt: new Date(),
    },
  });

  // 4. Generate standard JWT tokens
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

  res.json({
    success: true,
    message: 'Google login successful',
    data: { user, accessToken },
  });
};

/**
 * Google OAuth: Initiate Redirect to Google Consent Screen
 */
export const googleAuthRedirect = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!config.GOOGLE_CLIENT_ID) {
    return res.redirect(`${config.APP_URL}/login?oauth_error=Google+OAuth+Client+ID+not+configured`);
  }

  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: config.GOOGLE_CALLBACK_URL,
    client_id: config.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options).toString();
  res.redirect(`${rootUrl}?${qs}`);
};

/**
 * Google OAuth: Callback handler after user grants consent
 */
export const googleAuthCallback = async (req: AuthRequest, res: Response): Promise<void> => {
  const code = req.query.code as string;

  if (!code) {
    return res.redirect(`${config.APP_URL}/login?oauth_error=No+code+received+from+Google`);
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: config.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errData = await tokenResponse.text();
      logger.error('Failed to exchange Google OAuth code:', errData);
      return res.redirect(`${config.APP_URL}/login?oauth_error=Failed+to+exchange+Google+token`);
    }

    const tokenData: any = await tokenResponse.json();

    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userinfoResponse.ok) {
      return res.redirect(`${config.APP_URL}/login?oauth_error=Failed+to+fetch+Google+user+profile`);
    }

    const profile: any = await userinfoResponse.json();
    const email = profile.email?.toLowerCase().trim();
    const name = profile.name || 'Google User';
    const avatar = profile.picture || null;

    if (!email) {
      return res.redirect(`${config.APP_URL}/login?oauth_error=Google+profile+missing+email`);
    }

    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        avatar: true,
      },
    });

    if (user && !user.isActive) {
      return res.redirect(`${config.APP_URL}/login?oauth_error=Account+is+deactivated`);
    }

    if (!user) {
      const randomPassword = await bcrypt.hash(uuidv4(), 10);
      const userReferralCode = generateReferralCode(name);

      user = await prisma.user.create({
        data: {
          id: uuidv4(),
          name,
          email,
          password: randomPassword,
          role: Role.CUSTOMER,
          avatar,
          isEmailVerified: true,
          referralCode: userReferralCode,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
          avatar: true,
        },
      });

      try {
        await prisma.wallet.create({ data: { userId: user.id } });
      } catch (e) {
        logger.warn('Wallet creation failed or already exists:', e);
      }
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true, avatar: avatar || user.avatar, lastLoginAt: new Date() },
      });
    }

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

    res.redirect(`${config.APP_URL}/oauth-callback?token=${accessToken}&role=${user.role}&name=${encodeURIComponent(user.name)}`);
  } catch (err: any) {
    logger.error('Google OAuth callback error:', err);
    res.redirect(`${config.APP_URL}/login?oauth_error=${encodeURIComponent(err.message || 'OAuth callback error')}`);
  }
};

/**
 * Google OAuth: Synchronize authenticated session from neon_auth schema into DevVegis public.User
 */
export const syncNeonAuth = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionToken, role: requestedRole } = req.body;

  let neonUser: any = null;

  // 1. If a session token was passed, query neon_auth.session joined with neon_auth.user
  if (sessionToken) {
    try {
      const sessionRecord = await prisma.$queryRaw<any[]>`
        SELECT s.*, u.id as "neonUserId", u.name, u.email, u.image 
        FROM neon_auth.session s
        JOIN neon_auth.user u ON s."userId" = u.id
        WHERE s.token = ${sessionToken} AND s."expiresAt" > NOW()
        LIMIT 1
      `;
      if (sessionRecord && sessionRecord.length > 0) {
        neonUser = sessionRecord[0];
      }
    } catch (err) {
      logger.warn('Error querying neon_auth session token:', err);
    }
  }

  // 2. If no sessionToken or not found, check the most recent user in neon_auth.user (within last 10 minutes)
  if (!neonUser) {
    try {
      const recentUsers = await prisma.$queryRaw<any[]>`
        SELECT id, name, email, image, "createdAt", "updatedAt"
        FROM neon_auth.user
        WHERE "updatedAt" > NOW() - INTERVAL '10 minutes'
        ORDER BY "updatedAt" DESC
        LIMIT 1
      `;
      if (recentUsers && recentUsers.length > 0) {
        neonUser = recentUsers[0];
      }
    } catch (err) {
      logger.warn('Error querying recent neon_auth user:', err);
    }
  }

  if (!neonUser || !neonUser.email) {
    throw new AppError('No authenticated Google session found. Please try again.', 401, 'NO_SESSION');
  }

  const email = neonUser.email.toLowerCase().trim();
  const name = neonUser.name || 'Google User';
  const avatar = neonUser.image || null;

  // Sync with main User table in public schema
  let user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, isEmailVerified: true, avatar: true },
  });

  if (user && !user.isActive) {
    throw new AppError('Account has been deactivated', 403, 'ACCOUNT_DEACTIVATED');
  }

  if (!user) {
    const randomPassword = await bcrypt.hash(uuidv4(), 10);
    const userReferralCode = generateReferralCode(name);
    const targetRole = requestedRole === 'WHOLESALE_BUYER' ? Role.WHOLESALE_BUYER : Role.CUSTOMER;

    try {
      user = await prisma.user.create({
        data: {
          id: uuidv4(),
          name,
          email,
          password: randomPassword,
          role: targetRole,
          avatar,
          isEmailVerified: true,
          referralCode: userReferralCode,
        },
        select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, isEmailVerified: true, avatar: true },
      });

      try {
        await prisma.wallet.create({ data: { userId: user.id } });
      } catch (e) {
        logger.warn('Wallet creation failed:', e);
      }
    } catch (err: any) {
      if (err?.code === 'P2002') {
        user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, isEmailVerified: true, avatar: true },
        });
      } else {
        throw err;
      }
    }
  }

  if (!user) {
    throw new AppError('Failed to synchronize user account', 500);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, avatar: avatar || user.avatar, lastLoginAt: new Date() },
  });

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

  res.json({
    success: true,
    message: 'Google login successful',
    data: { user, accessToken },
  });
};
