import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { createRazorpayOrder, verifyRazorpayPayment, getPayments } from './payments.controller';
const router = Router();
router.use(authenticate);
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyRazorpayPayment);
router.get('/', getPayments);
export default router;
