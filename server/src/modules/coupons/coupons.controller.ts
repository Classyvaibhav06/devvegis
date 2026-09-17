import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

export const validateCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  const { code, orderTotal } = req.body;
  const userId = req.user!.id;
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.isActive) throw new AppError('Invalid coupon code', 400);
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new AppError('Coupon has expired', 400);
  if (orderTotal < coupon.minOrderValue) throw new AppError(`Minimum order value is ₹${coupon.minOrderValue}`, 400);
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new AppError('Coupon usage limit reached', 400);
  const userUsage = await prisma.couponUsage.count({ where: { couponId: coupon.id, userId } });
  if (userUsage >= coupon.maxUsesPerUser) throw new AppError('You have already used this coupon', 400);
  
  let discount = 0;
  if (['FLAT','FIRST_ORDER','FESTIVAL','REFERRAL'].includes(coupon.type)) discount = coupon.discountValue;
  else if (coupon.type === 'PERCENTAGE') discount = Math.min((orderTotal * coupon.discountValue) / 100, coupon.maxDiscount || Infinity);
  
  res.json({ success: true, data: { coupon, discount: Math.round(discount * 100) / 100 } });
};

export const getCoupons = async (req: AuthRequest, res: Response): Promise<void> => {
  const coupons = await prisma.coupon.findMany({ where: { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] }, orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: coupons });
};

export const getAllCoupons = async (req: AuthRequest, res: Response): Promise<void> => {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { usages: true } } } });
  res.json({ success: true, data: coupons });
};

export const createCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    code, title, description, type, discountType, discountValue,
    maxDiscount, minOrderValue, minOrderAmount, maxUses, usageLimit,
    maxUsesPerUser, expiresAt, isActive
  } = req.body;

  const rawCode = (code || '').toUpperCase().trim();
  if (!rawCode) throw new AppError('Coupon code is required', 400);

  const resolvedType = type || discountType || 'FLAT';
  const resolvedMinOrderValue = minOrderValue !== undefined ? Number(minOrderValue) : (minOrderAmount !== undefined ? Number(minOrderAmount) : 0);
  const resolvedMaxUses = maxUses !== undefined ? (maxUses ? Number(maxUses) : null) : (usageLimit !== undefined ? (usageLimit ? Number(usageLimit) : null) : null);

  const coupon = await prisma.coupon.create({
    data: {
      code: rawCode,
      title: title || `${rawCode} Coupon`,
      description: description || null,
      type: resolvedType,
      discountValue: Number(discountValue) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      minOrderValue: resolvedMinOrderValue,
      maxUses: resolvedMaxUses,
      maxUsesPerUser: maxUsesPerUser ? Number(maxUsesPerUser) : 1,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    },
  });
  res.status(201).json({ success: true, data: coupon });
};

export const updateCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data: req.body });
  res.json({ success: true, data: coupon });
};

export const deleteCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.coupon.delete({ where: { id } });
  res.json({ success: true, message: 'Coupon deleted successfully' });
};

