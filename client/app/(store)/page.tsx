import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, ArrowRight, CheckCircle2 } from 'lucide-react';
import HeroBanner, { FeaturedCategories, PromoBanners, TrustStrip } from '@/components/home/HeroCarousel';
import PopularProducts from '@/components/home/PopularProducts';

export const metadata: Metadata = {
  title: 'DevVegis — Farm-Fresh Organic Grocery in 12 Minutes',
  description: 'Order crisp vegetables, sweet fruits, hydroponic greens, and organic groceries online. Direct from farm to kitchen in 12 minutes.',
};

export default function HomePage() {
  return (
    <div className="container-main space-y-6 sm:space-y-12 py-3 sm:py-6">
      {/* ─── 1. Hero Banner (Dynamic: Admin can configure HERO banners under /admin/banners) ─── */}
      <HeroBanner />

      {/* ─── 2. Trust Strip (Speed & Farm Direct Guarantees) ─── */}
      <TrustStrip />

      {/* ─── 3. Featured Categories Rail (Dynamic: Admin manages categories under /admin/categories) ─── */}
      <FeaturedCategories />

      {/* ─── 4. Promotional Offer Banners (Dynamic: Admin manages OFFER banners under /admin/banners) ─── */}
      <PromoBanners />

      {/* ─── 5. Main Product Catalog with Dynamic Category Tabs (Admin manages via /admin/products) ─── */}
      <PopularProducts />

      {/* ─── 6. B2B Wholesale Mandi Banner (Direct access to bulk rates & wholesale portal) ─── */}
      <div className="rounded-2xl overflow-hidden bg-emerald-700 dark:bg-[#0F1520] p-5 sm:p-7 md:p-9 text-white flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 sm:gap-6 shadow-md border border-emerald-600 dark:border-white/[0.07] relative">
        <div className="absolute -right-20 -bottom-20 w-60 sm:w-80 h-60 sm:h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 sm:space-y-2.5 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/15 border border-white/20 text-white/95 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
            <Building2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>DevVegis B2B Wholesale</span>
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-white tracking-tight leading-snug">
            Need Bulk Crates for Your Restaurant, Hotel, or Store?
          </h3>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Source 25kg to 50kg crates directly at primary Mandi wholesale rates. Save up to 35% with automated GST invoices and scheduled morning freight.
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 pt-1 text-[11px] sm:text-xs text-white/90 font-semibold">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" /> Mandi Benchmark Rates</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" /> Automated GST Invoicing</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" /> Dedicated Account Manager</span>
          </div>
        </div>

        <Link
          href="/wholesale"
          className="shrink-0 bg-white text-emerald-700 font-extrabold text-xs sm:text-sm px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl shadow-md hover:bg-emerald-50 hover:scale-105 transition-all flex items-center justify-center gap-2 z-10 w-full sm:w-auto text-center"
        >
          <span>Explore Wholesale Portal</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
