import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';

export const getBanners = async (req: AuthRequest, res: Response): Promise<void> => {
  const { type } = req.query as Record<string, string>;
  const now = new Date();
  const where: any = { isActive: true, AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }] };
  if (type) where.type = type;
  const banners = await prisma.banner.findMany({ where, orderBy: { sortOrder: 'asc' } });
  res.json({ success: true, data: banners });
};

export const createBanner = async (req: AuthRequest, res: Response): Promise<void> => {
  const banner = await prisma.banner.create({ data: req.body });
  res.status(201).json({ success: true, data: banner });
};

export const updateBanner = async (req: AuthRequest, res: Response): Promise<void> => {
  const banner = await prisma.banner.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: banner });
};

export const deleteBanner = async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.banner.delete({ where: { id: req.params.id } });
  res.json({ success: true });
};
