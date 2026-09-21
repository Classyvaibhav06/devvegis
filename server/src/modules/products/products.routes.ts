import { Router } from 'express';
import { authenticate, authorize, optionalAuth } from '../../middleware/auth';
import { uploadProduct } from '../../middleware/upload';
import {
  getProducts, getProduct, getFeaturedProducts, getFlashDeals,
  searchProducts, createProduct, updateProduct, deleteProduct
} from './products.controller';

const router = Router();

router.get('/', optionalAuth, getProducts);
router.get('/featured', optionalAuth, getFeaturedProducts);
router.get('/flash-deals', optionalAuth, getFlashDeals);
router.get('/search', optionalAuth, searchProducts);
router.get('/:slug', optionalAuth, getProduct);
router.post('/', authenticate, authorize('ADMIN'), (req, _res, next) => {
  (req as any).uploadFolder = 'products'; next();
}, uploadProduct, createProduct);
router.put('/:id', authenticate, authorize('ADMIN'), updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

export default router;
