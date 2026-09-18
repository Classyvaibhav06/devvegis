import { Response } from 'express';
import prisma from '../../config/prisma';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { config } from '../../config/env';
import { ProductUnit } from '@prisma/client';
import { uploadFileBuffer } from '../../services/storage.service';
import { memoryCache } from '../../utils/cache';

const parseProductUnit = (unitStr?: string): ProductUnit => {
  if (!unitStr) return ProductUnit.GRAM;
  const upper = unitStr.toUpperCase().trim();
  if (['GRAM', 'KG', 'PIECE', 'BUNDLE', 'DOZEN', 'LITRE'].includes(upper)) {
    return upper as ProductUnit;
  }
  if (upper.includes('KG')) return ProductUnit.KG;
  if (upper.includes('PC') || upper.includes('PIECE')) return ProductUnit.PIECE;
  if (upper.includes('DOZ')) return ProductUnit.DOZEN;
  if (upper.includes('LIT') || upper.includes('LTR')) return ProductUnit.LITRE;
  if (upper.includes('BUN')) return ProductUnit.BUNDLE;
  return ProductUnit.GRAM;
};

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    page = '1', limit = '20', categoryId, categorySlug, search,
    minPrice, maxPrice, isOrganic, isFeatured, isFreshToday,
    sort = 'sortOrder', order = 'asc', tags, isSeasonalItem
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const rawLimit = parseInt(limit) || 20;
  const take = Math.min(Math.max(1, rawLimit), 50); // Hard cap at 50 max to prevent DB flooding
  const skip = (pageNum - 1) * take;

  const validSorts = ['price', 'rating', 'reviewCount', 'createdAt', 'sortOrder', 'name'];
  const sortField = validSorts.includes(sort) ? sort : 'sortOrder';
  const sortOrder = order === 'desc' ? 'desc' : 'asc';

  // In-memory cache for common listing requests
  const isSearch = Boolean(search);
  const cacheKey = !isSearch
    ? `products_list_${pageNum}_${take}_${categoryId || ''}_${categorySlug || ''}_${isFeatured || ''}_${isFreshToday || ''}_${isOrganic || ''}_${isSeasonalItem || ''}_${minPrice || ''}_${maxPrice || ''}_${tags || ''}_${sortField}_${sortOrder}`
    : null;

  if (cacheKey) {
    const cached = memoryCache.get<any>(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=120, stale-while-revalidate=300');
      res.setHeader('X-Cache', 'HIT');
      res.json(cached);
      return;
    }
  }

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

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { [sortField]: sortOrder },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        wholesalePrice: true,
        comparePrice: true,
        unit: true,
        weight: true,
        minOrderQty: true,
        isOrganic: true,
        isFeatured: true,
        isFreshToday: true,
        isSeasonalItem: true,
        isPublished: true,
        discountPercentage: true,
        rating: true,
        reviewCount: true,
        tags: true,
        origin: true,
        images: {
          select: { id: true, url: true, alt: true, isPrimary: true },
          where: { isPrimary: true },
          take: 1,
        },
        category: { select: { id: true, name: true, slug: true } },
        inventory: { select: { availableStock: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const isWholesaleUser = req.user?.role === 'WHOLESALE_BUYER' || req.user?.role === 'ADMIN';

  const sanitizedProducts = products.map((p: any) => {
    const rawStock = p.inventory?.availableStock ?? 0;
    const inStock = rawStock > 0;
    return {
      ...p,
      wholesalePrice: isWholesaleUser ? p.wholesalePrice : undefined,
      inventory: {
        inStock,
        availableStock: inStock ? (rawStock <= 5 ? rawStock : 10) : 0,
      },
    };
  });

  const responsePayload = {
    success: true,
    data: sanitizedProducts,
    pagination: {
      page: pageNum,
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
      hasNext: skip + take < total,
    },
  };

  if (cacheKey) {
    memoryCache.set(cacheKey, responsePayload, 60); // 60 seconds
  }

  res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=120, stale-while-revalidate=300');
  res.setHeader('X-Cache', 'MISS');
  res.json(responsePayload);
};

export const getProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { slug } = req.params;
  const cacheKey = `product_slug_${slug}`;

  const cached = memoryCache.get<any>(cacheKey);
  if (cached) {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    res.setHeader('X-Cache', 'HIT');
    res.json({ success: true, data: cached });
    return;
  }

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

  const isWholesaleUser = req.user?.role === 'WHOLESALE_BUYER' || req.user?.role === 'ADMIN';
  const rawStock = product.inventory?.availableStock ?? 0;
  const inStock = rawStock > 0;

  const productPayload = {
    ...product,
    wholesalePrice: isWholesaleUser ? product.wholesalePrice : undefined,
    inventory: product.inventory ? {
      ...product.inventory,
      inStock,
      availableStock: inStock ? (rawStock <= 5 ? rawStock : 10) : 0,
    } : null,
    similar: similar.map((s: any) => ({
      ...s,
      wholesalePrice: isWholesaleUser ? s.wholesalePrice : undefined,
    })),
  };

  memoryCache.set(cacheKey, productPayload, 90); // 90 seconds

  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  res.setHeader('X-Cache', 'MISS');
  res.json({ success: true, data: productPayload });
};

export const getFeaturedProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  const cacheKey = 'products_featured';
  const cached = memoryCache.get<any>(cacheKey);
  if (cached) {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    res.setHeader('X-Cache', 'HIT');
    res.json({ success: true, data: cached });
    return;
  }

  const products = await prisma.product.findMany({
    where: { isPublished: true, isFeatured: true },
    take: 16,
    include: { images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { rating: 'desc' },
  });

  memoryCache.set(cacheKey, products, 120); // 2 minutes
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  res.setHeader('X-Cache', 'MISS');
  res.json({ success: true, data: products });
};

export const getFlashDeals = async (req: AuthRequest, res: Response): Promise<void> => {
  const cacheKey = 'products_flash_deals';
  const cached = memoryCache.get<any>(cacheKey);
  if (cached) {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    res.setHeader('X-Cache', 'HIT');
    res.json({ success: true, data: cached });
    return;
  }

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

  memoryCache.set(cacheKey, products, 120); // 2 minutes
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  res.setHeader('X-Cache', 'MISS');
  res.json({ success: true, data: products });
};

export const searchProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    q, page = '1', limit = '20',
    isOrganic, minPrice, maxPrice, sort, order
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const rawLimit = parseInt(limit) || 20;
  const take = Math.min(Math.max(1, rawLimit), 50); // Hard cap at 50 max
  const skip = (pageNum - 1) * take;

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

  const where: any = {
    isPublished: true,
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { tags: { hasSome: [q.toLowerCase()] } },
      { description: { contains: q, mode: 'insensitive' } },
    ],
  };

  if (isOrganic === 'true') where.isOrganic = true;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  let orderBy: any = { rating: 'desc' };
  if (sort === 'price') {
    orderBy = { price: order === 'desc' ? 'desc' : 'asc' };
  } else if (sort === 'createdAt') {
    orderBy = { createdAt: 'desc' };
  } else if (sort === 'rating') {
    orderBy = { rating: 'desc' };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: { page: parseInt(page), limit: take, total, totalPages: Math.ceil(total / take) },
  });
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    categoryId, name, price, wholesalePrice, comparePrice, mrp, sku,
    stock, unit, image, images, description, shortDescription,
    barcode, tags, costPrice, minOrderQty, wholesaleMinQty,
    weight, origin, isOrganic, isFeatured, isFreshToday,
    isSeasonalItem, isPublished
  } = req.body;
  const files = req.files as Express.Multer.File[];

  // Validate required product fields
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new AppError('Product name is required.', 400);
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    throw new AppError('A valid product selling price is required.', 400);
  }

  // If categoryId is provided, verify it exists. If not provided or invalid, resolve to an active category or auto-create default.
  let resolvedCategoryId: string | null = categoryId ? String(categoryId).trim() : null;
  if (resolvedCategoryId) {
    const exists = await prisma.category.findUnique({ where: { id: resolvedCategoryId } });
    if (!exists) resolvedCategoryId = null;
  }
  if (!resolvedCategoryId) {
    let defaultCat = await prisma.category.findFirst({ where: { isActive: true } });
    if (!defaultCat) {
      defaultCat = await prisma.category.create({
        data: {
          name: 'Fresh Vegetables',
          slug: 'vegetables',
          icon: '🥦',
          description: 'Farm-fresh daily vegetables and produce',
          isActive: true,
        },
      });
    }
    resolvedCategoryId = defaultCat.id;
  }

  const cleanName = name.trim();
  const slugBase = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'produce';
  const generatedSlug = `${slugBase}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6)}`;
  const effectiveSku = sku?.trim() || `DV-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  const effectiveComparePrice = mrp !== undefined && mrp !== '' && mrp !== null
    ? parseFloat(mrp)
    : (comparePrice !== undefined && comparePrice !== '' && comparePrice !== null ? parseFloat(comparePrice) : null);
  const parsedUnit = parseProductUnit(unit);

  let parsedWeight: number | null = null;
  if (weight !== undefined && weight !== '' && weight !== null) {
    parsedWeight = parseFloat(weight);
  } else if (typeof unit === 'string') {
    const matchKg = unit.match(/^(\d+(?:\.\d+)?)\s*kg$/i);
    const matchG = unit.match(/^(\d+(?:\.\d+)?)\s*g(?:rams?)?$/i);
    if (matchKg) parsedWeight = parseFloat(matchKg[1]) * 1000;
    else if (matchG) parsedWeight = parseFloat(matchG[1]);
  }

  const product = await prisma.product.create({
    data: {
      categoryId: resolvedCategoryId,
      name: cleanName,
      slug: generatedSlug,
      sku: effectiveSku,
      price: parsedPrice,
      wholesalePrice: wholesalePrice !== undefined && wholesalePrice !== '' && wholesalePrice !== null ? parseFloat(wholesalePrice) : null,
      comparePrice: effectiveComparePrice,
      costPrice: costPrice !== undefined && costPrice !== '' && costPrice !== null ? parseFloat(costPrice) : null,
      minOrderQty: minOrderQty ? parseInt(minOrderQty, 10) : 1,
      wholesaleMinQty: wholesaleMinQty ? parseInt(wholesaleMinQty, 10) : 10,
      unit: parsedUnit,
      description: description || null,
      shortDescription: shortDescription || null,
      barcode: barcode || null,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
      weight: parsedWeight,
      origin: origin || null,
      isOrganic: Boolean(isOrganic),
      isFeatured: Boolean(isFeatured),
      isFreshToday: Boolean(isFreshToday),
      isSeasonalItem: Boolean(isSeasonalItem),
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    },
  });

  // Handle uploaded files or provided image URLs
  const imageUrls: string[] = [];
  if (files?.length) {
    for (const f of files) {
      if (f.buffer) {
        const { url } = await uploadFileBuffer(f.buffer, f.originalname, f.mimetype, 'products');
        imageUrls.push(url);
      } else if (f.filename) {
        imageUrls.push(`${config.API_URL}/uploads/products/${f.filename}`);
      }
    }
  }
  if (image && typeof image === 'string') {
    imageUrls.push(image);
  }
  if (Array.isArray(images)) {
    images.forEach((img: any) => {
      const u = typeof img === 'string' ? img : img?.url;
      if (u && !imageUrls.includes(u)) imageUrls.push(u);
    });
  }

  if (imageUrls.length > 0) {
    await prisma.productImage.createMany({
      data: imageUrls.map((url, idx) => ({
        productId: product.id,
        url,
        isPrimary: idx === 0,
        sortOrder: idx,
      })),
    });
  }

  // Stock inventory
  const initialStock = stock !== undefined && stock !== '' ? (parseInt(stock, 10) || 0) : 0;
  await prisma.inventory.create({
    data: { productId: product.id, warehouseStock: initialStock, availableStock: initialStock },
  });

  const fullProduct = await prisma.product.findUnique({
    where: { id: product.id },
    include: { images: true, inventory: true, category: true },
  });

  memoryCache.del('products_');
  memoryCache.del('product_slug_');

  res.status(201).json({ success: true, data: fullProduct || product });
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    categoryId, name, price, wholesalePrice, comparePrice, mrp, sku,
    stock, unit, image, images, description, shortDescription,
    barcode, tags, costPrice, minOrderQty, wholesaleMinQty,
    weight, origin, isOrganic, isFeatured, isFreshToday,
    isSeasonalItem, isPublished, slug
  } = req.body;

  // Build clean update object for Product table only
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (slug !== undefined) updateData.slug = slug;
  if (categoryId !== undefined && categoryId !== '') {
    const catExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (catExists) updateData.categoryId = categoryId;
  }
  if (price !== undefined && price !== '') updateData.price = parseFloat(price);
  if (wholesalePrice !== undefined) {
    updateData.wholesalePrice = wholesalePrice !== '' && wholesalePrice !== null ? parseFloat(wholesalePrice) : null;
  }
  if (mrp !== undefined) {
    updateData.comparePrice = mrp !== '' && mrp !== null ? parseFloat(mrp) : null;
  } else if (comparePrice !== undefined) {
    updateData.comparePrice = comparePrice !== '' && comparePrice !== null ? parseFloat(comparePrice) : null;
  }
  if (costPrice !== undefined) {
    updateData.costPrice = costPrice !== '' && costPrice !== null ? parseFloat(costPrice) : null;
  }
  if (sku !== undefined) updateData.sku = sku;
  if (barcode !== undefined) updateData.barcode = barcode || null;
  if (unit !== undefined) updateData.unit = parseProductUnit(unit);
  if (description !== undefined) updateData.description = description;
  if (shortDescription !== undefined) updateData.shortDescription = shortDescription;
  if (weight !== undefined) {
    updateData.weight = weight !== '' && weight !== null ? parseFloat(weight) : null;
  }
  if (origin !== undefined) updateData.origin = origin;
  if (minOrderQty !== undefined && minOrderQty !== '') updateData.minOrderQty = parseInt(minOrderQty, 10);
  if (wholesaleMinQty !== undefined && wholesaleMinQty !== '') updateData.wholesaleMinQty = parseInt(wholesaleMinQty, 10);
  if (isOrganic !== undefined) updateData.isOrganic = Boolean(isOrganic);
  if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
  if (isFreshToday !== undefined) updateData.isFreshToday = Boolean(isFreshToday);
  if (isSeasonalItem !== undefined) updateData.isSeasonalItem = Boolean(isSeasonalItem);
  if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);
  if (tags !== undefined) {
    updateData.tags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []);
  }

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
  });

  // Handle stock update in inventory
  if (stock !== undefined && stock !== '') {
    const stockVal = Math.max(0, parseInt(stock, 10) || 0);
    await prisma.inventory.upsert({
      where: { productId: id },
      create: { productId: id, availableStock: stockVal, warehouseStock: stockVal },
      update: { availableStock: stockVal, warehouseStock: stockVal },
    });
  }

  // Handle primary image update
  if (image && typeof image === 'string') {
    const existingPrimary = await prisma.productImage.findFirst({
      where: { productId: id, isPrimary: true },
    });
    if (existingPrimary) {
      await prisma.productImage.update({
        where: { id: existingPrimary.id },
        data: { url: image },
      });
    } else {
      await prisma.productImage.create({
        data: { productId: id, url: image, isPrimary: true, sortOrder: 0 },
      });
    }
  }

  memoryCache.del('products_');
  memoryCache.del('product_slug_');

  const fullProduct = await prisma.product.findUnique({
    where: { id },
    include: { images: true, inventory: true, category: true },
  });

  res.json({ success: true, data: fullProduct || product });
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    // Try permanent delete if item has not been ordered
    await prisma.product.delete({ where: { id } });
    memoryCache.del('products_');
    memoryCache.del('product_slug_');
    res.json({ success: true, message: 'Product deleted permanently' });
  } catch (err: any) {
    // If foreign key constraint (P2003) because orders exist, soft delete by unpublishing
    await prisma.product.update({ where: { id }, data: { isPublished: false } });
    memoryCache.del('products_');
    memoryCache.del('product_slug_');
    res.json({ success: true, message: 'Product archived and unpublished' });
  }
};

