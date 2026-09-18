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

const allowedOrigins = config.CORS_ORIGIN
  ? config.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive fallback for dev / preview
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
const createRateLimiter = (maxRequests: number, windowMinutes: number, message: string) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        error: message,
        code: 'RATE_LIMIT_EXCEEDED',
      });
    },
  });
};

const globalLimiter = createRateLimiter(500, 15, 'Too many requests. Please try again shortly.');
const authLimiter = createRateLimiter(30, 15, 'Too many authentication attempts. Please try again after 15 minutes.');
const checkoutLimiter = createRateLimiter(30, 15, 'Too many order or payment requests. Please try again shortly.');

/**
 * Anti-Abuse Rate Limiters for OTP Endpoints:
 * 1. otpSendLimiter: Max 5 OTP requests per 10 minutes per IP/email to prevent email inbox flooding and SMS bombing.
 * 2. otpVerifyLimiter: Max 5 failed attempts per 10 minutes per IP to completely stop brute-forcing 6-digit OTPs.
 */
const otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = String(req.body?.email || req.query?.email || '').trim().toLowerCase();
    const phone = String(req.body?.phone || req.query?.phone || '').trim();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `${ip}:${email || phone || 'anonymous'}`;
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many OTP requests for this account or network. Please wait 10 minutes before requesting again.',
      code: 'OTP_SEND_RATE_LIMITED',
    });
  },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 attempts per 10 min prevents brute forcing
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = String(req.body?.email || req.query?.email || '').trim().toLowerCase();
    const phone = String(req.body?.phone || req.query?.phone || '').trim();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `verify:${ip}:${email || phone || 'anonymous'}`;
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many invalid verification attempts. For your security, this account is temporarily locked for 10 minutes.',
      code: 'OTP_VERIFY_RATE_LIMITED',
    });
  },
});

// Apply rate limiters
app.use('/api', globalLimiter);
app.use('/api/v1/auth', authLimiter);
app.use('/api/auth', authLimiter);

// OTP generation protection
app.use('/api/v1/auth/send-otp', otpSendLimiter);
app.use('/api/v1/auth/resend-verification', otpSendLimiter);
app.use('/api/v1/auth/resend-otp', otpSendLimiter);
app.use('/api/v1/auth/forgot-password', otpSendLimiter);
app.use('/api/v1/orders/:id/resend-otp', otpSendLimiter);

// OTP verification protection (anti brute-force)
app.use('/api/v1/auth/verify-email', otpVerifyLimiter);
app.use('/api/v1/auth/verify-email-otp', otpVerifyLimiter);
app.use('/api/v1/auth/verify-otp', otpVerifyLimiter);

app.use('/api/v1/orders', checkoutLimiter);
app.use('/api/v1/payments', checkoutLimiter);

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
    service: 'DevVegis API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── API ROUTES ───────────────────────────────────────
const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'DevVegis API',
    version: '1.0.0',
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
