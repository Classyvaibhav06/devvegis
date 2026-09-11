import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, ArrowRight, CheckCircle2 } from 'lucide-react';
import HeroBanner, { FeaturedCategories, PromoBanners, TrustStrip } from '@/components/home/HeroCarousel';
import PopularProducts from '@/components/home/PopularProducts';
import DailyBestSells from '@/components/home/DailyBestSells';
import ProductSection from '@/components/home/ProductSection';
import BuyAgainShelf from '@/components/home/BuyAgainShelf';

export const metadata: Metadata = {
  title: 'DevVegis — Farm-Fresh Organic Grocery in 12 Minutes',
  description: 'Order crisp vegetables, sweet fruits, hydroponic greens, and organic groceries online. Direct from farm to kitchen in 12 minutes.',
};

export default function HomePage() {
  return (
    <div className="container-main space-y-10 sm:space-y-14 py-6">
      {/* ─── Hero Banner ─── */}
      <HeroBanner />

      {/* ─── Trust Strip (4 guarantee badges) ─── */}
      <TrustStrip />

      {/* ─── Featured Categories (circular scrollable icons) ─── */}
      <FeaturedCategories />

      {/* ─── Three Promotional Banners ─── */}
      <PromoBanners />

      {/* ─── Popular Products (with category filter tabs) ─── */}
      <PopularProducts />

      {/* ─── Daily Best Sells (left banner + cards) ─── */}
      <DailyBestSells />

      {/* ─── Buy Again Quick-Reorder Shelf ─── */}
      <BuyAgainShelf />

      {/* ─── Flash Harvest Deals ─── */}
      <ProductSection
        title="⚡ Flash Harvest Deals & Discounts"
        subtitle="Limited dawn harvest inventory at up to 40% OFF"
        endpoint="/products/flash-deals"
        viewAllHref="/search?q=deal"
      />

      {/* ─── Daily Kitchen Staples (Under ₹40) ─── */}
      <ProductSection
        title="🪙 Daily Kitchen Staples (Under ₹40)"
        subtitle="Pocket-friendly daily cooking vegetables"
        endpoint="/products"
        params={{ maxPrice: '40', limit: '10' }}
        viewAllHref="/search?maxPrice=40"
      />

      {/* ─── B2B Wholesale Mandi Banner ─── */}
      <div className="rounded-2xl overflow-hidden bg-emerald-700 dark:bg-[#0F1520] p-7 sm:p-9 text-white flex flex-col lg:flex-row items-center justify-between gap-6 shadow-lg dark:shadow-2xl border border-emerald-600 dark:border-white/[0.07] relative">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2.5 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white/90 text-xs font-extrabold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>DevVegis B2B Wholesale</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight leading-snug">
            Need Bulk Crates for Your Restaurant, Hotel, or Store?
          </h3>
          <p className="text-sm text-white/80 leading-relaxed">
            Source 25kg to 50kg crates directly at primary Mandi wholesale rates. Save up to 35% with automated GST invoices and scheduled bulk morning freight.
          </p>
          <div className="flex flex-wrap gap-4 pt-1 text-xs text-white/90 font-semibold">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-300" /> Mandi Benchmark Rates</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-300" /> GST Invoicing</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-300" /> Dedicated Account Manager</span>
          </div>
        </div>

        <Link
          href="/wholesale"
          className="shrink-0 bg-white text-emerald-700 font-extrabold text-sm px-7 py-3.5 rounded-xl shadow-lg hover:bg-emerald-50 hover:scale-105 transition-all flex items-center gap-2 z-10"
        >
          <span>Explore Wholesale Portal</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ─── More Product Sections ─── */}
      <ProductSection
        title="🌿 Fresh Harvested This Dawn"
        subtitle="Cut and packed between 4:00 AM – 5:30 AM"
        endpoint="/products"
        params={{ isFreshToday: 'true', limit: '12' }}
        viewAllHref="/categories/vegetables"
      />

      <ProductSection
        title="🍎 Juicy Orchard Fruits"
        subtitle="Naturally ripened, pesticide-tested, sweet & succulent"
        endpoint="/products"
        params={{ categorySlug: 'fruits', sort: 'rating', order: 'desc' }}
        viewAllHref="/categories/fruits"
      />

      <ProductSection
        title="🌾 100% Certified Organic Farm Greens"
        subtitle="Chemical-free produce certified by accredited agencies"
        endpoint="/products"
        params={{ isOrganic: 'true', limit: '12' }}
        viewAllHref="/categories/organic"
      />
    </div>
  );
}
