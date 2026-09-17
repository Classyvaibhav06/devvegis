import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateCoupon, getCoupons, getAllCoupons, createCoupon, updateCoupon, deleteCoupon } from './coupons.controller';
const router = Router();
router.get('/', authenticate, getCoupons);
router.post('/validate', authenticate, validateCoupon);
router.get('/admin', authenticate, authorize('ADMIN'), getAllCoupons);
router.post('/', authenticate, authorize('ADMIN'), createCoupon);
router.put('/:id', authenticate, authorize('ADMIN'), updateCoupon);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCoupon);
export default router;

