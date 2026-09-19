'use client';

import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  endpoint: string;
  viewAllHref?: string;
  params?: Record<string, string>;
  isGrid?: boolean;
}

function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 w-44 sm:w-52 shrink-0 bg-white dark:bg-[#0F1520] p-3.5 rounded-[2px] border border-slate-200/80 dark:border-white/[0.07]">
      <div className="aspect-square rounded-[2px] bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
      <div className="h-3 w-1/3 rounded-[2px] bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
      <div className="h-4 w-3/4 rounded-[2px] bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
      <div className="h-7 rounded-[2px] bg-slate-100 dark:bg-[#161E2E] animate-pulse mt-2" />
    </div>
  );
}

export default function ProductSection({
  title,
  subtitle,
  endpoint,
  viewAllHref,
  params = {},
  isGrid = false,
}: ProductSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: [endpoint, params],
    queryFn: async () => {
      try {
        const queryString = new URLSearchParams({ limit: '12', ...params }).toString();
        const res = await api.get(`${endpoint}?${queryString}`);
        if (res.data?.data && res.data.data.length > 0) {
          return res.data.data;
        }
      } catch {
        // network error
      }
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'right' ? 340 : -340, behavior: 'smooth' });
    }
  };

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8] tracking-tight leading-snug">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-[#8B96A8] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Scroll buttons - desktop */}
          {!isGrid && (
            <div className="hidden md:flex gap-1.5">
              <button
                onClick={() => scroll('left')}
                className="w-8 h-8 bg-white dark:bg-[#0F1520] border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 rounded-[2px] flex items-center justify-center text-slate-600 dark:text-[#8B96A8] hover:text-emerald-600 dark:hover:text-emerald-400 transition-all active:translate-y-0.5 shadow-xs"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-8 h-8 bg-white dark:bg-[#0F1520] border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 rounded-[2px] flex items-center justify-center text-slate-600 dark:text-[#8B96A8] hover:text-emerald-600 dark:hover:text-emerald-400 transition-all active:translate-y-0.5 shadow-xs"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 group"
            >
              <span>See All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>

      {/* Product Display: Horizontal Carousel or Responsive Grid */}
      {isGrid ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {isLoading
            ? Array(6).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            : data?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-3.5 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0"
        >
          {isLoading
            ? Array(6).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            : data?.map((product: any) => (
                <div key={product.id} className="w-44 sm:w-52 shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
          {!isLoading && data?.length === 0 && (
            <p className="text-slate-400 dark:text-[#8B96A8] text-xs py-8">No fresh items in this harvest right now.</p>
          )}
        </div>
      )}
    </section>
  );
}
