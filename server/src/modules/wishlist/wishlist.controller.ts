import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';

export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.user!.id },
    include: { product: { include: { images: { where: { isPrimary: true }, take: 1 }, inventory: { select: { availableStock: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: items });
};

export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.body;
  const item = await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: req.user!.id, productId } },
    update: {},
    create: { id: uuidv4(), userId: req.user!.id, productId },
  });
  res.json({ success: true, data: item });
};

export const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;
  await prisma.wishlistItem.deleteMany({ where: { userId: req.user!.id, productId } });
  res.json({ success: true, message: 'Removed from wishlist' });
};
