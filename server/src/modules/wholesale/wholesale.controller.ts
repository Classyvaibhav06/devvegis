import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { memoryCache } from '../../utils/cache';

// ─── Wholesale Buyer Registration & Profile ───────────────────────────────────

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

// ─── Admin: All Wholesale Buyers ─────────────────────────────────────────────

export const adminGetAllBuyers = async (_req: AuthRequest, res: Response): Promise<void> => {
  const buyers = await prisma.wholesaleProfile.findMany({
    include: { user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: buyers });
};

export const adminVerifyBuyer = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isVerified, creditLimit, paymentTerms } = req.body;
  const profile = await prisma.wholesaleProfile.update({
    where: { id },
    data: {
      isVerified,
      verifiedAt: isVerified ? new Date() : null,
      creditLimit: creditLimit ?? undefined,
      paymentTerms: paymentTerms ?? undefined,
    },
  });
  res.json({ success: true, data: profile });
};

const MANDI_CACHE_KEY = 'public_mandi_tickers';

// ─── Mandi Ticker CRUD ───────────────────────────────────────────────────────

export const getMandiTickers = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

  const cached = memoryCache.get<any>(MANDI_CACHE_KEY);
  if (cached) {
    res.json({ success: true, data: cached });
    return;
  }

  const tickers = await prisma.mandiTicker.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  memoryCache.set(MANDI_CACHE_KEY, tickers, 180); // 3 minutes
  res.json({ success: true, data: tickers });
};

export const adminGetAllMandiTickers = async (_req: AuthRequest, res: Response): Promise<void> => {
  const tickers = await prisma.mandiTicker.findMany({ orderBy: { sortOrder: 'asc' } });
  res.json({ success: true, data: tickers });
};

export const adminCreateMandiTicker = async (req: AuthRequest, res: Response): Promise<void> => {
  const { commodity, unit, modalPrice, change, isUp, arrivals, market, sortOrder } = req.body;
  const ticker = await prisma.mandiTicker.create({
    data: { commodity, unit, modalPrice, change, isUp, arrivals, market, sortOrder: sortOrder ?? 0 },
  });
  memoryCache.del(MANDI_CACHE_KEY);
  res.status(201).json({ success: true, data: ticker });
};

export const adminUpdateMandiTicker = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const ticker = await prisma.mandiTicker.update({ where: { id }, data: req.body });
  memoryCache.del(MANDI_CACHE_KEY);
  res.json({ success: true, data: ticker });
};

export const adminDeleteMandiTicker = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.mandiTicker.delete({ where: { id } });
  memoryCache.del(MANDI_CACHE_KEY);
  res.json({ success: true, message: 'Ticker deleted' });
};
