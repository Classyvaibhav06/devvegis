import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { getAdminStats, getPlatformSettings, updatePlatformSettings } from './admin.controller';

const router = Router();

// Public read for delivery slots and SLAs
router.get('/settings', getPlatformSettings);

// Admin-only operations
router.use(authenticate, authorize('ADMIN'));
router.get('/stats', getAdminStats);
router.post('/settings', updatePlatformSettings);

export default router;

