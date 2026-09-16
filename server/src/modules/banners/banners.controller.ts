import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { memoryCache } from '../../utils/cache';

const BANNERS_CACHE_PREFIX = 'public_banners_';

export const getBanners = async (req: AuthRequest, res: Response): Promise<void> => {
  const { type = 'ALL' } = req.query as Record<string, string>;
  const cacheKey = `${BANNERS_CACHE_PREFIX}${type}`;

  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

  const cached = memoryCache.get<any>(cacheKey);
  if (cached) {
    res.json({ success: true, data: cached });
    return;
  }

  const now = new Date();
  const where: any = { isActive: true, AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }] };
  if (type !== 'ALL') where.type = type;
  const banners = await prisma.banner.findMany({ where, orderBy: { sortOrder: 'asc' } });

  memoryCache.set(cacheKey, banners, 180); // 3 minutes
  res.json({ success: true, data: banners });
};

export const adminGetAllBanners = async (_req: AuthRequest, res: Response): Promise<void> => {
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  res.json({ success: true, data: banners });
};

export const createBanner = async (req: AuthRequest, res: Response): Promise<void> => {
  const banner = await prisma.banner.create({ data: req.body });
  memoryCache.del(BANNERS_CACHE_PREFIX);
  res.status(201).json({ success: true, data: banner });
};

export const updateBanner = async (req: AuthRequest, res: Response): Promise<void> => {
  const banner = await prisma.banner.update({ where: { id: req.params.id }, data: req.body });
  memoryCache.del(BANNERS_CACHE_PREFIX);
  res.json({ success: true, data: banner });
};

export const deleteBanner = async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.banner.delete({ where: { id: req.params.id } });
  memoryCache.del(BANNERS_CACHE_PREFIX);
  res.json({ success: true });
};

