import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

export const getWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId: req.user!.id },
    include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
  });
  if (!wallet) throw new AppError('Wallet not found', 404);
  res.json({ success: true, data: wallet });
};

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const wallet = await prisma.wallet.findUnique({ where: { userId: req.user!.id } });
  if (!wallet) throw new AppError('Wallet not found', 404);

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({ where: { walletId: wallet.id }, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
    prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
  ]);
  res.json({ success: true, data: transactions, pagination: { page: parseInt(page), total, totalPages: Math.ceil(total / parseInt(limit)) } });
};
