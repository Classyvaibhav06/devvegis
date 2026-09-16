import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

export const getCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      _count: { select: { products: { where: { isPublished: true } } } },
    },
  });
  res.json({ success: true, data: categories });
};

export const getCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { slug } = req.params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: { where: { isActive: true } },
      _count: { select: { products: { where: { isPublished: true } } } },
    },
  });
  if (!category) throw new AppError('Category not found', 404);
  res.json({ success: true, data: category });
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const category = await prisma.category.create({ data: req.body });
  res.status(201).json({ success: true, data: category });
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const category = await prisma.category.update({ where: { id }, data: req.body });
  res.json({ success: true, data: category });
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.category.update({ where: { id }, data: { isActive: false } });
  res.json({ success: true, message: 'Category deactivated' });
};

export const adminGetAllCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: { orderBy: { sortOrder: 'asc' } },
      _count: { select: { products: { where: { isPublished: true } } } },
    },
  });
  res.json({ success: true, data: categories });
};
