import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { getWallet, getTransactions } from './wallet.controller';
const router = Router();
router.use(authenticate);
router.get('/', getWallet);
router.get('/transactions', getTransactions);
export default router;
