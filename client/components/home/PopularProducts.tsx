'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';


function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 bg-white dark:bg-[#0F1520] p-3.5 rounded-[4px] border border-slate-100 dark:border-white/[0.07]">
      <div className="aspect-square rounded-[4px] bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
      <div className="h-3 w-1/3 rounded-[2px] bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
      <div className="h-4 w-3/4 rounded-[2px] bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
      <div className="h-3 w-1/2 rounded-[2px] bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
      <div className="h-8 rounded-[4px] bg-slate-100 dark:bg-[#161E2E] animate-pulse mt-1" />
    </div>
  );
}

export default function PopularProducts() {
  const [activeTab, setActiveTab] = useState('');

  const { data: dbCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await api.get('/categories');
        return res.data?.data || [];
      } catch {
        return [];
      }
    },
  });

  const dynamicTabs = [
    { label: 'All', slug: '' },
    ...dbCategories.map((c: any) => ({
      label: c.name,
      slug: c.slug,
    })),
  ];

  useEffect(() => {
    if (activeTab && !dbCategories.some((c: any) => c.slug === activeTab)) {
      setActiveTab('');
    }
  }, [dbCategories, activeTab]);

  const { data = [], isLoading } = useQuery({
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
        if (res.data?.data) {
          return res.data.data;
        }
      } catch {
        // network or auth error
      }
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <section className="space-y-3 sm:space-y-5">
      {/* Header + Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
        <h2 className="text-base sm:text-xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8] tracking-tight">
          Popular Products
        </h2>
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
          {dynamicTabs.map((tab) => (
            <button
              key={tab.slug}
              onClick={() => setActiveTab(tab.slug)}
              className={`shrink-0 px-3 sm:px-4 py-1 sm:py-1.5 rounded-[4px] text-xs font-bold transition-all ${
                activeTab === tab.slug
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-[#080C14] shadow-xs'
                  : 'bg-white dark:bg-[#0F1520] border border-slate-200 dark:border-white/[0.07] text-slate-600 dark:text-[#8B96A8] hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-500/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {Array(10).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : data.length === 0 ? (
        <div className="card p-12 text-center text-gray-500 max-w-lg mx-auto">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Catalog is being prepared</p>
          <p className="text-xs text-gray-400 mt-1">Fresh produce and harvests added by the store administrator will appear here live.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {data.slice(0, 10).map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* View All Link */}
      {data.length > 0 && (
        <div className="flex justify-center pt-2">
          <Link
            href={activeTab ? `/categories/${activeTab}` : '/categories'}
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-[4px] bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/15 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-all w-full sm:w-auto text-center"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
