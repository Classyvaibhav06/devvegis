import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { getProductReviews, createReview, approveReview, getAllReviews } from './reviews.controller';
const router = Router();
router.get('/product/:productId', getProductReviews);
router.post('/', authenticate, createReview);
router.patch('/:id/approve', authenticate, authorize('ADMIN'), approveReview);
router.get('/admin', authenticate, authorize('ADMIN'), getAllReviews);
export default router;
