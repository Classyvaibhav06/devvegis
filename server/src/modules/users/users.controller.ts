import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import bcrypt from 'bcryptjs';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, isEmailVerified: true, isPhoneVerified: true, referralCode: true, createdAt: true, wallet: { select: { balance: true } }, _count: { select: { orders: true, wishlist: true, reviews: true } } } });
  if (!user) throw new AppError('User not found', 404);
  res.json({ success: true, data: user });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, phone, avatar } = req.body;
  const user = await prisma.user.update({ where: { id: req.user!.id }, data: { ...(name && { name }), ...(phone && { phone }), ...(avatar && { avatar }) }, select: { id: true, name: true, email: true, phone: true, avatar: true } });
  res.json({ success: true, data: user });
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { password: true } });
  if (!user) throw new AppError('User not found', 404);
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new AppError('Current password is incorrect', 400);
  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: req.user!.id }, data: { password: hashed } });
  res.json({ success: true, message: 'Password changed successfully' });
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '20', role, search } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where: any = {};
  if (role) where.role = role;
  if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }, { phone: { contains: search, mode: 'insensitive' } }];
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true, _count: { select: { orders: true } }, wallet: { select: { balance: true } } } }),
    prisma.user.count({ where }),
  ]);
  res.json({ success: true, data: users, pagination: { page: parseInt(page), total } });
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user?.id === req.params.id) {
    throw new AppError('Cannot deactivate your own admin account', 400, 'SELF_DEACTIVATION_FORBIDDEN');
  }
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new AppError('User not found', 404);
  const updated = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: !user.isActive } });
  res.json({ success: true, data: { isActive: updated.isActive } });
};
