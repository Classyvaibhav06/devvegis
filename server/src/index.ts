// DevVegis — Main Server Entry Point
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

const app = express();

// ─── SECURITY MIDDLEWARE ──────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: config.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
}));

// ─── RATE LIMITING ────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' },
});

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);

// ─── BODY PARSING ─────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// ─── LOGGING ─────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (message) => logger.http(message.trim()) },
}));

// ─── STATIC FILES ─────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

app.use('/api/v1', apiRouter);

// ─── SWAGGER DOCS ─────────────────────────────────────
setupSwagger(app);

// ─── ERROR HANDLING ───────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── START SERVER ─────────────────────────────────────
const PORT = config.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`🚀 DevVegis API running on port ${PORT}`);
  logger.info(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
  logger.info(`🌱 Environment: ${config.NODE_ENV}`);
});

export default app;
