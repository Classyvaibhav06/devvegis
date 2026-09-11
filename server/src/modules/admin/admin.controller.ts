import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';

export const getAdminStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [totalProducts, totalCategories, totalUsers, totalOrders, totalRevenue, pendingReviews] = await Promise.all([
    prisma.product.count({ where: { isPublished: true } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({ where: { status: { in: ['DELIVERED'] } }, _sum: { totalAmount: true } }),
    prisma.review.count({ where: { status: 'PENDING' } }),
  ]);
  res.json({ success: true, data: { totalProducts, totalCategories, totalUsers, totalOrders, totalRevenue: totalRevenue._sum.totalAmount || 0, pendingReviews } });
};
