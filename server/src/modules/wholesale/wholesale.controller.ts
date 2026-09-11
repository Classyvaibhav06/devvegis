import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';

export const registerWholesale = async (req: AuthRequest, res: Response): Promise<void> => {
  const { businessName, gstin, businessType, panNumber } = req.body;
  const profile = await prisma.wholesaleProfile.upsert({
    where: { userId: req.user!.id },
    update: { businessName, gstin, businessType, panNumber },
    create: { userId: req.user!.id, businessName, gstin, businessType, panNumber },
  });
  await prisma.user.update({ where: { id: req.user!.id }, data: { role: 'WHOLESALE_BUYER' } });
  res.json({ success: true, data: profile });
};

export const getWholesaleProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await prisma.wholesaleProfile.findUnique({ where: { userId: req.user!.id } });
  res.json({ success: true, data: profile });
};

export const getWholesaleProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '20', categoryId } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where: any = { isPublished: true, wholesalePrice: { not: null } };
  if (categoryId) where.categoryId = categoryId;
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where, skip, take: parseInt(limit),
      include: { images: { where: { isPrimary: true }, take: 1 }, category: { select: { name: true } }, inventory: { select: { availableStock: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.product.count({ where }),
  ]);
  res.json({ success: true, data: products, pagination: { page: parseInt(page), total } });
};
