import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  const addresses = await prisma.address.findMany({ where: { userId: req.user!.id }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
  res.json({ success: true, data: addresses });
};

export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { isDefault, ...rest } = req.body;
  if (isDefault) await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
  const address = await prisma.address.create({ data: { id: uuidv4(), userId: req.user!.id, isDefault: isDefault || false, ...rest } });
  res.status(201).json({ success: true, data: address });
};

export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const address = await prisma.address.findFirst({ where: { id, userId: req.user!.id } });
  if (!address) throw new AppError('Address not found', 404);
  if (req.body.isDefault) await prisma.address.updateMany({ where: { userId: req.user!.id }, data: { isDefault: false } });
  const updated = await prisma.address.update({ where: { id }, data: req.body });
  res.json({ success: true, data: updated });
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const address = await prisma.address.findFirst({ where: { id, userId: req.user!.id } });
  if (!address) throw new AppError('Address not found', 404);
  await prisma.address.delete({ where: { id } });
  res.json({ success: true, message: 'Address deleted' });
};
