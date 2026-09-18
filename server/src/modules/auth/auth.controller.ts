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
  let emailRestricted = false;
  try {
    const emailResult = await sendVerificationOtpEmail({
      to: email,
      name,
      otp,
    });
    if (emailResult.isRestricted) {
      emailRestricted = true;
      logger.warn(`[Resend Sandbox] Email restricted for ${email}. Dev OTP: ${otp}`);
    }
  } catch (err) {
    logger.error('[Resend Verification] Failed to send verification OTP:', err);
    emailRestricted = true;
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful! A 6-digit verification code has been sent to your email.',
    data: {
      user,
      email: user.email,
      ...(emailRestricted || config.NODE_ENV !== 'production' ? { devOtp: otp, emailRestricted: true } : {}),
    },
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

  if (!user.isEmailVerified && user.role !== 'ADMIN') {
    throw new AppError('Please verify your email address before logging in.', 403, 'EMAIL_NOT_VERIFIED');
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

  const isMatch = user.emailVerifyToken === otp || user.phoneOtp === otp;
  if (!isMatch) {
    throw new AppError('Invalid 6-digit verification code. Please check and try again.', 400, 'INVALID_OTP');
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
  const { email } = req.body;
  if (!email) throw new AppError('Email address is required', 400);

  const user = await prisma.user.findUnique({ where: { email } });
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

  let emailRestricted = false;
  try {
    const result = await sendVerificationOtpEmail({ to: user.email, name: user.name, otp });
    if (result.isRestricted) {
      emailRestricted = true;
      logger.warn(`[Resend Sandbox] Email restricted for ${email}. Resend Dev OTP: ${otp}`);
    }
  } catch (err) {
    logger.error('[Resend Verification] Failed to resend email:', err);
    emailRestricted = true;
  }

  res.json({
    success: true,
    message: 'A new 6-digit verification code has been sent to your email.',
    data: {
      email: user.email,
      ...(emailRestricted || config.NODE_ENV !== 'production' ? { devOtp: otp, emailRestricted: true } : {}),
    },
  });
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
