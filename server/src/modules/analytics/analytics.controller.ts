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
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate },
      status: { not: 'CANCELLED' },
    },
    select: {
      createdAt: true,
      totalAmount: true,
    },
  });

  const dailyMap = new Map<string, { date: Date; revenue: number; costs: number; orders: number }>();

  // Pre-populate all days in the selected period
  for (let i = 0; i < days; i++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);
    current.setHours(0, 0, 0, 0);
    const key = current.toISOString().split('T')[0];
    dailyMap.set(key, {
      date: current,
      revenue: 0,
      costs: 0,
      orders: 0,
    });
  }

  // Aggregate real orders
  orders.forEach((order) => {
    const key = new Date(order.createdAt).toISOString().split('T')[0];
    const item = dailyMap.get(key);
    if (item) {
      item.revenue += Math.round(order.totalAmount);
      item.orders += 1;
      item.costs = Math.round(item.revenue * 0.65);
    }
  });

  const chartData = Array.from(dailyMap.values()).map((d) => ({
    date: d.date.toISOString(),
    revenue: d.revenue,
    costs: d.costs,
    orders: d.orders,
  }));

  res.json({ success: true, data: chartData });
};

export const trackEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { event, properties } = req.body;
  await prisma.analyticsEvent.create({ data: { userId: req.user?.id, event, properties, ipAddress: req.ip, userAgent: req.headers['user-agent'] } });
  res.json({ success: true });
};
