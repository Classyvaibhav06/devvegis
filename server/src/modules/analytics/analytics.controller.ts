import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  const [
    todayOrders, todayRevenue, totalOrders, totalRevenue,
    activeCustomers, activeRiders, pendingOrders,
    monthRevenue, lastMonthRevenue, topProducts, categoryRevenue, lowStockCount
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today }, status: { not: 'CANCELLED' } } }),
    prisma.order.aggregate({ where: { createdAt: { gte: today }, status: { not: 'CANCELLED' } }, _sum: { totalAmount: true } }),
    prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
    prisma.order.aggregate({ where: { status: { not: 'CANCELLED' } }, _sum: { totalAmount: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } }),
    prisma.rider.count({ where: { isOnline: true } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({ where: { createdAt: { gte: thisMonth }, status: { not: 'CANCELLED' } }, _sum: { totalAmount: true } }),
    prisma.order.aggregate({ where: { createdAt: { gte: lastMonth, lte: lastMonthEnd }, status: { not: 'CANCELLED' } }, _sum: { totalAmount: true } }),
    prisma.orderItem.groupBy({ by: ['productName'], _sum: { quantity: true, totalPrice: true }, orderBy: { _sum: { totalPrice: 'desc' } }, take: 10 }),
    prisma.orderItem.findMany({ include: { product: { include: { category: { select: { name: true } } } } } }),
    prisma.inventory.count({ where: { availableStock: { lte: 10 } } }),
  ]);

  res.json({
    success: true,
    data: {
      kpis: {
        todayOrders, todayRevenue: todayRevenue._sum.totalAmount || 0,
        totalOrders, totalRevenue: totalRevenue._sum.totalAmount || 0,
        activeCustomers, activeRiders, pendingOrders, lowStockCount,
        monthRevenue: monthRevenue._sum.totalAmount || 0,
        lastMonthRevenue: lastMonthRevenue._sum.totalAmount || 0,
        revenueGrowth: lastMonthRevenue._sum.totalAmount ? ((((monthRevenue._sum.totalAmount || 0) - (lastMonthRevenue._sum.totalAmount || 0)) / (lastMonthRevenue._sum.totalAmount || 1)) * 100).toFixed(1) : 0,
      },
      topProducts,
    },
  });
};

export const getRevenueChart = async (req: AuthRequest, res: Response): Promise<void> => {
  const { period = '7days' } = req.query as Record<string, string>;
  const days = period === '30days' ? 30 : period === '90days' ? 90 : 7;
  const startDate = new Date(); startDate.setDate(startDate.getDate() - days);
  
  const orders = await prisma.order.findMany({ where: { createdAt: { gte: startDate }, status: { not: 'CANCELLED' } }, select: { createdAt: true, totalAmount: true } });
  
  const dailyData: Record<string, { revenue: number; orders: number }> = {};
  orders.forEach(order => {
    const date = order.createdAt.toISOString().split('T')[0];
    if (!dailyData[date]) dailyData[date] = { revenue: 0, orders: 0 };
    dailyData[date].revenue += order.totalAmount;
    dailyData[date].orders += 1;
  });

  const chartData = Object.entries(dailyData).map(([date, data]) => ({ date, ...data })).sort((a, b) => a.date.localeCompare(b.date));
  res.json({ success: true, data: chartData });
};

export const trackEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { event, properties } = req.body;
  await prisma.analyticsEvent.create({ data: { userId: req.user?.id, event, properties, ipAddress: req.ip, userAgent: req.headers['user-agent'] } });
  res.json({ success: true });
};
