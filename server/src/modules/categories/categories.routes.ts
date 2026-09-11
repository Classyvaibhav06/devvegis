import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from './categories.controller';

const router = Router();
router.get('/', getCategories);
router.get('/:slug', getCategory);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), createCategory);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), deleteCategory);
export default router;
