import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';

export const getInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { lowStock, page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where: any = {};
  if (lowStock === 'true') where.availableStock = { lte: prisma.inventory.fields.lowStockThreshold };
  const [inventory, total] = await Promise.all([
    prisma.inventory.findMany({ where, skip, take: parseInt(limit), include: { product: { select: { name: true, sku: true, price: true } } }, orderBy: { availableStock: 'asc' } }),
    prisma.inventory.count({ where }),
  ]);
  res.json({ success: true, data: inventory, pagination: { page: parseInt(page), total } });
};

export const getLowStockAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  const alerts = await prisma.$queryRaw`SELECT i.*, p.name, p.sku FROM inventory i JOIN products p ON i.product_id = p.id WHERE i.available_stock <= i.low_stock_threshold AND p.is_published = true ORDER BY i.available_stock ASC LIMIT 50`;
  res.json({ success: true, data: alerts });
};

export const updateStock = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;
  const { warehouseStock, availableStock, purchasePrice, supplierName, expiryDate, stock } = req.body;

  let updateData: any = {};
  if (warehouseStock !== undefined) updateData.warehouseStock = warehouseStock;
  if (availableStock !== undefined) updateData.availableStock = availableStock;
  if (purchasePrice !== undefined) updateData.purchasePrice = purchasePrice;
  if (supplierName !== undefined) updateData.supplierName = supplierName;
  if (expiryDate !== undefined) updateData.expiryDate = new Date(expiryDate);
  updateData.lastRestockedAt = new Date();

  // If client sends { stock: addedStock } or direct restock
  if (stock !== undefined) {
    const existing = await prisma.inventory.findUnique({ where: { productId } });
    if (existing) {
      updateData.availableStock = existing.availableStock + Number(stock);
      updateData.warehouseStock = existing.warehouseStock + Number(stock);
    } else {
      updateData.availableStock = Number(stock);
      updateData.warehouseStock = Number(stock);
    }
  }

  const inventory = await prisma.inventory.upsert({
    where: { productId },
    update: updateData,
    create: {
      productId,
      warehouseStock: updateData.warehouseStock || 50,
      availableStock: updateData.availableStock || 50,
      lowStockThreshold: 10,
    },
  });

  res.json({ success: true, data: inventory });
};
