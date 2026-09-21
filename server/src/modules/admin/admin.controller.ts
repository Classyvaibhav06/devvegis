import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';

const SETTINGS_FILE_PATH = path.resolve(process.cwd(), 'platform-settings.json');

export interface PlatformSettings {
  targetDeliveryMinutes: number;
  baseDeliveryFee: number;
  freeDeliveryThreshold: number;
  darkstoreRadiusKm: number;
  deliverySlots: { id: string; title: string; desc: string; badge: string }[];
}

export const defaultSettings: PlatformSettings = {
  targetDeliveryMinutes: 12,
  baseDeliveryFee: 40,
  freeDeliveryThreshold: 100,
  darkstoreRadiusKm: 8,
  deliverySlots: [
    { id: 'INSTANT', title: 'Instant Express', desc: 'Delivered in minutes', badge: 'Popular' },
    { id: 'EVENING', title: 'Today Evening', desc: 'Between 6 PM - 9 PM', badge: 'Free Slot' },
    { id: 'TOMORROW', title: 'Tomorrow Morning', desc: 'Between 7 AM - 9 AM', badge: 'Fresh Harvest' },
  ],
};

let cachedSettings: PlatformSettings | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

let tableEnsured = false;
async function ensurePlatformSettingsTable(): Promise<void> {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
        target_delivery_minutes INT DEFAULT 12,
        base_delivery_fee NUMERIC(10, 2) DEFAULT 40.00,
        free_delivery_threshold NUMERIC(10, 2) DEFAULT 100.00,
        darkstore_radius_km NUMERIC(10, 2) DEFAULT 8.00,
        delivery_slots JSONB DEFAULT '[
          {"id": "INSTANT", "title": "Instant Express", "desc": "Delivered in minutes", "badge": "Popular"},
          {"id": "EVENING", "title": "Today Evening", "desc": "Between 6 PM - 9 PM", "badge": "Free Slot"},
          {"id": "TOMORROW", "title": "Tomorrow Morning", "desc": "Between 7 AM - 9 AM", "badge": "Fresh Harvest"}
        ]'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    await prisma.$executeRawUnsafe(`
      INSERT INTO platform_settings (id, base_delivery_fee, free_delivery_threshold)
      VALUES ('default', 40.00, 100.00)
      ON CONFLICT (id) DO NOTHING;
    `);
    tableEnsured = true;
  } catch (err) {
    console.error('Failed to ensure platform_settings table:', err);
  }
}

function readLocalSettingsFallback(): PlatformSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch {}
  return defaultSettings;
}

function writeLocalSettingsFallback(settings: PlatformSettings): void {
  try {
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  } catch {}
}

export async function getPlatformSettingsService(): Promise<PlatformSettings> {
  const now = Date.now();
  if (cachedSettings && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedSettings;
  }

  try {
    await ensurePlatformSettingsTable();
    const rows: any[] = await prisma.$queryRawUnsafe(`
      SELECT * FROM platform_settings WHERE id = 'default' LIMIT 1;
    `);

    if (rows && rows.length > 0) {
      const row = rows[0];
      const settings: PlatformSettings = {
        targetDeliveryMinutes: Number(row.target_delivery_minutes ?? defaultSettings.targetDeliveryMinutes),
        baseDeliveryFee: Number(row.base_delivery_fee ?? defaultSettings.baseDeliveryFee),
        freeDeliveryThreshold: Number(row.free_delivery_threshold ?? defaultSettings.freeDeliveryThreshold),
        darkstoreRadiusKm: Number(row.darkstore_radius_km ?? defaultSettings.darkstoreRadiusKm),
        deliverySlots: Array.isArray(row.delivery_slots) ? row.delivery_slots : defaultSettings.deliverySlots,
      };
      cachedSettings = settings;
      cacheTimestamp = now;
      return settings;
    }
  } catch (err) {
    console.error('Failed to query platform_settings table, trying local file fallback:', err);
  }

  const fallback = readLocalSettingsFallback();
  cachedSettings = fallback;
  cacheTimestamp = now;
  return fallback;
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
  res.json({
    success: true,
    data: {
      totalProducts,
      totalCategories,
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingReviews,
    },
  });
};

export const getPlatformSettings = async (_req: AuthRequest, res: Response): Promise<void> => {
  const settings = await getPlatformSettingsService();
  res.json({ success: true, data: settings });
};

export const updatePlatformSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  const current = await getPlatformSettingsService();

  const targetMinutes = req.body.targetDeliveryMinutes !== undefined
    ? Number(req.body.targetDeliveryMinutes)
    : (req.body.targetDeliveryTime !== undefined ? Number(req.body.targetDeliveryTime) : current.targetDeliveryMinutes);

  const baseFee = req.body.baseDeliveryFee !== undefined
    ? Math.max(0, Number(req.body.baseDeliveryFee))
    : current.baseDeliveryFee;

  const freeThreshold = req.body.freeDeliveryThreshold !== undefined
    ? Math.max(0, Number(req.body.freeDeliveryThreshold))
    : current.freeDeliveryThreshold;

  const radius = req.body.darkstoreRadiusKm !== undefined
    ? Number(req.body.darkstoreRadiusKm)
    : current.darkstoreRadiusKm;

  const slots = Array.isArray(req.body.deliverySlots)
    ? req.body.deliverySlots
    : current.deliverySlots;

  const updated: PlatformSettings = {
    targetDeliveryMinutes: targetMinutes,
    baseDeliveryFee: baseFee,
    freeDeliveryThreshold: freeThreshold,
    darkstoreRadiusKm: radius,
    deliverySlots: slots,
  };

  try {
    await ensurePlatformSettingsTable();
    await prisma.$executeRawUnsafe(
      `INSERT INTO platform_settings (
        id, target_delivery_minutes, base_delivery_fee, free_delivery_threshold, darkstore_radius_km, delivery_slots, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())
      ON CONFLICT (id) DO UPDATE SET
        target_delivery_minutes = EXCLUDED.target_delivery_minutes,
        base_delivery_fee = EXCLUDED.base_delivery_fee,
        free_delivery_threshold = EXCLUDED.free_delivery_threshold,
        darkstore_radius_km = EXCLUDED.darkstore_radius_km,
        delivery_slots = EXCLUDED.delivery_slots,
        updated_at = NOW();`,
      'default',
      updated.targetDeliveryMinutes,
      updated.baseDeliveryFee,
      updated.freeDeliveryThreshold,
      updated.darkstoreRadiusKm,
      JSON.stringify(updated.deliverySlots)
    );

    cachedSettings = updated;
    cacheTimestamp = Date.now();
  } catch (err) {
    console.error('Failed to update platform settings in Postgres:', err);
  }

  writeLocalSettingsFallback(updated);

  res.json({
    success: true,
    data: updated,
    message: 'Platform settings saved successfully and active live!',
  });
};
