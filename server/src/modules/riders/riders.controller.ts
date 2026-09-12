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
  const rider = await prisma.rider.findUnique({ where: { userId: req.user!.id } });
  
  // Return all active pending/in-progress delivery orders
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ['CONFIRMED', 'PENDING', 'PACKED', 'RIDER_ASSIGNED', 'ON_THE_WAY'] },
      NOT: { status: 'DELIVERED' },
    },
    include: {
      user: { select: { id: true, name: true, phone: true } },
      address: true,
      items: { select: { id: true, quantity: true, unitPrice: true, totalPrice: true, productName: true, productImage: true } },
      delivery: { include: { rider: true } },
      payment: { select: { status: true, method: true, amount: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  res.json({ success: true, data: orders });
};

export const acceptOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderId } = req.body;
  let rider = await prisma.rider.findUnique({ where: { userId: req.user!.id } });
  if (!rider) {
    rider = await prisma.rider.findFirst({ where: { isApproved: true } });
  }
  if (!rider) throw new AppError('Rider not found', 404);

  await prisma.delivery.updateMany({
    where: { orderId },
    data: { riderId: rider.id, status: 'ACCEPTED', acceptedAt: new Date() },
  });
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'RIDER_ASSIGNED' },
  });
  await prisma.rider.update({
    where: { id: rider.id },
    data: { isAvailable: false },
  });
  res.json({ success: true, message: 'Order accepted' });
};

export const updateDeliveryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderId, status, otp } = req.body;
  let rider = await prisma.rider.findUnique({ where: { userId: req.user!.id } });
  if (!rider) {
    rider = await prisma.rider.findFirst({ where: { isApproved: true } });
  }
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError('Order not found', 404);
  
  if (status === 'DELIVERED') {
    const cleanDbOtp = String(order.deliveryOtp || '').trim();
    const cleanInputOtp = String(otp || '').trim();

    if (!cleanInputOtp || cleanDbOtp !== cleanInputOtp) {
      throw new AppError('Invalid delivery OTP. Please ask customer for correct 4-digit code.', 400);
    }

    await prisma.delivery.updateMany({
      where: { orderId },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
        otpVerified: true,
        ...(rider ? { riderId: rider.id } : {}),
      },
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'DELIVERED', deliveredAt: new Date() },
    });

    if (rider) {
      await prisma.rider.update({
        where: { id: rider.id },
        data: {
          totalDeliveries: { increment: 1 },
          todayEarnings: { increment: 50 },
          totalEarnings: { increment: 50 },
          isAvailable: true,
        },
      });
      await prisma.riderEarning.create({
        data: {
          riderId: rider.id,
          deliveryId: orderId,
          amount: 50,
          type: 'DELIVERY_FEE',
          note: `Delivery #${order.orderNumber}`,
        },
      });
    }
  } else {
    const deliveryStatus = status === 'PICKED_UP' ? 'PICKED_UP' : 'ON_THE_WAY';
    const orderStatus = 'ON_THE_WAY';

    await prisma.delivery.updateMany({
      where: { orderId },
      data: {
        status: deliveryStatus,
        ...(rider ? { riderId: rider.id } : {}),
        ...(status === 'PICKED_UP' ? { pickedUpAt: new Date() } : {}),
      },
    });
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: orderStatus,
        dispatchedAt: new Date(),
      },
    });
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
  const riders = await prisma.rider.findMany({
    where,
    orderBy: { totalDeliveries: 'desc' },
    include: {
      deliveries: {
        where: { status: { in: ['ACCEPTED', 'PICKED_UP', 'ON_THE_WAY'] } },
        include: { order: { select: { id: true, orderNumber: true, totalAmount: true, status: true } } },
        take: 1,
      },
    },
  });
  res.json({ success: true, data: riders });
};

export const approveRider = async (req: AuthRequest, res: Response): Promise<void> => {
  const rider = await prisma.rider.update({ where: { id: req.params.id }, data: { isApproved: true } });
  res.json({ success: true, data: rider });
};
