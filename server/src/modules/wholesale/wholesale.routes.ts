import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  registerWholesale,
  getWholesaleProfile,
  getWholesaleProducts,
  getMandiTickers,
  adminGetAllBuyers,
  adminVerifyBuyer,
  adminGetAllMandiTickers,
  adminCreateMandiTicker,
  adminUpdateMandiTicker,
  adminDeleteMandiTicker,
} from './wholesale.controller';

const router = Router();

// Public — no auth needed for mandi tickers display
router.get('/mandi-tickers', getMandiTickers);

// Authenticated routes
router.use(authenticate);
router.post('/register', registerWholesale);
router.get('/profile', getWholesaleProfile);
router.get('/products', getWholesaleProducts);

// Admin only
router.get('/admin/buyers', authorize('ADMIN'), adminGetAllBuyers);
router.patch('/admin/buyers/:id/verify', authorize('ADMIN'), adminVerifyBuyer);
router.get('/admin/mandi-tickers', authorize('ADMIN'), adminGetAllMandiTickers);
router.post('/admin/mandi-tickers', authorize('ADMIN'), adminCreateMandiTicker);
router.patch('/admin/mandi-tickers/:id', authorize('ADMIN'), adminUpdateMandiTicker);
router.delete('/admin/mandi-tickers/:id', authorize('ADMIN'), adminDeleteMandiTicker);

export default router;
