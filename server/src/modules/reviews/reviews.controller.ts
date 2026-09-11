import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

export const getProductReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;
  const reviews = await prisma.review.findMany({ where: { productId, status: 'APPROVED' }, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true, avatar: true } } } });
  res.json({ success: true, data: reviews });
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, rating, title, body, orderId } = req.body;
  const existing = await prisma.review.findFirst({ where: { userId: req.user!.id, productId } });
  if (existing) throw new AppError('You have already reviewed this product', 409);
  const isVerified = orderId ? !!(await prisma.orderItem.findFirst({ where: { orderId, productId, order: { userId: req.user!.id } } })) : false;
  const review = await prisma.review.create({ data: { id: uuidv4(), userId: req.user!.id, productId, rating, title, body, orderId, isVerifiedPurchase: isVerified, status: 'PENDING' } });
  res.status(201).json({ success: true, data: review });
};

export const approveReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const review = await prisma.review.update({ where: { id: req.params.id }, data: { status: 'APPROVED' } });
  const stats = await prisma.review.aggregate({ where: { productId: review.productId, status: 'APPROVED' }, _avg: { rating: true }, _count: true });
  await prisma.product.update({ where: { id: review.productId }, data: { rating: Math.round((stats._avg.rating || 0) * 10) / 10, reviewCount: stats._count } });
  res.json({ success: true, data: review });
};

export const getAllReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where: any = {};
  if (status) where.status = status;
  const [reviews, total] = await Promise.all([prisma.review.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true, email: true } }, product: { select: { name: true } } } }), prisma.review.count({ where })]);
  res.json({ success: true, data: reviews, pagination: { page: parseInt(page), total } });
};
