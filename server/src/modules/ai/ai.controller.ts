import { Response } from 'express';
import prisma from '../../config/prisma';
import { AuthRequest } from '../../middleware/auth';

export const generateRecipe = async (req: AuthRequest, res: Response): Promise<void> => {
  const { vegetables } = req.body;
  const recipes = [
    {
      name: `Fresh ${vegetables[0]} Sabzi`,
      description: `A classic Indian preparation with ${vegetables.join(', ')}`,
      ingredients: vegetables.map((v: string) => ({ name: v, qty: '200g' })),
      steps: ['Wash and chop vegetables', 'Heat oil in pan', 'Add spices', 'Add vegetables and cook for 15-20 minutes', 'Garnish with coriander'],
      time: '25 mins',
      difficulty: 'Easy',
      calories: 150,
    },
    {
      name: `Mixed Vegetable Curry`,
      description: `A hearty curry combining ${vegetables.slice(0, 2).join(' and ')}`,
      ingredients: vegetables.map((v: string) => ({ name: v, qty: '150g' })),
      steps: ['Prepare masala base', 'Add tomato puree', 'Cook vegetables until tender', 'Add garam masala', 'Serve hot with roti'],
      time: '35 mins',
      difficulty: 'Medium',
      calories: 220,
    },
  ];
  res.json({ success: true, data: recipes });
};

export const getRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const recentOrders = await prisma.orderItem.findMany({
    where: { order: { userId } },
    orderBy: { order: { createdAt: 'desc' } },
    take: 10,
    select: { productId: true, product: { select: { categoryId: true } } },
  });
  const categoryIds = [...new Set(recentOrders.map(o => o.product.categoryId))];
  const recommended = await prisma.product.findMany({
    where: { categoryId: { in: categoryIds.length > 0 ? categoryIds : undefined }, isPublished: true, id: { notIn: recentOrders.map(o => o.productId) } },
    take: 8,
    include: { images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { rating: 'desc' },
  });
  if (recommended.length < 8) {
    const popular = await prisma.product.findMany({
      where: { isPublished: true, isFeatured: true, id: { notIn: recommended.map(r => r.id) } },
      take: 8 - recommended.length,
      include: { images: { where: { isPrimary: true }, take: 1 } },
      orderBy: { rating: 'desc' },
    });
    recommended.push(...popular);
  }
  res.json({ success: true, data: recommended });
};

export const semanticSearch = async (req: AuthRequest, res: Response): Promise<void> => {
  const { q } = req.query as Record<string, string>;
  if (!q) { res.json({ success: true, data: [] }); return; }
  const products = await prisma.product.findMany({
    where: { isPublished: true, OR: [{ name: { contains: q, mode: 'insensitive' } }, { tags: { hasSome: [q.toLowerCase()] } }] },
    take: 20,
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });
  res.json({ success: true, data: products });
};

export const analyzeFreshness = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: {
      score: Math.floor(70 + Math.random() * 30),
      label: 'Fresh',
      confidence: 0.87,
      suggestions: ['Store in cool, dry place', 'Consume within 3-4 days'],
    },
  });
};
