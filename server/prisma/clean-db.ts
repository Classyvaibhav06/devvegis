import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Purging all mock and prefilled data from database...');

  // 1. Delete all transactional, customer, and marketing data
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

  // 2. Delete all users except we will recreate the single Admin
  await prisma.user.deleteMany();

  console.log('👑 Creating single clean Administrator account...');
  const hashedPassword = await bcrypt.hash('Password@123', 12);

  const admin = await prisma.user.create({
    data: {
      id: uuidv4(),
      name: 'Store Administrator',
      email: 'admin@devvegis.com',
      phone: '9999999999',
      password: hashedPassword,
      role: Role.ADMIN,
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      referralCode: 'ADMINSTORE',
    },
  });

  console.log('✅ Database wiped clean successfully!');
  console.log('----------------------------------------------------');
  console.log(`Admin Email:    ${admin.email}`);
  console.log(`Admin Password: Password@123`);
  console.log(`Role:           ${admin.role}`);
  console.log('All mock products, categories, riders, banners, and coupons have been completely emptied.');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Clean reset failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
