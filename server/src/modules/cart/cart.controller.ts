import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { config } from '../../config/env';

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.user!.id },
    include: {
      product: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          inventory: { select: { availableStock: true } },
        },
      },
    },
  });

  const subtotal = items.reduce((sum, item) => {
    if (!item.savedForLater) return sum + (item.product.price * item.quantity);
    return sum;
  }, 0);

  const deliveryFee = subtotal >= config.FREE_DELIVERY_ABOVE ? 0 : config.DELIVERY_FEE;
  const gstAmount = subtotal * config.GST_RATE;
  const total = subtotal + deliveryFee + gstAmount;

  res.json({
    success: true,
    data: {
      items: items.filter(i => !i.savedForLater),
      savedItems: items.filter(i => i.savedForLater),
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee,
      gstAmount: Math.round(gstAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
      freeDeliveryAbove: config.FREE_DELIVERY_ABOVE,
    },
  });
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user!.id;

  const product = await prisma.product.findUnique({
    where: { id: productId, isPublished: true },
    include: { inventory: true },
  });

  if (!product) throw new AppError('Product not found', 404);
  if (!product.inventory || product.inventory.availableStock < quantity) {
    throw new AppError('Insufficient stock', 400, 'OUT_OF_STOCK');
  }

  const item = await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: { quantity: { increment: quantity } },
    create: { userId, productId, quantity },
    include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
  });

  res.json({ success: true, data: item });
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const userId = req.user!.id;

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { userId, productId } });
    res.json({ success: true, message: 'Item removed from cart' });
    return;
  }

  const item = await prisma.cartItem.update({
    where: { userId_productId: { userId, productId } },
    data: { quantity },
  });

  res.json({ success: true, data: item });
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;
  await prisma.cartItem.deleteMany({ where: { userId: req.user!.id, productId } });
  res.json({ success: true, message: 'Item removed from cart' });
};

export const saveForLater = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;
  const item = await prisma.cartItem.update({
    where: { userId_productId: { userId: req.user!.id, productId } },
    data: { savedForLater: true },
  });
  res.json({ success: true, data: item });
};

export const moveToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;
  const item = await prisma.cartItem.update({
    where: { userId_productId: { userId: req.user!.id, productId } },
    data: { savedForLater: false },
  });
  res.json({ success: true, data: item });
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.cartItem.deleteMany({ where: { userId: req.user!.id, savedForLater: false } });
  res.json({ success: true, message: 'Cart cleared' });
};
