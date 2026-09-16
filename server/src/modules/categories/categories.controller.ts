import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

import { memoryCache } from '../../utils/cache';

const CATEGORIES_CACHE_KEY = 'public_categories';

export const getCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

  const cached = memoryCache.get<any>(CATEGORIES_CACHE_KEY);
  if (cached) {
    res.json({ success: true, data: cached });
    return;
  }

  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      _count: { select: { products: { where: { isPublished: true } } } },
    },
  });

  memoryCache.set(CATEGORIES_CACHE_KEY, categories, 120); // 2 minutes
  res.json({ success: true, data: categories });
};

export const getCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { slug } = req.params;
  const cacheKey = `category_${slug}`;
  
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

  const cached = memoryCache.get<any>(cacheKey);
  if (cached) {
    res.json({ success: true, data: cached });
    return;
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      children: { where: { isActive: true } },
      _count: { select: { products: { where: { isPublished: true } } } },
    },
  });
  if (!category) throw new AppError('Category not found', 404);

  memoryCache.set(cacheKey, category, 120);
  res.json({ success: true, data: category });
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const category = await prisma.category.create({ data: req.body });
  memoryCache.del(CATEGORIES_CACHE_KEY);
  memoryCache.del('category_');
  res.status(201).json({ success: true, data: category });
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const category = await prisma.category.update({ where: { id }, data: req.body });
  memoryCache.del(CATEGORIES_CACHE_KEY);
  memoryCache.del('category_');
  res.json({ success: true, data: category });
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.category.update({ where: { id }, data: { isActive: false } });
  memoryCache.del(CATEGORIES_CACHE_KEY);
  memoryCache.del('category_');
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
