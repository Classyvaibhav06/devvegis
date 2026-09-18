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
  submitWholesaleRFQ,
} from './wholesale.controller';

const router = Router();

// Public — no auth needed for mandi tickers display, product catalog, or RFQ inquiries
router.get('/mandi-tickers', getMandiTickers);
router.get('/products', getWholesaleProducts);
router.post('/rfq', submitWholesaleRFQ);

// Authenticated routes
router.use(authenticate);
router.post('/register', registerWholesale);
router.get('/profile', getWholesaleProfile);

// Admin only
router.get('/admin/buyers', authorize('ADMIN'), adminGetAllBuyers);
router.patch('/admin/buyers/:id/verify', authorize('ADMIN'), adminVerifyBuyer);
router.get('/admin/mandi-tickers', authorize('ADMIN'), adminGetAllMandiTickers);
router.post('/admin/mandi-tickers', authorize('ADMIN'), adminCreateMandiTicker);
router.patch('/admin/mandi-tickers/:id', authorize('ADMIN'), adminUpdateMandiTicker);
router.delete('/admin/mandi-tickers/:id', authorize('ADMIN'), adminDeleteMandiTicker);

export default router;
