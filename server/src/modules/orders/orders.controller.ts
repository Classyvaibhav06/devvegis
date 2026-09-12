import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '10', status } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);
  const where: any = { userId: req.user!.id };
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } },
        payment: { select: { status: true, method: true, amount: true } },
        delivery: { select: { status: true, riderId: true, estimatedMinutes: true } },
        address: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
  });
};

export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const where: any = { id };
  const isAdminOrRider = ['ADMIN', 'SUPER_ADMIN', 'RIDER'].includes(req.user?.role || '');
  if (!isAdminOrRider) {
    where.userId = req.user!.id;
  }

  const order = await prisma.order.findFirst({
    where,
    include: {
      items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } },
      payment: true,
      delivery: { include: { rider: { select: { id: true, name: true, phone: true, rating: true, vehicleType: true, vehicleNumber: true, currentLatitude: true, currentLongitude: true } } } },
      address: true,
      coupon: { select: { code: true, type: true, discountValue: true } },
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
  if (!order) throw new AppError('Order not found', 404);
  res.json({ success: true, data: order });
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    addressId,
    paymentMethod,
    couponCode,
    walletAmount = 0,
    tipAmount = 0,
    deliverySlot = 'INSTANT',
    items: bodyItems,
  } = req.body;
  const userId = req.user!.id;

  type OrderItemInput = {
    productId: string;
    quantity: number;
    product: any;
  };

  let cartItems: OrderItemInput[] = [];

  // 1. If client provided items in the request body (from local cart store)
  if (Array.isArray(bodyItems) && bodyItems.length > 0) {
    const productIds = bodyItems.map((i: any) => i.productId || i.id).filter(Boolean);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        inventory: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
    });
    const productMap = new Map(products.map(p => [p.id, p]));

    for (const item of bodyItems) {
      const pId = item.productId || item.id;
      const product = productMap.get(pId);
      if (product) {
        cartItems.push({
          productId: product.id,
          quantity: Math.max(1, parseInt(item.quantity) || 1),
          product,
        });
      }
    }
  }

  // 2. Fallback to database cart items if no body items were passed or matched
  if (!cartItems.length) {
    const dbCartItems = await prisma.cartItem.findMany({
      where: { userId, savedForLater: false },
      include: {
        product: {
          include: {
            inventory: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });

    cartItems = dbCartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      product: item.product,
    }));
  }

  if (!cartItems.length) throw new AppError('Cart is empty', 400);

  // Check stock
  for (const item of cartItems) {
    if (item.product.inventory && item.product.inventory.availableStock < item.quantity) {
      throw new AppError(`Insufficient stock for ${item.product.name}`, 400, 'OUT_OF_STOCK');
    }
  }

  // Resolve delivery address
  let address = null;
  if (addressId) {
    address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  }
  if (!address) {
    address = await prisma.address.findFirst({ where: { userId, isDefault: true } })
      || await prisma.address.findFirst({ where: { userId } });
  }
  if (!address) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    address = await prisma.address.create({
      data: {
        id: uuidv4(),
        userId,
        label: 'Home',
        name: user?.name || 'Customer',
        phone: user?.phone || '9876543210',
        addressLine1: '12th Main Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        isDefault: true,
      },
    });
  }

  // Calculate totals
  const isWholesale = req.user!.role === 'WHOLESALE_BUYER';
  const subtotal = cartItems.reduce((sum, item) => {
    const price = isWholesale ? (item.product.wholesalePrice || item.product.price) : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = subtotal >= config.FREE_DELIVERY_ABOVE ? 0 : config.DELIVERY_FEE;
  const gstAmount = subtotal * config.GST_RATE;

  // Coupon validation
  let discountAmount = 0;
  let couponId: string | undefined;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
      if (subtotal >= coupon.minOrderValue) {
        const usages = await prisma.couponUsage.count({ where: { couponId: coupon.id, userId } });
        if (usages < coupon.maxUsesPerUser) {
          couponId = coupon.id;
          if (coupon.type === 'FLAT' || coupon.type === 'FIRST_ORDER' || coupon.type === 'FESTIVAL' || coupon.type === 'REFERRAL') {
            discountAmount = coupon.discountValue;
          } else if (coupon.type === 'PERCENTAGE') {
            discountAmount = Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount || Infinity);
          } else if (coupon.type === 'FREE_DELIVERY') {
            discountAmount = deliveryFee;
          }
        }
      }
    }
  }

  // Wallet
  let walletUsed = 0;
  if (walletAmount > 0) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    walletUsed = Math.min(walletAmount, wallet?.balance || 0);
  }

  const totalAmount = Math.max(0, subtotal + deliveryFee + gstAmount - discountAmount - walletUsed + tipAmount);

  // Generate OTP for delivery
  const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
  const orderNumber = `DV${Date.now().toString().slice(-8)}`;

  // Create order in transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        id: uuidv4(),
        orderNumber,
        userId,
        addressId: address.id,
        couponId,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        subtotal,
        discountAmount,
        deliveryFee,
        gstAmount: Math.round(gstAmount * 100) / 100,
        tipAmount,
        totalAmount: Math.round(totalAmount * 100) / 100,
        walletUsed,
        isWholesale,
        deliverySlot,
        deliveryOtp,
        items: {
          create: cartItems.map(item => {
            const unitPrice = isWholesale ? (item.product.wholesalePrice || item.product.price) : item.product.price;
            const rawImg = item.product.images?.[0]?.url || (typeof item.product.images?.[0] === 'string' ? item.product.images[0] : null);
            return {
              productId: item.productId,
              productName: item.product.name,
              productImage: rawImg && rawImg.trim().length > 0 ? rawImg.trim() : null,
              quantity: item.quantity,
              unitPrice,
              totalPrice: unitPrice * item.quantity,
              isWholesale,
            };
          }),
        },
      },
    });

    // Create delivery record
    await tx.delivery.create({
      data: {
        orderId: newOrder.id,
        deliveryAddress: `${address.addressLine1}, ${address.city} - ${address.pincode}`,
        deliveryLatitude: address.latitude,
        deliveryLongitude: address.longitude,
      },
    });

    // Reserve inventory
    for (const item of cartItems) {
      if (item.product.inventory) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            availableStock: { decrement: item.quantity },
            reservedStock: { increment: item.quantity },
          },
        });
      }
    }

    // Deduct wallet
    if (walletUsed > 0) {
      const wallet = await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: walletUsed }, totalDebits: { increment: walletUsed } },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT',
          amount: walletUsed,
          balance: wallet.balance,
          description: `Used for order #${orderNumber}`,
          orderId: newOrder.id,
        },
      });
    }

    // Track coupon usage
    if (couponId) {
      await tx.couponUsage.create({ data: { couponId, userId, orderId: newOrder.id } });
      await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { userId, savedForLater: false } });

    return newOrder;
  }, {
    maxWait: 10000,
    timeout: 30000,
  });

  // Map payment method to valid enum
  const methodMap: Record<string, any> = {
    COD: 'CASH_ON_DELIVERY',
    CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
    RAZORPAY: 'RAZORPAY',
    WALLET: 'WALLET',
    UPI: 'UPI',
    CARD: 'CARD',
    NET_BANKING: 'NET_BANKING',
  };
  const resolvedMethod = methodMap[paymentMethod?.toUpperCase()] || 'CASH_ON_DELIVERY';

  // Create payment record
  await prisma.payment.create({
    data: {
      orderId: order.id,
      userId,
      amount: totalAmount,
      method: resolvedMethod,
      status: resolvedMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PENDING',
    },
  });

  // Send notification
  await prisma.notification.create({
    data: {
      userId,
      type: 'ORDER_PLACED',
      title: '🛍️ Order Placed Successfully!',
      body: `Your order #${orderNumber} has been placed. Total: ₹${totalAmount.toFixed(0)}`,
      data: { orderId: order.id, orderNumber },
    },
  });

  const fullOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: { items: true, payment: true, delivery: true, address: true },
  });

  res.status(201).json({ success: true, data: fullOrder });
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await prisma.order.findFirst({ where: { id, userId: req.user!.id } });
  if (!order) throw new AppError('Order not found', 404);
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw new AppError('Order cannot be cancelled at this stage', 400);
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: { status: 'CANCELLED', cancellationReason: reason, cancelledAt: new Date() },
    });

    // Release inventory
    const items = await tx.orderItem.findMany({ where: { orderId: id } });
    for (const item of items) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: { availableStock: { increment: item.quantity }, reservedStock: { decrement: item.quantity } },
      });
    }

    // Refund wallet if used
    if (order.walletUsed > 0) {
      const wallet = await tx.wallet.update({
        where: { userId: req.user!.id },
        data: { balance: { increment: order.walletUsed }, totalCredits: { increment: order.walletUsed } },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'REFUND',
          amount: order.walletUsed,
          balance: wallet.balance,
          description: `Refund for cancelled order #${order.orderNumber}`,
          orderId: id,
        },
      });
    }
  });

  res.json({ success: true, message: 'Order cancelled successfully' });
};

// Admin/Rider: update order status
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, riderId, otp } = req.body;

  const existingOrder = await prisma.order.findUnique({ where: { id } });
  if (!existingOrder) throw new AppError('Order not found', 404);

  if (status === 'DELIVERED' && otp) {
    const cleanDbOtp = String(existingOrder.deliveryOtp || '').trim();
    const cleanInputOtp = String(otp || '').trim();
    if (cleanDbOtp !== cleanInputOtp) {
      throw new AppError('Invalid delivery OTP. Please ask customer for correct 4-digit code.', 400);
    }
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      status,
      ...(status === 'CONFIRMED' && { confirmedAt: new Date() }),
      ...(status === 'PACKED' && { packedAt: new Date() }),
      ...(status === 'ON_THE_WAY' && { dispatchedAt: new Date() }),
      ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
    },
  });

  if (status === 'DELIVERED') {
    await prisma.delivery.updateMany({
      where: { orderId: id },
      data: { status: 'DELIVERED', deliveredAt: new Date(), otpVerified: true },
    });
  }

  if (status === 'ON_THE_WAY') {
    await prisma.delivery.updateMany({
      where: { orderId: id },
      data: { status: 'ON_THE_WAY', pickedUpAt: new Date() },
    });
  }

  if (riderId) {
    const deliveryStatus = status === 'ON_THE_WAY' ? 'ON_THE_WAY' : status === 'DELIVERED' ? 'DELIVERED' : 'ACCEPTED';
    await prisma.delivery.updateMany({
      where: { orderId: id },
      data: { riderId, status: deliveryStatus, acceptedAt: new Date() },
    });
    await prisma.rider.update({
      where: { id: riderId },
      data: { isAvailable: false },
    }).catch(() => {});

    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'RIDER_ASSIGNED',
        title: '🛵 Rider Assigned!',
        body: 'Your order has been assigned to a delivery partner and is being prepared.',
        data: { orderId: id },
      },
    }).catch(() => {});
  }

  res.json({ success: true, data: order });
};

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '20', status, search } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);
  const where: any = {};
  if (status) where.status = status;
  if (search) where.OR = [
    { orderNumber: { contains: search, mode: 'insensitive' } },
    { user: { name: { contains: search, mode: 'insensitive' } } },
    { user: { email: { contains: search, mode: 'insensitive' } } },
  ];

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, skip, take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: { select: { id: true, quantity: true, unitPrice: true, totalPrice: true, productName: true, productImage: true } },
        payment: { select: { status: true, method: true, amount: true } },
        delivery: { include: { rider: { select: { id: true, name: true, phone: true, rating: true, vehicleType: true, vehicleNumber: true } } } },
        address: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ success: true, data: orders, pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) } });
};
