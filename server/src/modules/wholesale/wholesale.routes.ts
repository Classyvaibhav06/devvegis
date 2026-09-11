import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { registerWholesale, getWholesaleProfile, getWholesaleProducts } from './wholesale.controller';
const router = Router();
router.use(authenticate);
router.post('/register', registerWholesale);
router.get('/profile', getWholesaleProfile);
router.get('/products', getWholesaleProducts);
export default router;
