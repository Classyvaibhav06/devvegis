'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronDown, ArrowUpRight, Flame, Sparkles, Percent, Tag, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WholesaleSubNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams?.get('category') || 'all';

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleCategoryClick = (cat: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (cat === 'all') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    router.push(`/wholesale?${params.toString()}`);
  };

  return (
    <div className="bg-slate-50 dark:bg-[#080C14] border-b border-slate-200 dark:border-white/[0.06] text-xs font-semibold select-none relative z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto scrollbar-hide py-2.5">
        <div className="flex items-center gap-6 sm:gap-7 shrink-0 text-slate-700 dark:text-slate-300">
          {/* New Arrivals */}
          <button
            onClick={() => handleCategoryClick('new-arrivals')}
            className={cn(
              "hover:text-[#10B981] transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1",
              activeCategory === 'new-arrivals' && "text-[#10B981] font-bold"
            )}
          >
            <span>New Arrivals</span>
          </button>

          {/* Trending Products */}
          <button
            onClick={() => handleCategoryClick('trending')}
            className={cn(
              "hover:text-[#10B981] transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1",
              activeCategory === 'trending' && "text-[#10B981] font-bold"
            )}
          >
            <span>Trending Products</span>
          </button>

          {/* Bulk Farm Crates */}
          <button
            onClick={() => handleCategoryClick('roots')}
            className={cn(
              "hover:text-[#10B981] transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1",
              activeCategory === 'roots' && "text-[#10B981] font-bold"
            )}
          >
            <span>Bulk Farm Crates</span>
          </button>

          {/* Shop by Collection Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('collection')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              onClick={() => setActiveDropdown(prev => prev === 'collection' ? null : 'collection')}
              aria-expanded={activeDropdown === 'collection'}
              aria-haspopup="true"
              aria-label="Toggle collection filter dropdown"
              className="flex items-center gap-1 hover:text-[#10B981] transition-colors whitespace-nowrap cursor-pointer py-1"
            >
              <span>Shop by Collection</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {activeDropdown === 'collection' && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-white dark:bg-[#111722] border border-slate-200 dark:border-white/10 rounded-[2px] shadow-xl py-2 z-50 animate-fade-up">
                <button
                  onClick={() => { handleCategoryClick('roots'); setActiveDropdown(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-xs font-medium"
                >
                  🧅 Mandi Roots (Onion, Potato)
                </button>
                <button
                  onClick={() => { handleCategoryClick('vine'); setActiveDropdown(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-xs font-medium"
                >
                  🍅 Vine Produce (Tomato, Capsicum)
                </button>
                <button
                  onClick={() => { handleCategoryClick('greens'); setActiveDropdown(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-xs font-medium"
                >
                  🥬 Hydroponics & Washed Greens
                </button>
                <button
                  onClick={() => { handleCategoryClick('exotics'); setActiveDropdown(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-xs font-medium"
                >
                  🥑 Gourmet Exotics & Imported
                </button>
              </div>
            )}
          </div>

          {/* On Sale */}
          <button
            onClick={() => handleCategoryClick('on-sale')}
            className={cn(
              "hover:text-rose-500 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold",
              activeCategory === 'on-sale' && "underline underline-offset-4"
            )}
          >
            <Percent className="w-3 h-3" />
            <span>On Sale</span>
          </button>

          {/* Shop by Price Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('price')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              onClick={() => setActiveDropdown(prev => prev === 'price' ? null : 'price')}
              aria-expanded={activeDropdown === 'price'}
              aria-haspopup="true"
              aria-label="Toggle price filter dropdown"
              className="flex items-center gap-1 hover:text-[#10B981] transition-colors whitespace-nowrap cursor-pointer py-1"
            >
              <span>Shop by Price</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {activeDropdown === 'price' && (
              <div className="absolute left-0 top-full mt-1 w-44 bg-white dark:bg-[#111722] border border-slate-200 dark:border-white/10 rounded-[2px] shadow-xl py-2 z-50 animate-fade-up">
                <button
                  onClick={() => { handleCategoryClick('under-30'); setActiveDropdown(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-medium"
                >
                  Under ₹30/kg Mandi
                </button>
                <button
                  onClick={() => { handleCategoryClick('under-60'); setActiveDropdown(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-medium"
                >
                  ₹30 - ₹60/kg Staples
                </button>
                <button
                  onClick={() => { handleCategoryClick('premium'); setActiveDropdown(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-medium"
                >
                  ₹100+/kg Premium & Exotics
                </button>
              </div>
            )}
          </div>

          {/* Shop by Industry Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('industry')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              onClick={() => setActiveDropdown(prev => prev === 'industry' ? null : 'industry')}
              aria-expanded={activeDropdown === 'industry'}
              aria-haspopup="true"
              aria-label="Toggle industry filter dropdown"
              className="flex items-center gap-1 hover:text-[#10B981] transition-colors whitespace-nowrap cursor-pointer py-1"
            >
              <span>Shop by Industry</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {activeDropdown === 'industry' && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-white dark:bg-[#111722] border border-slate-200 dark:border-white/10 rounded-[2px] shadow-xl py-2 z-50 animate-fade-up">
                <button
                  onClick={() => { handleCategoryClick('hotel'); setActiveDropdown(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-medium"
                >
                  🏨 4-Star & 5-Star Hotels
                </button>
                <button
                  onClick={() => { handleCategoryClick('cloud-kitchen'); setActiveDropdown(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-medium"
                >
                  🍳 Cloud Kitchens & QSRs
                </button>
                <button
                  onClick={() => { handleCategoryClick('catering'); setActiveDropdown(null); }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-medium"
                >
                  🎉 Banquets & Large Caterers
                </button>
              </div>
            )}
          </div>

          {/* Best Sellers */}
          <button
            onClick={() => handleCategoryClick('best-sellers')}
            className={cn(
              "hover:text-[#10B981] transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1",
              activeCategory === 'best-sellers' && "text-[#10B981] font-bold"
            )}
          >
            <span>Best Sellers</span>
          </button>
        </div>

        {/* Right shortcut to retail store */}
        <div className="hidden lg:flex items-center shrink-0 pl-6 border-l border-slate-200 dark:border-white/10">
          <Link
            href="/"
            className="flex items-center gap-1 text-[#10B981] hover:text-[#059669] font-bold tracking-tight transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Retail Store</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
