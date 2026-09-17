'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';
import { getFallbackProducts } from '@/lib/fallbackData';

function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 bg-white dark:bg-[#0F1520] p-3.5 rounded-2xl border border-slate-100 dark:border-white/[0.07]">
      <div className="aspect-square rounded-xl bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
      <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
      <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
      <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
      <div className="h-8 rounded-xl bg-slate-100 dark:bg-[#161E2E] animate-pulse mt-1" />
    </div>
  );
}

export default function PopularProducts() {
  const [activeTab, setActiveTab] = useState('');
  const [dynamicTabs, setDynamicTabs] = useState<{ label: string; slug: string }[]>([
    { label: 'All', slug: '' },
  ]);

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          const catTabs = res.data.data.map((c: any) => ({
            label: c.name,
            slug: c.slug,
          }));
          setDynamicTabs([{ label: 'All', slug: '' }, ...catTabs]);
        }
      })
      .catch(() => {});
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['popular-products', activeTab],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          limit: '10',
          sort: 'rating',
          order: 'desc',
          ...(activeTab && { categorySlug: activeTab }),
        });
        const res = await api.get(`/products?${params}`);
        if (res.data?.data && res.data.data.length > 0) {
          return res.data.data;
        }
      } catch {
        // fallback
      }
      return getFallbackProducts(activeTab || undefined);
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <section className="space-y-5">
      {/* Header + Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg sm:text-xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8] tracking-tight">
          Popular Products
        </h2>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {dynamicTabs.map((tab) => (
            <button
              key={tab.slug}
              onClick={() => setActiveTab(tab.slug)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === tab.slug
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-[#080C14] shadow-sm'
                  : 'bg-white dark:bg-[#0F1520] border border-slate-200 dark:border-white/[0.07] text-slate-600 dark:text-[#8B96A8] hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-500/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {isLoading
          ? Array(10).fill(0).map((_, i) => <ProductSkeleton key={i} />)
          : data?.slice(0, 10).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))
        }
      </div>

      {/* View All Link */}
      <div className="flex justify-center pt-2">
        <Link
          href={activeTab ? `/categories/${activeTab}` : '/categories'}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/15 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-all"
        >
          View All Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
