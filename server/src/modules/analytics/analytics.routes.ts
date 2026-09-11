import { Router } from 'express';
import { authenticate, authorize, optionalAuth } from '../../middleware/auth';
import { getDashboardStats, getRevenueChart, trackEvent } from './analytics.controller';
const router = Router();
router.get('/dashboard', authenticate, authorize('ADMIN','SUPER_ADMIN'), getDashboardStats);
router.get('/revenue', authenticate, authorize('ADMIN','SUPER_ADMIN'), getRevenueChart);
router.post('/track', optionalAuth, trackEvent);
export default router;
