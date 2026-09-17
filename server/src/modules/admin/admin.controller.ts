import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';

const SETTINGS_FILE_PATH = path.resolve(process.cwd(), 'platform-settings.json');

interface PlatformSettings {
  targetDeliveryMinutes: number;
  baseDeliveryFee: number;
  freeDeliveryThreshold: number;
  darkstoreRadiusKm: number;
  deliverySlots: { id: string; title: string; desc: string; badge: string }[];
}

const defaultSettings: PlatformSettings = {
  targetDeliveryMinutes: 12,
  baseDeliveryFee: 25,
  freeDeliveryThreshold: 199,
  darkstoreRadiusKm: 8,
  deliverySlots: [
    { id: 'INSTANT', title: 'Instant (10-15 Min)', desc: 'Superfast quick delivery', badge: 'Popular' },
    { id: 'EVENING', title: 'Today Evening', desc: 'Between 6 PM - 9 PM', badge: 'Free Slot' },
    { id: 'TOMORROW', title: 'Tomorrow Morning', desc: 'Between 7 AM - 9 AM', badge: 'Fresh Harvest' },
  ],
};

function readPlatformSettings(): PlatformSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch {}
  return defaultSettings;
}

function writePlatformSettings(settings: PlatformSettings): void {
  try {
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  } catch {}
}

export const getAdminStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [totalProducts, totalCategories, totalUsers, totalOrders, totalRevenue, pendingReviews] = await Promise.all([
    prisma.product.count({ where: { isPublished: true } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({ where: { status: { in: ['DELIVERED'] } }, _sum: { totalAmount: true } }),
    prisma.review.count({ where: { status: 'PENDING' } }),
  ]);
  res.json({ success: true, data: { totalProducts, totalCategories, totalUsers, totalOrders, totalRevenue: totalRevenue._sum.totalAmount || 0, pendingReviews } });
};

export const getPlatformSettings = async (_req: AuthRequest, res: Response): Promise<void> => {
  const settings = readPlatformSettings();
  res.json({ success: true, data: settings });
};

export const updatePlatformSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  const current = readPlatformSettings();
  const updated: PlatformSettings = {
    ...current,
    ...(req.body.targetDeliveryMinutes !== undefined && { targetDeliveryMinutes: Number(req.body.targetDeliveryMinutes) }),
    ...(req.body.baseDeliveryFee !== undefined && { baseDeliveryFee: Number(req.body.baseDeliveryFee) }),
    ...(req.body.freeDeliveryThreshold !== undefined && { freeDeliveryThreshold: Number(req.body.freeDeliveryThreshold) }),
    ...(req.body.darkstoreRadiusKm !== undefined && { darkstoreRadiusKm: Number(req.body.darkstoreRadiusKm) }),
    ...(Array.isArray(req.body.deliverySlots) && { deliverySlots: req.body.deliverySlots }),
  };
  writePlatformSettings(updated);
  res.json({ success: true, data: updated, message: 'Platform settings saved successfully' });
};

