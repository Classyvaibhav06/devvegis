import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { getCart, addToCart, updateCartItem, removeFromCart, saveForLater, moveToCart, clearCart } from './cart.controller';

const router = Router();
router.use(authenticate);
router.get('/', getCart);
router.post('/', addToCart);
router.post('/add', addToCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);
router.patch('/:productId/save-later', saveForLater);
router.patch('/:productId/move-to-cart', moveToCart);
router.delete('/', clearCart);
export default router;
