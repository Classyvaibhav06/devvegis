// DevVegis — Express App Definition
import dns from 'dns';
try { dns.setDefaultResultOrder('ipv4first'); } catch {}
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import jwt from 'jsonwebtoken';
import { config } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { setupSwagger } from './config/swagger';

// Import all route modules
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import productRoutes from './modules/products/products.routes';
import categoryRoutes from './modules/categories/categories.routes';
import cartRoutes from './modules/cart/cart.routes';
import wishlistRoutes from './modules/wishlist/wishlist.routes';
import addressRoutes from './modules/addresses/addresses.routes';
import orderRoutes from './modules/orders/orders.routes';
import paymentRoutes from './modules/payments/payments.routes';
import couponRoutes from './modules/coupons/coupons.routes';
import walletRoutes from './modules/wallet/wallet.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import bannerRoutes from './modules/banners/banners.routes';
import reviewRoutes from './modules/reviews/reviews.routes';
import riderRoutes from './modules/riders/riders.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import wholesaleRoutes from './modules/wholesale/wholesale.routes';
import adminRoutes from './modules/admin/admin.routes';
import aiRoutes from './modules/ai/ai.routes';
import uploadRoutes from './modules/upload/upload.routes';

const app = express();

// Trust reverse proxy (Next.js rewrites, Cloudflare, Nginx, Vercel, Neon)
app.set('trust proxy', 1);

// ─── SECURITY MIDDLEWARE ──────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const explicitAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://devvegis.com',
  'https://www.devvegis.com',
  'https://devvegis-client.vercel.app',
  ...(config.CORS_ORIGIN ? config.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean) : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like native mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isExplicit = explicitAllowedOrigins.includes(origin);
    const isVercelPreview = /^https:\/\/devvegis(-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);

    if (isExplicit || isVercelPreview) {
      return callback(null, true);
    }

    // Strictly reject unknown origins — NEVER reflect arbitrary origin headers with credentials
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
}));

// ─── BODY PARSING ─────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── RATE LIMITING TIERS ──────────────────────────────
const createRateLimiter = (maxRequests: number, windowMinutes: number, message: string, code = 'RATE_LIMIT_EXCEEDED') => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        error: message,
        code,
      });
    },
  });
};

/**
 * Extracts userId from authenticated session or decoded JWT token; falls back to client IP.
 * This guarantees user-scoped throttling that cannot be bypassed via proxy rotation.
 */
const getUserOrIpKey = (req: express.Request): string => {
  if ((req as any).user?.id) return `usr:${(req as any).user.id}`;

  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded: any = jwt.decode(token);
      if (decoded?.id || decoded?.sub) return `usr:${decoded.id || decoded.sub}`;
    } catch {}
  }

  const cookieToken = req.cookies?.accessToken;
  if (cookieToken) {
    try {
      const decoded: any = jwt.decode(cookieToken);
      if (decoded?.id || decoded?.sub) return `usr:${decoded.id || decoded.sub}`;
    } catch {}
  }

  return `ip:${req.ip || req.socket?.remoteAddress || 'unknown'}`;
};

const createUserRateLimiter = (maxRequests: number, windowMinutes: number, message: string, code: string) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    keyGenerator: getUserOrIpKey,
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        error: message,
        code,
      });
    },
  });
};

// ── Tier 1: Public Limiters (IP-Scoped) ───────────────
const globalLimiter = createRateLimiter(500, 15, 'Too many requests. Please try again shortly.', 'GLOBAL_RATE_LIMITED');
const authLimiter = createRateLimiter(30, 15, 'Too many authentication attempts. Please try again after 15 minutes.', 'AUTH_RATE_LIMITED');
const rfqLimiter = createRateLimiter(10, 15, 'Too many quotation requests from this network. Please wait 15 minutes.', 'RFQ_RATE_LIMITED');
const analyticsLimiter = createRateLimiter(120, 1, 'Too many telemetry requests. Please slow down.', 'ANALYTICS_RATE_LIMITED');

const catalogLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute (2 req/sec)
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many catalog requests. Please wait a moment before trying again.',
      code: 'CATALOG_RATE_LIMITED',
    });
  },
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 search queries per minute
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  skip: (req) => !req.query?.search,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many search queries. Please wait a minute before searching again.',
      code: 'SEARCH_RATE_LIMITED',
    });
  },
});

const otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown',
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many OTP requests from this network. Please wait 10 minutes before requesting again.',
      code: 'OTP_SEND_RATE_LIMITED',
    });
  },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 attempts per 10 min prevents brute forcing
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown',
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many invalid verification attempts. For your security, please wait 10 minutes before trying again.',
      code: 'OTP_VERIFY_RATE_LIMITED',
    });
  },
});

// ── Tier 2: Private / User-Aware Limiters (usr:id || ip) ───
const couponValidateLimiter = createUserRateLimiter(15, 10, 'Too many coupon validations. Please wait 10 minutes.', 'COUPON_RATE_LIMITED');
const cartLimiter = createUserRateLimiter(60, 1, 'Too many cart modifications. Please wait a moment.', 'CART_RATE_LIMITED');
const wishlistLimiter = createUserRateLimiter(60, 1, 'Too many wishlist operations. Please wait a moment.', 'WISHLIST_RATE_LIMITED');
const checkoutLimiter = createUserRateLimiter(30, 15, 'Too many checkout or payment requests. Please try again shortly.', 'CHECKOUT_RATE_LIMITED');
const uploadLimiter = createUserRateLimiter(20, 10, 'Too many file uploads. Please wait 10 minutes.', 'UPLOAD_RATE_LIMITED');
const aiLimiter = createUserRateLimiter(10, 5, 'Too many AI requests. Please wait 5 minutes before generating again.', 'AI_RATE_LIMITED');
const addressLimiter = createUserRateLimiter(30, 10, 'Too many address changes. Please wait 10 minutes.', 'ADDRESS_RATE_LIMITED');
const walletLimiter = createUserRateLimiter(30, 1, 'Too many wallet requests. Please slow down.', 'WALLET_RATE_LIMITED');
const notificationLimiter = createUserRateLimiter(60, 1, 'Too many notification requests. Please slow down.', 'NOTIFICATION_RATE_LIMITED');
const userProfileLimiter = createUserRateLimiter(30, 15, 'Too many profile or account updates. Please wait 15 minutes.', 'PROFILE_RATE_LIMITED');
const riderLimiter = createUserRateLimiter(120, 1, 'Too many rider updates. Please wait a moment.', 'RIDER_RATE_LIMITED');
const adminLimiter = createUserRateLimiter(120, 1, 'Too many administrative requests. Please slow down.', 'ADMIN_RATE_LIMITED');

const reviewSubmissionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: getUserOrIpKey,
  skip: (req) => req.method === 'GET', // Public GET reviews is covered by catalogLimiter
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many review submissions. Please wait 10 minutes.',
      code: 'REVIEW_RATE_LIMITED',
    });
  },
});

// ── Apply Limiters ────────────────────────────────────
// 1. Global network-level fallback
app.use('/api', globalLimiter);

// 2. Sensitive OTP & Verification (Anti-Abuse - mounted before general auth)
app.use('/api/v1/auth/send-otp', otpSendLimiter);
app.use('/api/v1/auth/resend-verification', otpSendLimiter);
app.use('/api/v1/auth/resend-otp', otpSendLimiter);
app.use('/api/v1/auth/forgot-password', otpSendLimiter);
app.use('/api/v1/orders/:id/resend-otp', otpSendLimiter);

app.use('/api/v1/auth/verify-email', otpVerifyLimiter);
app.use('/api/v1/auth/verify-email-otp', otpVerifyLimiter);
app.use('/api/v1/auth/verify-otp', otpVerifyLimiter);

// 3. General Public Auth & Identity
app.use('/api/v1/auth', authLimiter);
app.use('/api/auth', authLimiter);

// 4. Public Catalog & Storefront Reads
app.use('/api/v1/products', searchLimiter);
app.use('/api/v1/products', catalogLimiter);
app.use('/api/v1/categories', catalogLimiter);
app.use('/api/v1/banners', catalogLimiter);
app.use('/api/v1/reviews', catalogLimiter);
app.use('/api/v1/wholesale/products', catalogLimiter);
app.use('/api/v1/wholesale/mandi-tickers', catalogLimiter);

// 5. Public Inquiries & Telemetry
app.use('/api/v1/wholesale/rfq', rfqLimiter);
app.use('/api/v1/analytics/track', analyticsLimiter);

// 6. Private / User-Scoped Business Endpoints
app.use('/api/v1/coupons/validate', couponValidateLimiter);
app.use('/api/v1/cart', cartLimiter);
app.use('/api/v1/wishlist', wishlistLimiter);
app.use('/api/v1/orders', checkoutLimiter);
app.use('/api/v1/payments', checkoutLimiter);
app.use('/api/v1/upload', uploadLimiter);
app.use('/api/v1/ai', aiLimiter);
app.use('/api/v1/reviews', reviewSubmissionLimiter);
app.use('/api/v1/addresses', addressLimiter);
app.use('/api/v1/wallet', walletLimiter);
app.use('/api/v1/notifications', notificationLimiter);
app.use('/api/v1/users', userProfileLimiter);
app.use('/api/v1/riders', riderLimiter);
app.use('/api/v1/inventory', adminLimiter);
app.use('/api/v1/admin', adminLimiter);

// ─── LOGGING ─────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (message) => logger.http(message.trim()) },
}));

// ─── STATIC FILES ─────────────────────────────────────
const uploadsPath = path.resolve(process.cwd(), config.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadsPath, { maxAge: '30d' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), { maxAge: '30d' }));

// ─── HEALTH CHECK ─────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ─── API ROUTES ───────────────────────────────────────
const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/cart', cartRoutes);
apiRouter.use('/wishlist', wishlistRoutes);
apiRouter.use('/addresses', addressRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/coupons', couponRoutes);
apiRouter.use('/wallet', walletRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/banners', bannerRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/riders', riderRoutes);
apiRouter.use('/inventory', inventoryRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/wholesale', wholesaleRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/upload', uploadRoutes);

app.use('/api/v1', apiRouter);

// ─── SWAGGER DOCS ─────────────────────────────────────
setupSwagger(app);

// ─── ERROR HANDLING ───────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
