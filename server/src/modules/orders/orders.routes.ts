import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { getOrders, getOrder, createOrder, cancelOrder, updateOrderStatus, getAllOrders } from './orders.controller';

const router = Router();
router.use(authenticate);
router.get('/', getOrders);
router.get('/admin/all', authorize('ADMIN', 'SUPER_ADMIN'), getAllOrders);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.patch('/:id/cancel', cancelOrder);
router.patch('/:id/status', authorize('ADMIN', 'SUPER_ADMIN', 'RIDER'), updateOrderStatus);
export default router;
