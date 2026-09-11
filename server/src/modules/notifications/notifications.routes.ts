import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { getNotifications, markAsRead, markAllRead } from './notifications.controller';
const router = Router();
router.use(authenticate);
router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/mark-all-read', markAllRead);
export default router;
