import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory, adminGetAllCategories } from './categories.controller';

const router = Router();
router.get('/', getCategories);
router.get('/admin/all', authenticate, authorize('ADMIN'), adminGetAllCategories);
router.get('/:slug', getCategory);
router.post('/', authenticate, authorize('ADMIN'), createCategory);
router.put('/:id', authenticate, authorize('ADMIN'), updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCategory);
export default router;
