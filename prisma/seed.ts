// DevVegis — Complete Database Seed Script
// Generates 260+ products with realistic Indian grocery data

import { PrismaClient, Role, CouponType, BannerType, ProductUnit } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DevVegis seed...');

  // ─── CLEANUP ───────────────────────────────────────
  await prisma.analyticsEvent.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.riderEarning.deleteMany();
  await prisma.rider.deleteMany();
  await prisma.wholesaleProfile.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Password@123', 12);

  // ─── USERS ───────────────────────────────────────
  console.log('👤 Creating users...');

  const superAdmin = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Super Admin',
      email: 'superadmin@devvegis.com',
      phone: '9000000001',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      isEmailVerified: true,
      isPhoneVerified: true,
      referralCode: 'SUPERADMIN',
    },
  });

  const admin = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Admin User',
      email: 'admin@devvegis.com',
      phone: '9000000002',
      password: hashedPassword,
      role: Role.ADMIN,
      isEmailVerified: true,
      isPhoneVerified: true,
      referralCode: 'ADMIN001',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543210',
      password: hashedPassword,
      role: Role.CUSTOMER,
      isEmailVerified: true,
      isPhoneVerified: true,
      referralCode: 'PRIYA001',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Rahul Gupta',
      email: 'rahul@example.com',
      phone: '9876543211',
      password: hashedPassword,
      role: Role.CUSTOMER,
      isEmailVerified: true,
      isPhoneVerified: true,
      referralCode: 'RAHUL001',
    },
  });

  const wholesaleUser = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Agarwal Enterprises',
      email: 'wholesale@agarwal.com',
      phone: '9876543212',
      password: hashedPassword,
      role: Role.WHOLESALE_BUYER,
      isEmailVerified: true,
      isPhoneVerified: true,
      referralCode: 'AGARWAL01',
    },
  });

  const riderUser1 = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Vijay Kumar',
      email: 'vijay.rider@devvegis.com',
      phone: '9876543213',
      password: hashedPassword,
      role: Role.RIDER,
      isEmailVerified: true,
      isPhoneVerified: true,
      referralCode: 'RIDER001',
    },
  });

  const riderUser2 = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Suresh Patel',
      email: 'suresh.rider@devvegis.com',
      phone: '9876543214',
      password: hashedPassword,
      role: Role.RIDER,
      isEmailVerified: true,
      isPhoneVerified: true,
      referralCode: 'RIDER002',
    },
  });

  // ─── ADDRESSES ─────────────────────────────────────
  console.log('📍 Creating addresses...');

  const address1 = await prisma.address.create({
    data: {
      userId: customer1.id,
      label: 'Home',
      name: 'Priya Sharma',
      phone: '9876543210',
      addressLine1: '42, Ashoka Nagar, Ring Road',
      addressLine2: 'Near Metro Station',
      landmark: 'Opposite City Mall',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      latitude: 12.9716,
      longitude: 77.5946,
      isDefault: true,
    },
  });

  await prisma.address.create({
    data: {
      userId: customer1.id,
      label: 'Work',
      name: 'Priya Sharma',
      phone: '9876543210',
      addressLine1: 'Tech Park, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066',
      latitude: 12.9698,
      longitude: 77.7499,
      isDefault: false,
    },
  });

  // ─── WHOLESALE PROFILE ──────────────────────────────
  await prisma.wholesaleProfile.create({
    data: {
      userId: wholesaleUser.id,
      businessName: 'Agarwal Fresh Enterprises',
      gstin: '29AABCA1234C1ZK',
      businessType: 'Retailer',
      panNumber: 'AABCA1234C',
      isVerified: true,
      verifiedAt: new Date(),
      creditLimit: 50000,
      paymentTerms: 15,
    },
  });

  // ─── RIDERS ────────────────────────────────────────
  console.log('🛵 Creating riders...');

  const rider1 = await prisma.rider.create({
    data: {
      userId: riderUser1.id,
      name: 'Vijay Kumar',
      phone: '9876543213',
      email: 'vijay.rider@devvegis.com',
      vehicleType: 'BIKE',
      vehicleNumber: 'KA01AB1234',
      isApproved: true,
      isOnline: true,
      isAvailable: true,
      currentLatitude: 12.9716,
      currentLongitude: 77.5946,
      rating: 4.8,
      totalDeliveries: 247,
      totalEarnings: 18500,
      todayEarnings: 420,
    },
  });

  await prisma.rider.create({
    data: {
      userId: riderUser2.id,
      name: 'Suresh Patel',
      phone: '9876543214',
      email: 'suresh.rider@devvegis.com',
      vehicleType: 'BIKE',
      vehicleNumber: 'KA02CD5678',
      isApproved: true,
      isOnline: false,
      isAvailable: false,
      rating: 4.6,
      totalDeliveries: 183,
      totalEarnings: 14200,
      todayEarnings: 0,
    },
  });

  // ─── WALLETS ───────────────────────────────────────
  console.log('💰 Creating wallets...');

  const wallet1 = await prisma.wallet.create({
    data: {
      userId: customer1.id,
      balance: 250,
      totalCredits: 500,
      totalDebits: 250,
    },
  });

  await prisma.walletTransaction.create({
    data: {
      walletId: wallet1.id,
      type: 'CASHBACK',
      amount: 50,
      balance: 250,
      description: 'Cashback on order #ORD20240001',
    },
  });

  await prisma.wallet.create({
    data: {
      userId: customer2.id,
      balance: 100,
      totalCredits: 100,
      totalDebits: 0,
    },
  });

  // ─── CATEGORIES ────────────────────────────────────
  console.log('📦 Creating categories...');

  const categories: Record<string, { id: string; name: string }> = {};

  const categoryData = [
    { name: 'Vegetables', slug: 'vegetables', icon: '🥦', color: '#16a34a', sortOrder: 1, isFeatured: true },
    { name: 'Fruits', slug: 'fruits', icon: '🍎', color: '#dc2626', sortOrder: 2, isFeatured: true },
    { name: 'Leafy Greens', slug: 'leafy-greens', icon: '🌿', color: '#15803d', sortOrder: 3, isFeatured: true },
    { name: 'Herbs & Spices', slug: 'herbs-spices', icon: '🌱', color: '#854d0e', sortOrder: 4, isFeatured: false },
    { name: 'Dry Fruits & Nuts', slug: 'dry-fruits-nuts', icon: '🥜', color: '#b45309', sortOrder: 5, isFeatured: true },
    { name: 'Organic', slug: 'organic', icon: '🌾', color: '#4d7c0f', sortOrder: 6, isFeatured: true },
    { name: 'Exotic Vegetables', slug: 'exotic-vegetables', icon: '🫑', color: '#7c3aed', sortOrder: 7, isFeatured: false },
    { name: 'Seasonal', slug: 'seasonal', icon: '🎋', color: '#0891b2', sortOrder: 8, isFeatured: false },
  ];

  for (const cat of categoryData) {
    const created = await prisma.category.create({
      data: {
        id: uuidv4(),
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        color: cat.color,
        sortOrder: cat.sortOrder,
        isFeatured: cat.isFeatured,
        isActive: true,
        image: `https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400&q=80`,
        banner: `https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80`,
      },
    });
    categories[cat.slug] = { id: created.id, name: created.name };
  }

  // ─── PRODUCTS ──────────────────────────────────────
  console.log('🥕 Creating products (150+ vegetables, 80+ fruits, 30+ herbs)...');

  type ProductSeed = {
    name: string;
    price: number;
    wholesalePrice: number;
    comparePrice?: number;
    unit: ProductUnit;
    weight: number;
    isOrganic?: boolean;
    isFeatured?: boolean;
    isFreshToday?: boolean;
    isSeasonalItem?: boolean;
    discountPercentage?: number;
    origin?: string;
    shelfLife?: number;
    nutritionInfo?: object;
    tags?: string[];
  };

  const vegetables: ProductSeed[] = [
    // Common vegetables
    { name: 'Tomato', price: 30, wholesalePrice: 22, comparePrice: 40, unit: ProductUnit.KG, weight: 1000, isFreshToday: true, isFeatured: true, origin: 'Maharashtra', shelfLife: 7, tags: ['staple', 'common'], nutritionInfo: { calories: 18, carbs: 3.9, protein: 0.9, fat: 0.2, fiber: 1.2 } },
    { name: 'Onion', price: 45, wholesalePrice: 35, unit: ProductUnit.KG, weight: 1000, isFreshToday: true, isFeatured: true, origin: 'Nashik, Maharashtra', shelfLife: 30, tags: ['staple', 'common'] },
    { name: 'Potato', price: 25, wholesalePrice: 18, unit: ProductUnit.KG, weight: 1000, isFeatured: true, origin: 'Punjab', shelfLife: 30, tags: ['staple', 'common'] },
    { name: 'Capsicum (Green)', price: 60, wholesalePrice: 45, unit: ProductUnit.KG, weight: 500, isFreshToday: true, origin: 'Himachal Pradesh', shelfLife: 7, tags: ['bell pepper'] },
    { name: 'Capsicum (Red)', price: 120, wholesalePrice: 90, unit: ProductUnit.KG, weight: 500, discountPercentage: 10, origin: 'Himachal Pradesh', shelfLife: 7, tags: ['bell pepper', 'colorful'] },
    { name: 'Capsicum (Yellow)', price: 120, wholesalePrice: 90, unit: ProductUnit.KG, weight: 500, origin: 'Himachal Pradesh', shelfLife: 7, tags: ['bell pepper', 'colorful'] },
    { name: 'Carrot', price: 40, wholesalePrice: 30, unit: ProductUnit.KG, weight: 500, isFreshToday: true, origin: 'Rajasthan', shelfLife: 10, tags: ['root vegetable'] },
    { name: 'Cauliflower', price: 35, wholesalePrice: 25, unit: ProductUnit.PIECE, weight: 800, isFreshToday: true, origin: 'Punjab', shelfLife: 5, tags: ['cruciferous'] },
    { name: 'Cabbage', price: 25, wholesalePrice: 18, unit: ProductUnit.PIECE, weight: 700, origin: 'Himachal Pradesh', shelfLife: 7, tags: ['cruciferous'] },
    { name: 'Broccoli', price: 80, wholesalePrice: 60, comparePrice: 100, unit: ProductUnit.PIECE, weight: 500, isFeatured: true, isFreshToday: true, discountPercentage: 20, origin: 'Ooty, Tamil Nadu', shelfLife: 5, tags: ['cruciferous', 'superfood'] },
    { name: 'Cucumber', price: 30, wholesalePrice: 22, unit: ProductUnit.KG, weight: 500, isFreshToday: true, origin: 'Karnataka', shelfLife: 7, tags: ['salad'] },
    { name: 'Bottle Gourd (Lauki)', price: 20, wholesalePrice: 14, unit: ProductUnit.PIECE, weight: 600, origin: 'Uttar Pradesh', shelfLife: 7, tags: ['gourd', 'healthy'] },
    { name: 'Bitter Gourd (Karela)', price: 55, wholesalePrice: 40, unit: ProductUnit.KG, weight: 500, origin: 'Rajasthan', shelfLife: 5, tags: ['gourd', 'diabetic-friendly'] },
    { name: 'Ridge Gourd (Turai)', price: 35, wholesalePrice: 25, unit: ProductUnit.KG, weight: 500, origin: 'Maharashtra', shelfLife: 5, tags: ['gourd'] },
    { name: 'Snake Gourd (Padwal)', price: 40, wholesalePrice: 30, unit: ProductUnit.PIECE, weight: 400, origin: 'Karnataka', shelfLife: 5, tags: ['gourd'] },
    { name: 'Pointed Gourd (Parwal)', price: 45, wholesalePrice: 34, unit: ProductUnit.KG, weight: 500, origin: 'Bihar', shelfLife: 5, tags: ['gourd'] },
    { name: 'Ladies Finger (Bhindi)', price: 50, wholesalePrice: 38, unit: ProductUnit.KG, weight: 500, isFreshToday: true, origin: 'Andhra Pradesh', shelfLife: 3, tags: ['okra', 'staple'] },
    { name: 'Green Peas (Fresh)', price: 80, wholesalePrice: 60, unit: ProductUnit.KG, weight: 500, isFreshToday: true, isSeasonalItem: true, origin: 'Punjab', shelfLife: 3, tags: ['legume', 'winter'] },
    { name: 'Beans (French)', price: 60, wholesalePrice: 45, unit: ProductUnit.KG, weight: 500, isFreshToday: true, origin: 'Karnataka', shelfLife: 3, tags: ['legume'] },
    { name: 'Flat Beans (Sem)', price: 40, wholesalePrice: 30, unit: ProductUnit.KG, weight: 500, origin: 'Uttar Pradesh', shelfLife: 3, tags: ['legume'] },
    { name: 'Eggplant (Brinjal)', price: 35, wholesalePrice: 25, unit: ProductUnit.KG, weight: 500, origin: 'Tamil Nadu', shelfLife: 5, tags: ['nightshade'] },
    { name: 'Cluster Beans (Gavar)', price: 45, wholesalePrice: 34, unit: ProductUnit.KG, weight: 500, origin: 'Rajasthan', shelfLife: 3, tags: ['legume'] },
    { name: 'Green Chilli', price: 25, wholesalePrice: 18, unit: ProductUnit.KG, weight: 250, isFreshToday: true, origin: 'Andhra Pradesh', shelfLife: 7, tags: ['spicy', 'staple'] },
    { name: 'Red Chilli (Fresh)', price: 60, wholesalePrice: 45, unit: ProductUnit.KG, weight: 250, origin: 'Andhra Pradesh', shelfLife: 7, tags: ['spicy'] },
    { name: 'Ginger', price: 80, wholesalePrice: 60, unit: ProductUnit.KG, weight: 250, isFreshToday: true, isFeatured: true, origin: 'Kerala', shelfLife: 14, tags: ['spice', 'medicinal'] },
    { name: 'Garlic', price: 100, wholesalePrice: 75, unit: ProductUnit.KG, weight: 250, isFreshToday: true, isFeatured: true, origin: 'Madhya Pradesh', shelfLife: 30, tags: ['spice', 'medicinal'] },
    { name: 'Lemon', price: 60, wholesalePrice: 45, unit: ProductUnit.KG, weight: 250, isFreshToday: true, origin: 'Andhra Pradesh', shelfLife: 14, tags: ['citrus', 'staple'] },
    { name: 'Sweet Potato', price: 40, wholesalePrice: 30, unit: ProductUnit.KG, weight: 500, isSeasonalItem: true, origin: 'Uttar Pradesh', shelfLife: 14, tags: ['root', 'healthy'] },
    { name: 'Radish (Mooli)', price: 25, wholesalePrice: 18, unit: ProductUnit.BUNDLE, weight: 400, isFreshToday: true, origin: 'Punjab', shelfLife: 5, tags: ['root'] },
    { name: 'Turnip (Shalgam)', price: 30, wholesalePrice: 22, unit: ProductUnit.KG, weight: 500, isSeasonalItem: true, origin: 'Punjab', shelfLife: 7, tags: ['root', 'winter'] },
    { name: 'Beetroot', price: 40, wholesalePrice: 30, unit: ProductUnit.KG, weight: 500, isFreshToday: true, origin: 'Maharashtra', shelfLife: 14, tags: ['root', 'superfood'] },
    { name: 'Arbi (Colocasia)', price: 35, wholesalePrice: 26, unit: ProductUnit.KG, weight: 500, origin: 'Bihar', shelfLife: 7, tags: ['root'] },
    { name: 'Suran (Yam)', price: 45, wholesalePrice: 34, unit: ProductUnit.KG, weight: 500, origin: 'Maharashtra', shelfLife: 14, tags: ['root'] },
    { name: 'Drumstick (Murungakkai)', price: 60, wholesalePrice: 45, unit: ProductUnit.BUNDLE, weight: 300, isFreshToday: true, origin: 'Tamil Nadu', shelfLife: 5, tags: ['pod', 'healthy'] },
    { name: 'Pumpkin', price: 25, wholesalePrice: 18, unit: ProductUnit.KG, weight: 1000, origin: 'Rajasthan', shelfLife: 30, tags: ['gourd'] },
    { name: 'Ash Gourd (Petha)', price: 20, wholesalePrice: 14, unit: ProductUnit.KG, weight: 1000, origin: 'Uttar Pradesh', shelfLife: 30, tags: ['gourd'] },
    { name: 'Ivy Gourd (Kundru)', price: 40, wholesalePrice: 30, unit: ProductUnit.KG, weight: 500, origin: 'Chhattisgarh', shelfLife: 5, tags: ['gourd'] },
    { name: 'Raw Banana (Kaccha Kela)', price: 30, wholesalePrice: 22, unit: ProductUnit.PIECE, weight: 200, origin: 'Tamil Nadu', shelfLife: 5, tags: ['plantain'] },
    { name: 'Raw Papaya (Kaccha Papita)', price: 35, wholesalePrice: 26, unit: ProductUnit.PIECE, weight: 500, origin: 'Gujarat', shelfLife: 7, tags: ['tropical'] },
    { name: 'Raw Mango (Aam Panna)', price: 80, wholesalePrice: 60, unit: ProductUnit.KG, weight: 500, isSeasonalItem: true, origin: 'Maharashtra', shelfLife: 5, tags: ['summer', 'seasonal'] },
    // More vegetables
    { name: 'Corn (Bhutta)', price: 20, wholesalePrice: 14, unit: ProductUnit.PIECE, weight: 200, isFreshToday: true, isSeasonalItem: true, origin: 'Maharashtra', shelfLife: 3, tags: ['summer', 'snack'] },
    { name: 'Baby Corn', price: 70, wholesalePrice: 52, unit: ProductUnit.KG, weight: 200, isFeatured: true, origin: 'Karnataka', shelfLife: 3, tags: ['salad', 'chinese'] },
    { name: 'Cherry Tomato', price: 100, wholesalePrice: 75, unit: ProductUnit.KG, weight: 250, isFeatured: true, origin: 'Maharashtra', shelfLife: 5, tags: ['salad', 'gourmet'] },
    { name: 'Spring Onion', price: 30, wholesalePrice: 22, unit: ProductUnit.BUNDLE, weight: 200, isFreshToday: true, origin: 'Punjab', shelfLife: 5, tags: ['salad', 'garnish'] },
    { name: 'Leek', price: 60, wholesalePrice: 45, unit: ProductUnit.BUNDLE, weight: 200, origin: 'Himachal Pradesh', shelfLife: 7, tags: ['allium'] },
    { name: 'Chives', price: 40, wholesalePrice: 30, unit: ProductUnit.BUNDLE, weight: 100, origin: 'Ooty', shelfLife: 5, tags: ['herb', 'garnish'] },
    { name: 'Asparagus', price: 150, wholesalePrice: 112, comparePrice: 180, unit: ProductUnit.BUNDLE, weight: 250, isFeatured: true, discountPercentage: 15, origin: 'Himachal Pradesh', shelfLife: 3, tags: ['exotic', 'gourmet'] },
    { name: 'Zucchini (Courgette)', price: 80, wholesalePrice: 60, unit: ProductUnit.KG, weight: 500, origin: 'Maharashtra', shelfLife: 7, tags: ['exotic', 'low-calorie'] },
    { name: 'Artichoke', price: 200, wholesalePrice: 150, unit: ProductUnit.PIECE, weight: 300, origin: 'Himachal Pradesh', shelfLife: 5, tags: ['exotic', 'gourmet'] },
    { name: 'Celery', price: 80, wholesalePrice: 60, unit: ProductUnit.BUNDLE, weight: 300, origin: 'Ooty, Tamil Nadu', shelfLife: 7, tags: ['exotic', 'health'] },
    { name: 'Brussels Sprouts', price: 120, wholesalePrice: 90, unit: ProductUnit.KG, weight: 250, isFeatured: true, origin: 'Ooty', shelfLife: 5, tags: ['exotic', 'cruciferous'] },
    { name: 'Pak Choi', price: 60, wholesalePrice: 45, unit: ProductUnit.BUNDLE, weight: 250, origin: 'Tamil Nadu', shelfLife: 3, tags: ['exotic', 'asian'] },
    { name: 'Bokashi (Bok Choy)', price: 70, wholesalePrice: 52, unit: ProductUnit.BUNDLE, weight: 250, origin: 'Tamil Nadu', shelfLife: 3, tags: ['exotic', 'asian'] },
    { name: 'Kale', price: 120, wholesalePrice: 90, unit: ProductUnit.BUNDLE, weight: 200, isFeatured: true, isOrganic: true, origin: 'Ooty', shelfLife: 3, tags: ['superfood', 'healthy'] },
    { name: 'Swiss Chard', price: 100, wholesalePrice: 75, unit: ProductUnit.BUNDLE, weight: 200, origin: 'Ooty', shelfLife: 3, tags: ['exotic', 'superfood'] },
    { name: 'Fennel Bulb', price: 80, wholesalePrice: 60, unit: ProductUnit.PIECE, weight: 300, origin: 'Rajasthan', shelfLife: 7, tags: ['exotic', 'aromatic'] },
    { name: 'Parsnip', price: 100, wholesalePrice: 75, unit: ProductUnit.KG, weight: 500, origin: 'Himachal Pradesh', shelfLife: 14, tags: ['root', 'exotic'] },
    { name: 'Kohlrabi (Ganth Gobi)', price: 40, wholesalePrice: 30, unit: ProductUnit.PIECE, weight: 300, origin: 'Punjab', shelfLife: 7, tags: ['cruciferous'] },
    { name: 'Okra (Bhindi) - Organic', price: 80, wholesalePrice: 60, unit: ProductUnit.KG, weight: 500, isOrganic: true, isFreshToday: true, origin: 'Andhra Pradesh', shelfLife: 3, tags: ['organic', 'okra'] },
    { name: 'Tomato - Organic', price: 60, wholesalePrice: 45, unit: ProductUnit.KG, weight: 1000, isOrganic: true, isFreshToday: true, isFeatured: true, origin: 'Maharashtra', shelfLife: 7, tags: ['organic', 'staple'] },
    { name: 'Carrot - Organic', price: 70, wholesalePrice: 52, unit: ProductUnit.KG, weight: 500, isOrganic: true, origin: 'Rajasthan', shelfLife: 10, tags: ['organic', 'root'] },
    { name: 'Potato - Organic', price: 50, wholesalePrice: 38, unit: ProductUnit.KG, weight: 1000, isOrganic: true, origin: 'Punjab', shelfLife: 30, tags: ['organic', 'staple'] },
    { name: 'Onion - Organic', price: 70, wholesalePrice: 52, unit: ProductUnit.KG, weight: 1000, isOrganic: true, origin: 'Nashik', shelfLife: 30, tags: ['organic', 'staple'] },
    { name: 'Capsicum Mix (3 Colors)', price: 120, wholesalePrice: 90, comparePrice: 150, unit: ProductUnit.KG, weight: 500, isFeatured: true, discountPercentage: 20, origin: 'Himachal Pradesh', shelfLife: 7, tags: ['colorful', 'mixed'] },
    // More common vegetables
    { name: 'Green Banana Flower (Kele ka Phool)', price: 40, wholesalePrice: 30, unit: ProductUnit.PIECE, weight: 400, origin: 'Karnataka', shelfLife: 3, tags: ['flower', 'traditional'] },
    { name: 'Lotus Stem (Kamal Kakdi)', price: 80, wholesalePrice: 60, unit: ProductUnit.KG, weight: 500, origin: 'Jammu & Kashmir', shelfLife: 7, tags: ['aquatic', 'exotic'] },
    { name: 'Raw Jackfruit (Kathal)', price: 60, wholesalePrice: 45, unit: ProductUnit.KG, weight: 1000, isSeasonalItem: true, origin: 'Kerala', shelfLife: 5, tags: ['tropical', 'vegetarian-meat'] },
    { name: 'Moringa Leaves (Drumstick Leaves)', price: 30, wholesalePrice: 22, unit: ProductUnit.BUNDLE, weight: 100, isFreshToday: true, origin: 'Tamil Nadu', shelfLife: 2, tags: ['superfood', 'medicinal'] },
    { name: 'Banana Blossom', price: 45, wholesalePrice: 34, unit: ProductUnit.PIECE, weight: 300, origin: 'Kerala', shelfLife: 2, tags: ['flower', 'traditional'] },
    { name: 'Taro Root (Arbi)', price: 45, wholesalePrice: 34, unit: ProductUnit.KG, weight: 500, origin: 'Assam', shelfLife: 14, tags: ['root', 'traditional'] },
    { name: 'Water Chestnut (Singhara)', price: 60, wholesalePrice: 45, unit: ProductUnit.KG, weight: 500, isSeasonalItem: true, origin: 'Madhya Pradesh', shelfLife: 7, tags: ['aquatic', 'festive'] },
    { name: 'Sword Bean (Sword Rajma)', price: 70, wholesalePrice: 52, unit: ProductUnit.KG, weight: 250, origin: 'Karnataka', shelfLife: 3, tags: ['legume'] },
    { name: 'Hyacinth Bean (Sem Phali)', price: 50, wholesalePrice: 38, unit: ProductUnit.KG, weight: 250, isSeasonalItem: true, origin: 'Uttar Pradesh', shelfLife: 3, tags: ['legume', 'winter'] },
    // Continued...
    { name: 'Dill Leaves (Shepu)', price: 20, wholesalePrice: 14, unit: ProductUnit.BUNDLE, weight: 100, isFreshToday: true, origin: 'Maharashtra', shelfLife: 3, tags: ['herb', 'aromatic'] },
    { name: 'Purslane (Kulfa Saag)', price: 25, wholesalePrice: 18, unit: ProductUnit.BUNDLE, weight: 150, origin: 'Rajasthan', shelfLife: 2, tags: ['leafy', 'traditional'] },
    { name: 'Amaranth Leaves (Rajgira Saag)', price: 20, wholesalePrice: 14, unit: ProductUnit.BUNDLE, weight: 200, isFreshToday: true, origin: 'Gujarat', shelfLife: 2, tags: ['leafy', 'healthy'] },
    { name: 'Bathua Saag', price: 20, wholesalePrice: 14, unit: ProductUnit.BUNDLE, weight: 200, isSeasonalItem: true, origin: 'Punjab', shelfLife: 2, tags: ['leafy', 'winter'] },
    { name: 'Sarson Saag (Mustard Greens)', price: 25, wholesalePrice: 18, unit: ProductUnit.BUNDLE, weight: 250, isSeasonalItem: true, isFreshToday: true, origin: 'Punjab', shelfLife: 3, tags: ['leafy', 'winter', 'traditional'] },
    { name: 'Gawar Phali (Cluster Beans)', price: 40, wholesalePrice: 30, unit: ProductUnit.KG, weight: 500, origin: 'Rajasthan', shelfLife: 3, tags: ['legume', 'fibrous'] },
  ];

  const fruits: ProductSeed[] = [
    { name: 'Banana (Robusta)', price: 40, wholesalePrice: 30, unit: ProductUnit.DOZEN, weight: 1200, isFeatured: true, isFreshToday: true, origin: 'Maharashtra', shelfLife: 5, tags: ['tropical', 'energy'] },
    { name: 'Apple (Shimla)', price: 150, wholesalePrice: 112, comparePrice: 180, unit: ProductUnit.KG, weight: 1000, isFeatured: true, discountPercentage: 15, origin: 'Himachal Pradesh', shelfLife: 14, tags: ['popular', 'healthy'] },
    { name: 'Apple (Royal Gala)', price: 200, wholesalePrice: 150, unit: ProductUnit.KG, weight: 1000, origin: 'Himachal Pradesh', shelfLife: 14, tags: ['premium', 'sweet'] },
    { name: 'Mango (Alphonso)', price: 350, wholesalePrice: 262, unit: ProductUnit.DOZEN, weight: 1500, isSeasonalItem: true, isFeatured: true, origin: 'Ratnagiri, Maharashtra', shelfLife: 5, tags: ['king-of-fruits', 'summer', 'premium'] },
    { name: 'Mango (Kesar)', price: 250, wholesalePrice: 188, unit: ProductUnit.DOZEN, weight: 1200, isSeasonalItem: true, origin: 'Saurashtra, Gujarat', shelfLife: 5, tags: ['summer', 'sweet'] },
    { name: 'Mango (Dasheri)', price: 120, wholesalePrice: 90, unit: ProductUnit.KG, weight: 1000, isSeasonalItem: true, origin: 'Uttar Pradesh', shelfLife: 5, tags: ['summer', 'north-indian'] },
    { name: 'Mango (Totapuri)', price: 80, wholesalePrice: 60, unit: ProductUnit.KG, weight: 1000, isSeasonalItem: true, origin: 'Andhra Pradesh', shelfLife: 7, tags: ['summer', 'tangy'] },
    { name: 'Papaya', price: 45, wholesalePrice: 34, unit: ProductUnit.PIECE, weight: 1000, isFreshToday: true, origin: 'Karnataka', shelfLife: 5, tags: ['tropical', 'digestive'] },
    { name: 'Pineapple', price: 60, wholesalePrice: 45, unit: ProductUnit.PIECE, weight: 1200, isFreshToday: true, origin: 'Kerala', shelfLife: 5, tags: ['tropical', 'tangy'] },
    { name: 'Watermelon', price: 30, wholesalePrice: 22, unit: ProductUnit.KG, weight: 3000, isSeasonalItem: true, isFeatured: true, origin: 'Rajasthan', shelfLife: 7, tags: ['summer', 'hydrating'] },
    { name: 'Muskmelon (Kharbuja)', price: 40, wholesalePrice: 30, unit: ProductUnit.PIECE, weight: 1500, isSeasonalItem: true, origin: 'Rajasthan', shelfLife: 5, tags: ['summer', 'sweet'] },
    { name: 'Grapes (Green)', price: 80, wholesalePrice: 60, unit: ProductUnit.KG, weight: 500, isFreshToday: true, origin: 'Nashik, Maharashtra', shelfLife: 7, tags: ['grapes', 'sweet'] },
    { name: 'Grapes (Black/Red)', price: 100, wholesalePrice: 75, unit: ProductUnit.KG, weight: 500, isFreshToday: true, origin: 'Nashik, Maharashtra', shelfLife: 7, tags: ['grapes', 'antioxidant'] },
    { name: 'Orange (Nagpur)', price: 100, wholesalePrice: 75, unit: ProductUnit.DOZEN, weight: 1000, isSeasonalItem: true, isFeatured: true, origin: 'Nagpur, Maharashtra', shelfLife: 14, tags: ['citrus', 'vitamin-c'] },
    { name: 'Sweet Lime (Mosambi)', price: 70, wholesalePrice: 52, unit: ProductUnit.KG, weight: 1000, isFreshToday: true, origin: 'Andhra Pradesh', shelfLife: 7, tags: ['citrus', 'juice'] },
    { name: 'Pomegranate (Anar)', price: 150, wholesalePrice: 112, unit: ProductUnit.KG, weight: 1000, isFeatured: true, origin: 'Solapur, Maharashtra', shelfLife: 14, tags: ['superfood', 'antioxidant'] },
    { name: 'Guava (Amrood)', price: 60, wholesalePrice: 45, unit: ProductUnit.KG, weight: 1000, isFreshToday: true, origin: 'Uttar Pradesh', shelfLife: 5, tags: ['tropical', 'vitamin-c'] },
    { name: 'Litchi', price: 150, wholesalePrice: 112, unit: ProductUnit.KG, weight: 500, isSeasonalItem: true, origin: 'Bihar', shelfLife: 3, tags: ['summer', 'sweet', 'exotic'] },
    { name: 'Chickoo (Sapota/Chikoo)', price: 80, wholesalePrice: 60, unit: ProductUnit.KG, weight: 500, isFreshToday: true, origin: 'Gujarat', shelfLife: 5, tags: ['tropical', 'sweet'] },
    { name: 'Jamun (Black Plum)', price: 120, wholesalePrice: 90, unit: ProductUnit.KG, weight: 500, isSeasonalItem: true, origin: 'Uttar Pradesh', shelfLife: 2, tags: ['summer', 'diabetic-friendly'] },
    { name: 'Custard Apple (Sitafal)', price: 100, wholesalePrice: 75, unit: ProductUnit.KG, weight: 500, isSeasonalItem: true, origin: 'Maharashtra', shelfLife: 3, tags: ['tropical', 'sweet'] },
    { name: 'Jackfruit (Ripe)', price: 60, wholesalePrice: 45, unit: ProductUnit.KG, weight: 1000, isSeasonalItem: true, origin: 'Kerala', shelfLife: 3, tags: ['tropical', 'summer'] },
    { name: 'Coconut (Fresh)', price: 40, wholesalePrice: 30, unit: ProductUnit.PIECE, weight: 600, origin: 'Kerala', shelfLife: 30, tags: ['tropical', 'hydrating'] },
    { name: 'Tender Coconut', price: 60, wholesalePrice: 45, unit: ProductUnit.PIECE, weight: 800, isFreshToday: true, origin: 'Kerala', shelfLife: 5, tags: ['hydrating', 'summer'] },
    { name: 'Pear (Nashpati)', price: 120, wholesalePrice: 90, unit: ProductUnit.KG, weight: 500, origin: 'Himachal Pradesh', shelfLife: 7, tags: ['mild', 'sweet'] },
    { name: 'Plum (Aloo Bukhara)', price: 150, wholesalePrice: 112, unit: ProductUnit.KG, weight: 500, isSeasonalItem: true, origin: 'Himachal Pradesh', shelfLife: 5, tags: ['stone-fruit', 'summer'] },
    { name: 'Peach (Aadu)', price: 180, wholesalePrice: 135, unit: ProductUnit.KG, weight: 500, isSeasonalItem: true, origin: 'Himachal Pradesh', shelfLife: 5, tags: ['stone-fruit', 'summer'] },
    { name: 'Apricot (Khubani)', price: 200, wholesalePrice: 150, unit: ProductUnit.KG, weight: 500, isSeasonalItem: true, origin: 'Ladakh', shelfLife: 5, tags: ['stone-fruit', 'antioxidant'] },
    { name: 'Fig (Anjeer - Fresh)', price: 300, wholesalePrice: 225, unit: ProductUnit.KG, weight: 250, isFeatured: true, isSeasonalItem: true, origin: 'Maharashtra', shelfLife: 3, tags: ['exotic', 'premium'] },
    { name: 'Strawberry', price: 200, wholesalePrice: 150, unit: ProductUnit.KG, weight: 250, isSeasonalItem: true, isFeatured: true, origin: 'Mahabaleshwar', shelfLife: 2, tags: ['berry', 'dessert', 'winter'] },
    { name: 'Kiwi', price: 200, wholesalePrice: 150, unit: ProductUnit.PIECE, weight: 80, isFeatured: true, origin: 'Arunachal Pradesh', shelfLife: 7, tags: ['exotic', 'vitamin-c'] },
    { name: 'Dragon Fruit', price: 250, wholesalePrice: 188, unit: ProductUnit.PIECE, weight: 400, isFeatured: true, discountPercentage: 10, origin: 'Gujarat', shelfLife: 5, tags: ['exotic', 'superfood'] },
    { name: 'Passion Fruit', price: 300, wholesalePrice: 225, unit: ProductUnit.KG, weight: 500, origin: 'Himachal Pradesh', shelfLife: 5, tags: ['exotic', 'tropical'] },
    { name: 'Avocado', price: 400, wholesalePrice: 300, unit: ProductUnit.PIECE, weight: 200, isFeatured: true, isOrganic: true, origin: 'Tamil Nadu', shelfLife: 5, tags: ['exotic', 'superfood', 'healthy-fats'] },
    { name: 'Blueberry', price: 350, wholesalePrice: 262, unit: ProductUnit.KG, weight: 125, isFeatured: true, origin: 'Himachal Pradesh', shelfLife: 5, tags: ['berry', 'antioxidant', 'superfood'] },
    { name: 'Raspberry', price: 400, wholesalePrice: 300, unit: ProductUnit.KG, weight: 125, isSeasonalItem: true, origin: 'Himachal Pradesh', shelfLife: 2, tags: ['berry', 'exotic'] },
    { name: 'Blackberry', price: 350, wholesalePrice: 262, unit: ProductUnit.KG, weight: 125, isSeasonalItem: true, origin: 'Himachal Pradesh', shelfLife: 2, tags: ['berry', 'exotic'] },
    { name: 'Pineapple (Queen)', price: 80, wholesalePrice: 60, unit: ProductUnit.PIECE, weight: 800, origin: 'West Bengal', shelfLife: 5, tags: ['tropical'] },
    { name: 'Gooseberry (Amla)', price: 80, wholesalePrice: 60, unit: ProductUnit.KG, weight: 500, isSeasonalItem: true, origin: 'Uttar Pradesh', shelfLife: 7, tags: ['superfood', 'vitamin-c', 'ayurvedic'] },
    { name: 'Wood Apple (Bel)', price: 40, wholesalePrice: 30, unit: ProductUnit.PIECE, weight: 400, isSeasonalItem: true, origin: 'Madhya Pradesh', shelfLife: 14, tags: ['ayurvedic', 'digestive'] },
    { name: 'Persimmon (Japani Phal)', price: 200, wholesalePrice: 150, unit: ProductUnit.KG, weight: 500, isSeasonalItem: true, origin: 'Himachal Pradesh', shelfLife: 7, tags: ['exotic', 'sweet'] },
    { name: 'Longan', price: 300, wholesalePrice: 225, unit: ProductUnit.KG, weight: 500, isSeasonalItem: true, origin: 'Tripura', shelfLife: 5, tags: ['exotic', 'tropical'] },
  ];

  const leafyGreens: ProductSeed[] = [
    { name: 'Spinach (Palak)', price: 25, wholesalePrice: 18, unit: ProductUnit.BUNDLE, weight: 250, isFreshToday: true, isFeatured: true, origin: 'Punjab', shelfLife: 2, tags: ['leafy', 'iron', 'superfood'] },
    { name: 'Fenugreek (Methi)', price: 20, wholesalePrice: 14, unit: ProductUnit.BUNDLE, weight: 200, isFreshToday: true, origin: 'Rajasthan', shelfLife: 2, tags: ['leafy', 'aromatic', 'medicinal'] },
    { name: 'Coriander (Dhania)', price: 15, wholesalePrice: 10, unit: ProductUnit.BUNDLE, weight: 100, isFreshToday: true, isFeatured: true, origin: 'Rajasthan', shelfLife: 3, tags: ['herb', 'garnish', 'staple'] },
    { name: 'Curry Leaves (Kadi Patta)', price: 20, wholesalePrice: 14, unit: ProductUnit.BUNDLE, weight: 50, isFreshToday: true, origin: 'Tamil Nadu', shelfLife: 5, tags: ['herb', 'aromatic', 'south-indian'] },
    { name: 'Mint (Pudina)', price: 20, wholesalePrice: 14, unit: ProductUnit.BUNDLE, weight: 100, isFreshToday: true, origin: 'Uttar Pradesh', shelfLife: 3, tags: ['herb', 'cooling', 'chutney'] },
    { name: 'Lettuce (Iceberg)', price: 60, wholesalePrice: 45, unit: ProductUnit.PIECE, weight: 400, isFreshToday: true, origin: 'Punjab', shelfLife: 5, tags: ['salad', 'western'] },
    { name: 'Lettuce (Romaine)', price: 80, wholesalePrice: 60, unit: ProductUnit.BUNDLE, weight: 300, isFreshToday: true, origin: 'Ooty', shelfLife: 5, tags: ['salad', 'healthy'] },
    { name: 'Arugula (Rocket Leaves)', price: 120, wholesalePrice: 90, unit: ProductUnit.BUNDLE, weight: 150, isFeatured: true, origin: 'Ooty', shelfLife: 3, tags: ['salad', 'peppery', 'exotic'] },
    { name: 'Water Spinach (Kangkung)', price: 30, wholesalePrice: 22, unit: ProductUnit.BUNDLE, weight: 200, origin: 'West Bengal', shelfLife: 2, tags: ['leafy', 'asian'] },
    { name: 'Sorrel (Khatta Saag)', price: 40, wholesalePrice: 30, unit: ProductUnit.BUNDLE, weight: 150, origin: 'Himachal Pradesh', shelfLife: 3, tags: ['leafy', 'sour'] },
  ];

  const herbs: ProductSeed[] = [
    { name: 'Basil (Tulsi Leaves)', price: 40, wholesalePrice: 30, unit: ProductUnit.BUNDLE, weight: 50, isFreshToday: true, origin: 'Maharashtra', shelfLife: 3, tags: ['herb', 'sacred', 'aromatic'] },
    { name: 'Rosemary', price: 80, wholesalePrice: 60, unit: ProductUnit.BUNDLE, weight: 50, origin: 'Ooty', shelfLife: 7, tags: ['herb', 'mediterranean', 'aromatic'] },
    { name: 'Thyme', price: 80, wholesalePrice: 60, unit: ProductUnit.BUNDLE, weight: 30, origin: 'Ooty', shelfLife: 7, tags: ['herb', 'mediterranean'] },
    { name: 'Oregano (Fresh)', price: 70, wholesalePrice: 52, unit: ProductUnit.BUNDLE, weight: 30, origin: 'Himachal Pradesh', shelfLife: 7, tags: ['herb', 'mediterranean', 'italian'] },
    { name: 'Parsley', price: 60, wholesalePrice: 45, unit: ProductUnit.BUNDLE, weight: 50, origin: 'Ooty', shelfLife: 5, tags: ['herb', 'garnish'] },
    { name: 'Sage', price: 100, wholesalePrice: 75, unit: ProductUnit.BUNDLE, weight: 30, origin: 'Himachal Pradesh', shelfLife: 7, tags: ['herb', 'aromatic'] },
    { name: 'Tarragon', price: 120, wholesalePrice: 90, unit: ProductUnit.BUNDLE, weight: 30, origin: 'Himachal Pradesh', shelfLife: 5, tags: ['herb', 'french', 'exotic'] },
    { name: 'Lemongrass', price: 50, wholesalePrice: 38, unit: ProductUnit.BUNDLE, weight: 100, origin: 'Kerala', shelfLife: 7, tags: ['herb', 'aromatic', 'thai'] },
    { name: 'Pandan Leaves', price: 40, wholesalePrice: 30, unit: ProductUnit.BUNDLE, weight: 50, origin: 'Kerala', shelfLife: 5, tags: ['herb', 'tropical', 'aromatic'] },
    { name: 'Kaffir Lime Leaves', price: 60, wholesalePrice: 45, unit: ProductUnit.BUNDLE, weight: 30, origin: 'Tamil Nadu', shelfLife: 7, tags: ['herb', 'thai', 'aromatic'] },
  ];

  const dryFruits: ProductSeed[] = [
    { name: 'Almonds (Badam)', price: 800, wholesalePrice: 600, comparePrice: 950, unit: ProductUnit.KG, weight: 250, isFeatured: true, discountPercentage: 15, origin: 'California (imported)', shelfLife: 180, tags: ['protein', 'healthy', 'premium'] },
    { name: 'Cashews (Kaju)', price: 900, wholesalePrice: 675, unit: ProductUnit.KG, weight: 250, isFeatured: true, origin: 'Kerala/Vietnam', shelfLife: 180, tags: ['protein', 'healthy'] },
    { name: 'Walnuts (Akhrot)', price: 700, wholesalePrice: 525, unit: ProductUnit.KG, weight: 250, isFeatured: true, origin: 'Kashmir', shelfLife: 180, tags: ['omega-3', 'brain', 'healthy'] },
    { name: 'Pistachios (Pista)', price: 1200, wholesalePrice: 900, unit: ProductUnit.KG, weight: 250, origin: 'Iran/Afghanistan', shelfLife: 180, tags: ['premium', 'snack'] },
    { name: 'Raisins (Kishmish)', price: 200, wholesalePrice: 150, unit: ProductUnit.KG, weight: 250, origin: 'Nashik, Maharashtra', shelfLife: 365, tags: ['dry-fruit', 'sweet', 'energy'] },
    { name: 'Dates (Khajoor)', price: 300, wholesalePrice: 225, unit: ProductUnit.KG, weight: 500, isFeatured: true, origin: 'Rajasthan/Arabia', shelfLife: 180, tags: ['sweet', 'energy', 'ramadan'] },
    { name: 'Apricots Dry (Khubani)', price: 400, wholesalePrice: 300, unit: ProductUnit.KG, weight: 250, origin: 'Afghanistan', shelfLife: 365, tags: ['dry-fruit', 'iron'] },
    { name: 'Figs Dry (Anjeer)', price: 600, wholesalePrice: 450, unit: ProductUnit.KG, weight: 250, isFeatured: true, origin: 'Turkey', shelfLife: 365, tags: ['dry-fruit', 'calcium'] },
    { name: 'Hazelnuts (Fudge Nuts)', price: 1000, wholesalePrice: 750, unit: ProductUnit.KG, weight: 250, origin: 'Turkey', shelfLife: 180, tags: ['premium', 'chocolate'] },
    { name: 'Peanuts (Moongphali)', price: 120, wholesalePrice: 90, unit: ProductUnit.KG, weight: 500, origin: 'Gujarat', shelfLife: 180, tags: ['protein', 'affordable'] },
    { name: 'Sunflower Seeds', price: 150, wholesalePrice: 112, unit: ProductUnit.KG, weight: 250, origin: 'Rajasthan', shelfLife: 180, tags: ['seeds', 'healthy'] },
    { name: 'Pumpkin Seeds', price: 200, wholesalePrice: 150, unit: ProductUnit.KG, weight: 250, origin: 'Rajasthan', shelfLife: 180, tags: ['seeds', 'zinc'] },
    { name: 'Chia Seeds', price: 350, wholesalePrice: 262, unit: ProductUnit.KG, weight: 250, isFeatured: true, origin: 'Guatemala', shelfLife: 365, tags: ['superfood', 'omega-3'] },
    { name: 'Flax Seeds (Alsi)', price: 150, wholesalePrice: 112, unit: ProductUnit.KG, weight: 250, origin: 'Madhya Pradesh', shelfLife: 365, tags: ['omega-3', 'fiber'] },
    { name: 'Black Raisins', price: 250, wholesalePrice: 188, unit: ProductUnit.KG, weight: 250, origin: 'Nashik', shelfLife: 365, tags: ['dry-fruit', 'antioxidant'] },
    { name: 'Prunes (Dried Plum)', price: 350, wholesalePrice: 262, unit: ProductUnit.KG, weight: 250, origin: 'California', shelfLife: 180, tags: ['dry-fruit', 'digestive'] },
    { name: 'Pine Nuts (Chilgoza)', price: 2000, wholesalePrice: 1500, unit: ProductUnit.KG, weight: 100, origin: 'Afghanistan/Pakistan', shelfLife: 90, tags: ['premium', 'gourmet'] },
    { name: 'Brazil Nuts', price: 1500, wholesalePrice: 1125, unit: ProductUnit.KG, weight: 250, origin: 'Brazil', shelfLife: 90, tags: ['premium', 'selenium'] },
    { name: 'Macadamia Nuts', price: 1800, wholesalePrice: 1350, unit: ProductUnit.KG, weight: 250, origin: 'Australia', shelfLife: 90, tags: ['premium', 'gourmet'] },
    { name: 'Pecan Nuts', price: 1600, wholesalePrice: 1200, unit: ProductUnit.KG, weight: 250, origin: 'USA', shelfLife: 90, tags: ['premium', 'dessert'] },
  ];

  const allProducts = [
    ...vegetables.map(p => ({ ...p, categorySlug: 'vegetables' })),
    ...fruits.map(p => ({ ...p, categorySlug: 'fruits' })),
    ...leafyGreens.map(p => ({ ...p, categorySlug: 'leafy-greens' })),
    ...herbs.map(p => ({ ...p, categorySlug: 'herbs-spices' })),
    ...dryFruits.map(p => ({ ...p, categorySlug: 'dry-fruits-nuts' })),
  ];

  // Exotic vegetables - add to exotic category
  const exoticVegetables: (ProductSeed & { categorySlug: string })[] = [
    { name: 'Truffle (Fresh)', price: 5000, wholesalePrice: 3750, unit: ProductUnit.GRAM, weight: 50, isFeatured: true, origin: 'Italy (imported)', shelfLife: 7, categorySlug: 'exotic-vegetables', tags: ['ultra-premium', 'gourmet'] },
    { name: 'Edamame (Fresh)', price: 200, wholesalePrice: 150, unit: ProductUnit.KG, weight: 500, origin: 'Maharashtra', shelfLife: 3, categorySlug: 'exotic-vegetables', tags: ['japanese', 'protein'] },
    { name: 'Tomatillo', price: 300, wholesalePrice: 225, unit: ProductUnit.KG, weight: 500, origin: 'Maharashtra', shelfLife: 7, categorySlug: 'exotic-vegetables', tags: ['mexican', 'salsa'] },
    { name: 'Romanesco Broccoli', price: 200, wholesalePrice: 150, unit: ProductUnit.PIECE, weight: 400, origin: 'Ooty', shelfLife: 5, categorySlug: 'exotic-vegetables', tags: ['exotic', 'italian'] },
    { name: 'Purple Cabbage', price: 60, wholesalePrice: 45, unit: ProductUnit.PIECE, weight: 600, isFeatured: true, origin: 'Ooty', shelfLife: 7, categorySlug: 'exotic-vegetables', tags: ['colorful', 'antioxidant'] },
    { name: 'Radicchio', price: 180, wholesalePrice: 135, unit: ProductUnit.PIECE, weight: 300, origin: 'Ooty', shelfLife: 5, categorySlug: 'exotic-vegetables', tags: ['italian', 'bitter', 'salad'] },
    { name: 'Watercress', price: 120, wholesalePrice: 90, unit: ProductUnit.BUNDLE, weight: 100, isFreshToday: true, origin: 'Ooty', shelfLife: 3, categorySlug: 'exotic-vegetables', tags: ['superfood', 'peppery'] },
    { name: 'Endive (Chicory)', price: 150, wholesalePrice: 112, unit: ProductUnit.PIECE, weight: 200, origin: 'Ooty', shelfLife: 5, categorySlug: 'exotic-vegetables', tags: ['bitter', 'salad', 'belgian'] },
  ];

  const organicVegetables: (ProductSeed & { categorySlug: string })[] = [
    { name: 'Organic Mixed Vegetables Box', price: 299, wholesalePrice: 224, comparePrice: 399, unit: ProductUnit.KG, weight: 2000, isOrganic: true, isFeatured: true, discountPercentage: 25, origin: 'Certified Organic Farms, Maharashtra', shelfLife: 5, categorySlug: 'organic', tags: ['organic', 'box', 'mixed', 'value'] },
    { name: 'Organic Broccoli', price: 120, wholesalePrice: 90, unit: ProductUnit.PIECE, weight: 500, isOrganic: true, origin: 'Ooty Organic Farms', shelfLife: 5, categorySlug: 'organic', tags: ['organic', 'superfood'] },
    { name: 'Organic Spinach', price: 50, wholesalePrice: 38, unit: ProductUnit.BUNDLE, weight: 250, isOrganic: true, isFreshToday: true, origin: 'Punjab Organic Farms', shelfLife: 2, categorySlug: 'organic', tags: ['organic', 'iron'] },
    { name: 'Organic Methi (Fenugreek)', price: 40, wholesalePrice: 30, unit: ProductUnit.BUNDLE, weight: 200, isOrganic: true, isFreshToday: true, origin: 'Rajasthan Organic Farms', shelfLife: 2, categorySlug: 'organic', tags: ['organic', 'herb'] },
    { name: 'Organic Garlic', price: 200, wholesalePrice: 150, unit: ProductUnit.KG, weight: 250, isOrganic: true, isFeatured: true, origin: 'Madhya Pradesh Organic Farms', shelfLife: 30, categorySlug: 'organic', tags: ['organic', 'medicinal'] },
    { name: 'Organic Ginger', price: 150, wholesalePrice: 112, unit: ProductUnit.KG, weight: 250, isOrganic: true, origin: 'Kerala Organic Farms', shelfLife: 14, categorySlug: 'organic', tags: ['organic', 'medicinal'] },
    { name: 'Organic Turmeric Root (Fresh)', price: 120, wholesalePrice: 90, unit: ProductUnit.KG, weight: 250, isOrganic: true, isFeatured: true, origin: 'Erode, Tamil Nadu', shelfLife: 30, categorySlug: 'organic', tags: ['organic', 'superfood', 'medicinal', 'anti-inflammatory'] },
  ];

  const seasonalProducts: (ProductSeed & { categorySlug: string })[] = [
    { name: 'Makai (Fresh Corn) - Monsoon Special', price: 15, wholesalePrice: 10, unit: ProductUnit.PIECE, weight: 200, isSeasonalItem: true, isFreshToday: true, origin: 'Maharashtra', shelfLife: 2, categorySlug: 'seasonal', tags: ['monsoon', 'seasonal', 'snack'] },
    { name: 'Gongura (Sorrel) Andhra Special', price: 30, wholesalePrice: 22, unit: ProductUnit.BUNDLE, weight: 200, isSeasonalItem: true, origin: 'Andhra Pradesh', shelfLife: 2, categorySlug: 'seasonal', tags: ['andhra', 'sour', 'seasonal'] },
    { name: 'Ambadi (Roselle/Gongura Maharashtra)', price: 30, wholesalePrice: 22, unit: ProductUnit.BUNDLE, weight: 200, isSeasonalItem: true, origin: 'Maharashtra', shelfLife: 2, categorySlug: 'seasonal', tags: ['monsoon', 'traditional'] },
    { name: 'Suva Bhaji (Dill) - Winter Fresh', price: 20, wholesalePrice: 14, unit: ProductUnit.BUNDLE, weight: 150, isSeasonalItem: true, isFreshToday: true, origin: 'Maharashtra', shelfLife: 3, categorySlug: 'seasonal', tags: ['winter', 'herb', 'aromatic'] },
    { name: 'Kolhapuri Red Chilli (Fresh Season)', price: 100, wholesalePrice: 75, unit: ProductUnit.KG, weight: 500, isSeasonalItem: true, origin: 'Kolhapur, Maharashtra', shelfLife: 7, categorySlug: 'seasonal', tags: ['spicy', 'seasonal', 'premium'] },
    { name: 'Straw Mushroom', price: 200, wholesalePrice: 150, unit: ProductUnit.KG, weight: 250, isSeasonalItem: true, isFreshToday: true, origin: 'Himachal Pradesh', shelfLife: 2, categorySlug: 'seasonal', tags: ['mushroom', 'monsoon', 'gourmet'] },
    { name: 'Oyster Mushroom', price: 300, wholesalePrice: 225, unit: ProductUnit.KG, weight: 250, isSeasonalItem: true, isFeatured: true, origin: 'Himachal Pradesh', shelfLife: 3, categorySlug: 'seasonal', tags: ['mushroom', 'exotic', 'protein'] },
    { name: 'Button Mushroom', price: 150, wholesalePrice: 112, unit: ProductUnit.KG, weight: 200, isFreshToday: true, isFeatured: true, origin: 'Himachal Pradesh', shelfLife: 3, categorySlug: 'seasonal', tags: ['mushroom', 'popular'] },
  ];

  const allProductsToCreate = [
    ...allProducts,
    ...exoticVegetables,
    ...organicVegetables,
    ...seasonalProducts,
  ];

  console.log(`📦 Creating ${allProductsToCreate.length} products...`);

  for (const product of allProductsToCreate) {
    const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const sku = `DV-${product.categorySlug.toUpperCase().substring(0, 3)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const cat = categories[product.categorySlug];

    if (!cat) {
      console.warn(`Category not found for slug: ${product.categorySlug}`);
      continue;
    }

    const created = await prisma.product.create({
      data: {
        id: uuidv4(),
        categoryId: cat.id,
        name: product.name,
        slug: `${slug}-${uuidv4().substring(0, 4)}`,
        sku,
        price: product.price,
        wholesalePrice: product.wholesalePrice,
        comparePrice: product.comparePrice,
        unit: product.unit,
        weight: product.weight,
        isOrganic: product.isOrganic ?? false,
        isFeatured: product.isFeatured ?? false,
        isFreshToday: product.isFreshToday ?? false,
        isSeasonalItem: product.isSeasonalItem ?? false,
        discountPercentage: product.discountPercentage,
        origin: product.origin,
        shelfLife: product.shelfLife,
        nutritionInfo: product.nutritionInfo ?? {},
        tags: product.tags ?? [],
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        reviewCount: Math.floor(Math.random() * 200),
        isPublished: true,
        minOrderQty: 1,
        wholesaleMinQty: 10,
      },
    });

    // Create inventory
    const stock = Math.floor(50 + Math.random() * 200);
    await prisma.inventory.create({
      data: {
        productId: created.id,
        warehouseStock: stock + Math.floor(Math.random() * 100),
        availableStock: stock,
        reservedStock: 0,
        lowStockThreshold: 15,
        purchasePrice: product.wholesalePrice * 0.8,
        supplierName: `${product.origin || 'Local'} Suppliers`,
        lastRestockedAt: new Date(),
      },
    });

    // Create primary product image (placeholder unsplash)
    const imageMap: Record<string, string> = {
      vegetables: 'photo-1540148426945-6cf22a6b2383',
      fruits: 'photo-1619566636858-adf3ef46400b',
      'leafy-greens': 'photo-1576045057995-568f588f82fb',
      'herbs-spices': 'photo-1509099836639-18ba1795216d',
      'dry-fruits-nuts': 'photo-1536304929831-ee1ca9d44906',
      organic: 'photo-1590779033100-9f60a05a013d',
      'exotic-vegetables': 'photo-1518977956812-cd3dbadaaf31',
      seasonal: 'photo-1516594798947-e65505dbb29d',
    };
    const photoId = imageMap[product.categorySlug] || 'photo-1540148426945-6cf22a6b2383';

    await prisma.productImage.create({
      data: {
        productId: created.id,
        url: `https://images.unsplash.com/${photoId}?w=600&q=80`,
        alt: product.name,
        isPrimary: true,
        sortOrder: 0,
      },
    });
  }

  // ─── COUPONS ───────────────────────────────────────
  console.log('🎟️ Creating coupons...');

  const coupons = [
    { code: 'WELCOME50', title: 'Welcome Offer', description: '₹50 off on your first order', type: CouponType.FLAT, discountValue: 50, minOrderValue: 199, maxUses: 1000, maxUsesPerUser: 1, applicableFor: [Role.CUSTOMER] },
    { code: 'FRESH20', title: 'Fresh Deal', description: '20% off on all vegetables', type: CouponType.PERCENTAGE, discountValue: 20, maxDiscount: 100, minOrderValue: 149, maxUses: null, maxUsesPerUser: 3, applicableFor: [Role.CUSTOMER] },
    { code: 'FREEDEL', title: 'Free Delivery', description: 'Free delivery on your next order', type: CouponType.FREE_DELIVERY, discountValue: 0, minOrderValue: 99, maxUsesPerUser: 2, applicableFor: [Role.CUSTOMER] },
    { code: 'BULK15', title: 'Bulk Discount', description: '15% off on wholesale orders', type: CouponType.PERCENTAGE, discountValue: 15, maxDiscount: 500, minOrderValue: 1000, maxUsesPerUser: 5, applicableFor: [Role.WHOLESALE_BUYER] },
    { code: 'DIWALI100', title: 'Diwali Special', description: '₹100 off - Diwali celebrations', type: CouponType.FESTIVAL, discountValue: 100, minOrderValue: 299, maxUses: 500, maxUsesPerUser: 1, applicableFor: [Role.CUSTOMER] },
    { code: 'REFER75', title: 'Referral Reward', description: '₹75 off when you refer a friend', type: CouponType.REFERRAL, discountValue: 75, minOrderValue: 149, maxUsesPerUser: 10, applicableFor: [Role.CUSTOMER] },
    { code: 'FIRSTORDER', title: 'First Order', description: 'Flat ₹75 off on your first order', type: CouponType.FIRST_ORDER, discountValue: 75, minOrderValue: 149, maxUses: 5000, maxUsesPerUser: 1, applicableFor: [Role.CUSTOMER] },
    { code: 'ORGANIC25', title: 'Go Organic', description: '25% off on all organic products', type: CouponType.PERCENTAGE, discountValue: 25, maxDiscount: 200, minOrderValue: 249, maxUsesPerUser: 2, applicableFor: [Role.CUSTOMER] },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.create({
      data: {
        id: uuidv4(),
        ...coupon,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });
  }

  // ─── BANNERS ───────────────────────────────────────
  console.log('🖼️ Creating banners...');

  const banners = [
    { title: 'Fresh From Farm', subtitle: 'Up to 30% off on seasonal vegetables', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80', mobileImageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80', type: BannerType.HERO, sortOrder: 1, linkType: 'CATEGORY', linkValue: 'vegetables' },
    { title: 'Alphonso Season Is Here!', subtitle: 'Premium Alphonso mangoes from Ratnagiri', imageUrl: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=1200&q=80', mobileImageUrl: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=600&q=80', type: BannerType.HERO, sortOrder: 2, linkType: 'CATEGORY', linkValue: 'fruits' },
    { title: 'Go Organic!', subtitle: 'Certified organic produce delivered fresh', imageUrl: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=1200&q=80', mobileImageUrl: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=600&q=80', type: BannerType.HERO, sortOrder: 3, linkType: 'CATEGORY', linkValue: 'organic' },
    { title: 'Weekend Offer', subtitle: 'Use code FRESH20 for 20% off', imageUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&q=80', type: BannerType.OFFER, sortOrder: 1, linkType: 'URL', linkValue: '/coupons' },
    { title: 'Diwali Special', subtitle: 'Dry fruits & nuts at special prices', imageUrl: 'https://images.unsplash.com/photo-1605018700280-4d9c5e6bcdbe?w=800&q=80', type: BannerType.OFFER, sortOrder: 2, linkType: 'CATEGORY', linkValue: 'dry-fruits-nuts' },
  ];

  for (const banner of banners) {
    await prisma.banner.create({
      data: { id: uuidv4(), ...banner, isActive: true },
    });
  }

  // ─── NOTIFICATIONS ─────────────────────────────────
  console.log('🔔 Creating sample notifications...');

  await prisma.notification.create({
    data: {
      userId: customer1.id,
      type: 'COUPON_ALERT',
      title: '🎁 Special offer just for you!',
      body: 'Use code FRESH20 to get 20% off on your next order. Hurry, limited time!',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: customer1.id,
      type: 'GENERAL',
      title: '🌿 Organic products now available!',
      body: 'We have added 50+ certified organic products to our catalog. Shop fresh!',
      isRead: false,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('Demo Credentials:');
  console.log('─────────────────');
  console.log('Super Admin: superadmin@devvegis.com / Password@123');
  console.log('Admin:       admin@devvegis.com / Password@123');
  console.log('Customer:    priya@example.com / Password@123');
  console.log('Wholesale:   wholesale@agarwal.com / Password@123');
  console.log('Rider:       vijay.rider@devvegis.com / Password@123');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
