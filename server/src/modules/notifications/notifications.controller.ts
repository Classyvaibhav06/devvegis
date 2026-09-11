import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where: { userId: req.user!.id }, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
    prisma.notification.count({ where: { userId: req.user!.id, isRead: false } }),
  ]);
  res.json({ success: true, data: notifications, unreadCount });
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.notification.updateMany({ where: { id, userId: req.user!.id }, data: { isRead: true, readAt: new Date() } });
  res.json({ success: true });
};

export const markAllRead = async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.notification.updateMany({ where: { userId: req.user!.id, isRead: false }, data: { isRead: true, readAt: new Date() } });
  res.json({ success: true });
};
