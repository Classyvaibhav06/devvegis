import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

export const getRiderProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const rider = await prisma.rider.findUnique({ where: { userId: req.user!.id } });
  if (!rider) throw new AppError('Rider profile not found', 404);
  res.json({ success: true, data: rider });
};

export const updateRiderLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { latitude, longitude } = req.body;
  const rider = await prisma.rider.update({ where: { userId: req.user!.id }, data: { currentLatitude: latitude, currentLongitude: longitude, isOnline: true } });
  res.json({ success: true, data: rider });
};

export const toggleAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  const rider = await prisma.rider.findUnique({ where: { userId: req.user!.id } });
  if (!rider) throw new AppError('Rider not found', 404);
  const updated = await prisma.rider.update({ where: { userId: req.user!.id }, data: { isAvailable: !rider.isAvailable, isOnline: !rider.isAvailable } });
  res.json({ success: true, data: updated });
};

export const getAvailableOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const orders = await prisma.order.findMany({ where: { status: 'CONFIRMED', delivery: { status: 'UNASSIGNED' } }, include: { address: true, items: { select: { quantity: true, productName: true } }, _count: { select: { items: true } } }, orderBy: { createdAt: 'asc' }, take: 10 });
  res.json({ success: true, data: orders });
};

export const acceptOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderId } = req.body;
  const rider = await prisma.rider.findUnique({ where: { userId: req.user!.id } });
  if (!rider) throw new AppError('Rider not found', 404);
  if (!rider.isApproved) throw new AppError('Rider not approved', 403);
  await prisma.delivery.update({ where: { orderId }, data: { riderId: rider.id, status: 'ACCEPTED', acceptedAt: new Date() } });
  await prisma.order.update({ where: { id: orderId }, data: { status: 'RIDER_ASSIGNED' } });
  await prisma.rider.update({ where: { id: rider.id }, data: { isAvailable: false } });
  res.json({ success: true, message: 'Order accepted' });
};

export const updateDeliveryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderId, status, otp } = req.body;
  const rider = await prisma.rider.findUnique({ where: { userId: req.user!.id } });
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError('Order not found', 404);
  
  if (status === 'DELIVERED') {
    if (order.deliveryOtp !== otp) throw new AppError('Invalid delivery OTP', 400);
    await prisma.delivery.update({ where: { orderId }, data: { status: 'DELIVERED', deliveredAt: new Date(), otpVerified: true } });
    await prisma.order.update({ where: { id: orderId }, data: { status: 'DELIVERED', deliveredAt: new Date() } });
    if (rider) {
      await prisma.rider.update({ where: { id: rider.id }, data: { totalDeliveries: { increment: 1 }, todayEarnings: { increment: 50 }, totalEarnings: { increment: 50 }, isAvailable: true } });
      await prisma.riderEarning.create({ data: { riderId: rider.id, deliveryId: orderId, amount: 50, type: 'DELIVERY_FEE', note: `Delivery #${order.orderNumber}` } });
    }
  } else {
    await prisma.delivery.update({ where: { orderId }, data: { status: status === 'PICKED_UP' ? 'PICKED_UP' : 'ON_THE_WAY', ...(status === 'PICKED_UP' ? { pickedUpAt: new Date() } : {}) } });
    await prisma.order.update({ where: { id: orderId }, data: { status: status === 'PICKED_UP' ? 'PACKED' : 'ON_THE_WAY', ...(status === 'ON_THE_WAY' ? { dispatchedAt: new Date() } : {}) } });
  }
  res.json({ success: true, message: `Delivery status updated to ${status}` });
};

export const getRiderEarnings = async (req: AuthRequest, res: Response): Promise<void> => {
  const rider = await prisma.rider.findUnique({ where: { userId: req.user!.id } });
  if (!rider) throw new AppError('Rider not found', 404);
  const earnings = await prisma.riderEarning.findMany({ where: { riderId: rider.id }, orderBy: { date: 'desc' }, take: 30 });
  res.json({ success: true, data: { rider: { totalEarnings: rider.totalEarnings, todayEarnings: rider.todayEarnings, totalDeliveries: rider.totalDeliveries, rating: rider.rating }, earnings } });
};

export const getAllRiders = async (req: AuthRequest, res: Response): Promise<void> => {
  const { isApproved, isOnline } = req.query as Record<string, string>;
  const where: any = {};
  if (isApproved !== undefined) where.isApproved = isApproved === 'true';
  if (isOnline !== undefined) where.isOnline = isOnline === 'true';
  const riders = await prisma.rider.findMany({ where, orderBy: { totalDeliveries: 'desc' } });
  res.json({ success: true, data: riders });
};

export const approveRider = async (req: AuthRequest, res: Response): Promise<void> => {
  const rider = await prisma.rider.update({ where: { id: req.params.id }, data: { isApproved: true } });
  res.json({ success: true, data: rider });
};
