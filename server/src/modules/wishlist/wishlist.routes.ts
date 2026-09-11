import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { getWishlist, addToWishlist, removeFromWishlist } from './wishlist.controller';
const router = Router();
router.use(authenticate);
router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:productId', removeFromWishlist);
export default router;
