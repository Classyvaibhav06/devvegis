import { Response } from 'express';
import prisma from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { config } from '../../config/env';

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    page = '1', limit = '20', categoryId, categorySlug, search,
    minPrice, maxPrice, isOrganic, isFeatured, isFreshToday,
    sort = 'sortOrder', order = 'asc', tags, isSeasonalItem
  } = req.query as Record<string, string>;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = Math.min(parseInt(limit), 100);

  const where: any = { isPublished: true };

  if (categoryId) where.categoryId = categoryId;
  if (categorySlug) where.category = { slug: categorySlug };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { tags: { hasSome: [search.toLowerCase()] } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (isOrganic === 'true') where.isOrganic = true;
  if (isFeatured === 'true') where.isFeatured = true;
  if (isFreshToday === 'true') where.isFreshToday = true;
  if (isSeasonalItem === 'true') where.isSeasonalItem = true;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }
  if (tags) where.tags = { hasSome: tags.split(',') };

  const validSorts = ['price', 'rating', 'reviewCount', 'createdAt', 'sortOrder', 'name'];
  const sortField = validSorts.includes(sort) ? sort : 'sortOrder';
  const sortOrder = order === 'desc' ? 'desc' : 'asc';

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { [sortField]: sortOrder },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, slug: true } },
        inventory: { select: { availableStock: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      page: parseInt(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
      hasNext: skip + take < total,
    },
  });
};

export const getProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { slug } = req.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      category: { select: { id: true, name: true, slug: true } },
      inventory: true,
      reviews: {
        where: { status: 'APPROVED' },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, avatar: true } } },
      },
    },
  });

  if (!product || !product.isPublished) throw new AppError('Product not found', 404);

  // Get similar products
  const similar = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      isPublished: true,
      id: { not: product.id },
    },
    take: 8,
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });

  // Track analytics
  if (req.user) {
    prisma.analyticsEvent.create({
      data: {
        userId: req.user.id,
        event: 'PRODUCT_VIEW',
        properties: { productId: product.id, productName: product.name },
      },
    }).catch(() => {});
  }

  res.json({ success: true, data: { ...product, similar } });
};

export const getFeaturedProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  const products = await prisma.product.findMany({
    where: { isPublished: true, isFeatured: true },
    take: 16,
    include: { images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { rating: 'desc' },
  });
  res.json({ success: true, data: products });
};

export const getFlashDeals = async (req: AuthRequest, res: Response): Promise<void> => {
  const now = new Date();
  const products = await prisma.product.findMany({
    where: {
      isPublished: true,
      discountPercentage: { gte: 10 },
      OR: [
        { discountEndsAt: null },
        { discountEndsAt: { gte: now } },
      ],
    },
    take: 12,
    include: { images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { discountPercentage: 'desc' },
  });
  res.json({ success: true, data: products });
};

export const searchProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  const { q, page = '1', limit = '20' } = req.query as Record<string, string>;

  if (!q || q.trim().length < 2) {
    res.json({ success: true, data: [], suggestions: [] });
    return;
  }

  // Track search
  if (req.user) {
    prisma.analyticsEvent.create({
      data: {
        userId: req.user.id,
        event: 'SEARCH',
        properties: { query: q },
      },
    }).catch(() => {});
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = Math.min(parseInt(limit), 50);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { tags: { hasSome: [q.toLowerCase()] } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      skip,
      take,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.product.count({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { tags: { hasSome: [q.toLowerCase()] } },
        ],
      },
    }),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
  });
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { categoryId, name, price, wholesalePrice, sku, ...rest } = req.body;
  const files = req.files as Express.Multer.File[];

  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

  const product = await prisma.product.create({
    data: { categoryId, name, slug, price: parseFloat(price), wholesalePrice: parseFloat(wholesalePrice), sku, ...rest },
  });

  if (files?.length) {
    await prisma.productImage.createMany({
      data: files.map((file, i) => ({
        productId: product.id,
        url: `${config.API_URL}/uploads/products/${file.filename}`,
        isPrimary: i === 0,
        sortOrder: i,
      })),
    });
  }

  await prisma.inventory.create({
    data: { productId: product.id, warehouseStock: 0, availableStock: 0 },
  });

  res.status(201).json({ success: true, data: product });
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const product = await prisma.product.update({ where: { id }, data: req.body });
  res.json({ success: true, data: product });
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.product.update({ where: { id }, data: { isPublished: false } });
  res.json({ success: true, message: 'Product unpublished successfully' });
};
