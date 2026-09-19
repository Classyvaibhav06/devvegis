import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

import { memoryCache } from '../../utils/cache';

const CATEGORIES_CACHE_KEY = 'public_categories';

export const getCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

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

  memoryCache.set(CATEGORIES_CACHE_KEY, categories, 30); // 30s cache
  res.json({ success: true, data: categories });
};

export const getCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { slug } = req.params;
  const cacheKey = `category_${slug}`;
  
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

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
  if (!category || !category.isActive) throw new AppError('Category not found', 404);

  memoryCache.set(cacheKey, category, 30);
  res.json({ success: true, data: category });
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const category = await prisma.category.create({ data: req.body });
  memoryCache.del(CATEGORIES_CACHE_KEY);
  memoryCache.del('category_');
  memoryCache.del('products_list_');
  res.status(201).json({ success: true, data: category });
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const category = await prisma.category.update({ where: { id }, data: req.body });
  memoryCache.del(CATEGORIES_CACHE_KEY);
  memoryCache.del('category_');
  memoryCache.del('products_list_');
  res.json({ success: true, data: category });
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.category.delete({ where: { id } });
    memoryCache.del(CATEGORIES_CACHE_KEY);
    memoryCache.del('category_');
    memoryCache.del('products_list_');
    res.json({ success: true, message: 'Category deleted permanently' });
  } catch {
    await prisma.category.update({ where: { id }, data: { isActive: false } });
    await prisma.category.updateMany({ where: { parentId: id }, data: { isActive: false } });
    memoryCache.del(CATEGORIES_CACHE_KEY);
    memoryCache.del('category_');
    memoryCache.del('products_list_');
    res.json({ success: true, message: 'Category deactivated' });
  }
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
