import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { uploadProduct } from '../../middleware/upload';
import {
  getProducts, getProduct, getFeaturedProducts, getFlashDeals,
  searchProducts, createProduct, updateProduct, deleteProduct
} from './products.controller';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/flash-deals', getFlashDeals);
router.get('/search', searchProducts);
router.get('/:slug', getProduct);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), (req, _res, next) => {
  (req as any).uploadFolder = 'products'; next();
}, uploadProduct, createProduct);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), deleteProduct);

export default router;
