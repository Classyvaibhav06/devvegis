'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowUpRight, Flame, Sparkles, Tag, TrendingUp, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CategoryCircleItem {
  id: string;
  name: string;
  badgeText?: string;
  filterKey: string;
  iconType: 'new-arrival' | 'best-seller' | 'big-sale' | 'trending' | 'staples' | 'exotics' | 'contract' | 'greens' | 'cold-storage' | 'shop-all';
  bgGradient: string;
  borderColor: string;
  ringGlow: string;
}

const CIRCLE_CATEGORIES: CategoryCircleItem[] = [
  {
    id: 'new-arrivals',
    name: 'New Arrivals',
    badgeText: 'NEW ARRIVAL',
    filterKey: 'new-arrivals',
    iconType: 'new-arrival',
    bgGradient: 'from-amber-400 via-orange-500 to-amber-600',
    borderColor: 'border-amber-300 dark:border-amber-500/60',
    ringGlow: 'ring-amber-400/50',
  },
  {
    id: 'best-sellers',
    name: 'Best Sellers',
    badgeText: 'BEST SELLER',
    filterKey: 'best-sellers',
    iconType: 'best-seller',
    bgGradient: 'from-rose-500 via-pink-600 to-rose-700',
    borderColor: 'border-pink-300 dark:border-pink-500/60',
    ringGlow: 'ring-rose-400/50',
  },
  {
    id: 'on-sale',
    name: 'On Sale',
    badgeText: 'BIG SALE',
    filterKey: 'on-sale',
    iconType: 'big-sale',
    bgGradient: 'from-red-600 via-red-500 to-orange-600',
    borderColor: 'border-red-400 dark:border-red-500/60',
    ringGlow: 'ring-red-400/50',
  },
  {
    id: 'trending',
    name: 'Trending Products',
    badgeText: 'TRENDING PRODUCTS',
    filterKey: 'trending',
    iconType: 'trending',
    bgGradient: 'from-cyan-400 via-blue-600 to-indigo-700',
    borderColor: 'border-cyan-300 dark:border-cyan-500/60',
    ringGlow: 'ring-cyan-400/50',
  },
  {
    id: 'farm-staples',
    name: 'Farm Staples',
    badgeText: 'MANDI STAPLES',
    filterKey: 'roots',
    iconType: 'staples',
    bgGradient: 'from-amber-700 via-amber-800 to-stone-900',
    borderColor: 'border-amber-600 dark:border-amber-700/60',
    ringGlow: 'ring-amber-600/50',
  },
  {
    id: 'exotics-gourmet',
    name: 'Exotics & Hydroponic',
    badgeText: 'EXOTIC HARVEST',
    filterKey: 'exotics',
    iconType: 'exotics',
    bgGradient: 'from-purple-600 via-fuchsia-700 to-purple-900',
    borderColor: 'border-purple-400 dark:border-purple-500/60',
    ringGlow: 'ring-purple-400/50',
  },
  {
    id: 'customized-contract',
    name: 'B2B Contracts',
    badgeText: 'CUSTOM SUPPLY',
    filterKey: 'customized',
    iconType: 'contract',
    bgGradient: 'from-indigo-500 via-purple-600 to-slate-900',
    borderColor: 'border-indigo-400 dark:border-indigo-500/60',
    ringGlow: 'ring-indigo-400/50',
  },
  {
    id: 'leafy-greens',
    name: 'Leafy & Herbs',
    badgeText: 'HYDRO GREENS',
    filterKey: 'greens',
    iconType: 'greens',
    bgGradient: 'from-emerald-400 via-teal-600 to-emerald-800',
    borderColor: 'border-emerald-300 dark:border-emerald-500/60',
    ringGlow: 'ring-emerald-400/50',
  },
  {
    id: 'cold-storage',
    name: 'Bulk Crates (25kg+)',
    badgeText: 'BULK MANDI',
    filterKey: 'vine',
    iconType: 'cold-storage',
    bgGradient: 'from-stone-700 via-stone-800 to-neutral-900',
    borderColor: 'border-stone-500 dark:border-stone-600/60',
    ringGlow: 'ring-stone-500/50',
  },
  {
    id: 'shop-all',
    name: 'Shop All',
    filterKey: 'all',
    iconType: 'shop-all',
    bgGradient: 'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900',
    borderColor: 'border-slate-300 dark:border-white/20',
    ringGlow: 'ring-slate-400/50',
  },
];

export default function WholesaleCircularCategories({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory?: string;
  onSelectCategory?: (key: string) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentKey = selectedCategory || searchParams?.get('category') || 'all';

  const handleClick = (key: string) => {
    if (onSelectCategory) {
      onSelectCategory(key);
      return;
    }
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (key === 'all') {
      params.delete('category');
    } else {
      params.set('category', key);
    }
    router.push(`/wholesale?${params.toString()}`);
  };

  return (
    <section className="py-5 sm:py-6 border-b border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-[#0B0F17] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-start lg:justify-between gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-1">
          {CIRCLE_CATEGORIES.map((cat) => {
            const isActive = currentKey === cat.filterKey || (cat.filterKey === 'all' && (!currentKey || currentKey === 'all'));

            return (
              <button
                key={cat.id}
                onClick={() => handleClick(cat.filterKey)}
                className="group flex flex-col items-center gap-2.5 shrink-0 focus:outline-none cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
              >
                {/* ─── Circular Badge Medallion ─── */}
                <div
                  className={cn(
                    "w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2px] transition-all duration-300 relative shadow-sm",
                    isActive
                      ? `ring-3 ${cat.ringGlow} scale-105 shadow-md`
                      : "group-hover:scale-105 group-hover:shadow-md"
                  )}
                >
                  {/* Outer vibrant decorative ring */}
                  <div className={`w-full h-full rounded-full bg-gradient-to-tr ${cat.bgGradient} p-1 flex items-center justify-center relative overflow-hidden border ${cat.borderColor}`}>
                    {/* Inner Badge graphic */}
                    {cat.iconType === 'shop-all' ? (
                      <div className="w-full h-full rounded-full bg-white dark:bg-[#131923] flex items-center justify-center text-slate-800 dark:text-slate-100 group-hover:rotate-45 transition-transform duration-300">
                        <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 dark:text-white" strokeWidth={2.5} />
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-full bg-black/20 backdrop-blur-xs flex flex-col items-center justify-center p-1 text-center select-none shadow-inner border border-white/20">
                        {/* Realistic Medallion Typography */}
                        {cat.iconType === 'new-arrival' && (
                          <div className="text-white font-black leading-none drop-shadow-md">
                            <span className="text-[10px] sm:text-[11px] block tracking-tighter text-amber-200">NEW</span>
                            <span className="text-[9px] sm:text-[10px] block tracking-tight">ARRIVAL</span>
                          </div>
                        )}
                        {cat.iconType === 'best-seller' && (
                          <div className="text-white font-black leading-none drop-shadow-md">
                            <span className="text-[10px] sm:text-[11px] block tracking-tighter text-pink-200">BEST</span>
                            <span className="text-[9px] sm:text-[10px] block tracking-tight">SELLER</span>
                          </div>
                        )}
                        {cat.iconType === 'big-sale' && (
                          <div className="text-white font-black leading-none drop-shadow-md">
                            <span className="text-[10px] sm:text-[11px] block tracking-tighter text-yellow-200">BIG</span>
                            <span className="text-[9px] sm:text-[10px] block tracking-tight">SALE</span>
                          </div>
                        )}
                        {cat.iconType === 'trending' && (
                          <div className="text-white font-black leading-tight drop-shadow-md">
                            <span className="text-[8px] sm:text-[9px] block tracking-tight text-cyan-200">TRENDING</span>
                            <span className="text-[8px] sm:text-[9px] block tracking-tight">PRODUCTS</span>
                          </div>
                        )}
                        {cat.iconType === 'staples' && (
                          <div className="text-white font-black leading-none drop-shadow-md">
                            <span className="text-[13px] sm:text-[16px] block">🥔</span>
                            <span className="text-[8px] sm:text-[9px] block tracking-tight text-amber-200 mt-0.5">STAPLES</span>
                          </div>
                        )}
                        {cat.iconType === 'exotics' && (
                          <div className="text-white font-black leading-none drop-shadow-md">
                            <span className="text-[13px] sm:text-[16px] block">🥑</span>
                            <span className="text-[8px] sm:text-[9px] block tracking-tight text-purple-200 mt-0.5">EXOTICS</span>
                          </div>
                        )}
                        {cat.iconType === 'contract' && (
                          <div className="text-white font-black leading-none drop-shadow-md">
                            <span className="text-[13px] sm:text-[16px] block">📋</span>
                            <span className="text-[8px] sm:text-[9px] block tracking-tight text-indigo-200 mt-0.5">B2B PO</span>
                          </div>
                        )}
                        {cat.iconType === 'greens' && (
                          <div className="text-white font-black leading-none drop-shadow-md">
                            <span className="text-[13px] sm:text-[16px] block">🥬</span>
                            <span className="text-[8px] sm:text-[9px] block tracking-tight text-emerald-200 mt-0.5">GREENS</span>
                          </div>
                        )}
                        {cat.iconType === 'cold-storage' && (
                          <div className="text-white font-black leading-none drop-shadow-md">
                            <span className="text-[13px] sm:text-[16px] block">📦</span>
                            <span className="text-[8px] sm:text-[9px] block tracking-tight text-amber-100 mt-0.5">25KG+</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── Label Beneath Circle ─── */}
                <span
                  className={cn(
                    "text-[11px] sm:text-xs font-semibold text-center transition-colors line-clamp-1 max-w-[76px] sm:max-w-[88px]",
                    isActive
                      ? "text-[#10B981] font-bold"
                      : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                  )}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
