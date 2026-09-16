import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { getAdminStats } from './admin.controller';
const router = Router();
router.use(authenticate, authorize('ADMIN'));
router.get('/stats', getAdminStats);
export default router;
