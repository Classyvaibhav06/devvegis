import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { getInventory, getLowStockAlerts, updateStock } from './inventory.controller';
const router = Router();
router.use(authenticate, authorize('ADMIN'));
router.get('/', getInventory);
router.get('/low-stock', getLowStockAlerts);
router.patch('/:productId', updateStock);
export default router;
