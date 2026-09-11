import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { getBanners, createBanner, updateBanner, deleteBanner } from './banners.controller';
const router = Router();
router.get('/', getBanners);
router.post('/', authenticate, authorize('ADMIN','SUPER_ADMIN'), createBanner);
router.put('/:id', authenticate, authorize('ADMIN','SUPER_ADMIN'), updateBanner);
router.delete('/:id', authenticate, authorize('ADMIN','SUPER_ADMIN'), deleteBanner);
export default router;
