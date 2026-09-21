'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Leaf, Zap, Apple, Sparkles, ShieldCheck, ShoppingBag, Package } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';

const SORT_OPTIONS = [
  { label: 'Most Popular', sort: 'rating', order: 'desc' },
  { label: 'Price: Low → High', sort: 'price', order: 'asc' },
  { label: 'Price: High → Low', sort: 'price', order: 'desc' },
  { label: 'Newest', sort: 'createdAt', order: 'desc' },
];

function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 bg-white dark:bg-[#0F1520] p-3.5 rounded-[2px] border border-slate-200/80 dark:border-white/[0.07]">
      <div className="aspect-square rounded-[2px] bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
      <div className="h-3 w-3/4 rounded-[2px] bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
      <div className="h-3 w-1/2 rounded-[2px] bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
      <div className="h-8 rounded-[2px] bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sort, setSort] = useState(SORT_OPTIONS[0]);
  const [filters, setFilters] = useState({ isOrganic: false, isFreshToday: false });
  const [page, setPage] = useState(1);

  const { data: category } = useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      try {
        const res = await api.get(`/categories/${slug}`);
        return res.data?.data;
      } catch {
        return null;
      }
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', slug, sort, filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        categorySlug: slug,
        sort: sort.sort,
        order: sort.order,
        page: String(page),
        limit: '24',
        ...(filters.isOrganic && { isOrganic: 'true' }),
        ...(filters.isFreshToday && { isFreshToday: 'true' }),
      });
      const res = await api.get(`/products?${params}`);
      return res.data ?? { data: [], pagination: { total: 0, totalPages: 1, page: 1, limit: 24 } };
    },
  });

  const categoryMeta: Record<string, { title: string; icon: any; desc: string; topGlow: string }> = {
    vegetables: { title: 'Fresh Vegetables', icon: Leaf, desc: 'Crisp, farm-fresh vegetables delivered fast to your doorstep', topGlow: 'from-emerald-500' },
    fruits: { title: 'Fresh Fruits', icon: Apple, desc: 'Sweet and juicy fruits naturally ripened and orchard-fresh', topGlow: 'from-rose-500' },
    'leafy-greens': { title: 'Leafy Greens', icon: Leaf, desc: 'Washed, crisp and nutrient-rich hydroponic greens', topGlow: 'from-teal-500' },
    organic: { title: 'Organic Produce', icon: ShieldCheck, desc: '100% certified organic, zero pesticide residue', topGlow: 'from-emerald-500' },
    'exotic-vegetables': { title: 'Exotic & Gourmet', icon: Sparkles, desc: 'Rare avocados, Romanesco, and artisanal hydroponics', topGlow: 'from-purple-500' },
    'herbs-spices': { title: 'Herbs & Spices', icon: Leaf, desc: 'Aromatic farm herbs and culinary staples', topGlow: 'from-amber-500' },
    'dry-fruits-nuts': { title: 'Dry Fruits & Nuts', icon: Package, desc: 'Premium grade almonds, walnuts, seeds, and raisins', topGlow: 'from-amber-500' },
  };

  const info = categoryMeta[slug] || {
    title: category?.name || 'Produce Catalog',
    icon: ShoppingBag,
    desc: 'Fresh produce dispatched straight from cold-chain hubs',
    topGlow: 'from-emerald-500',
  };

  const IconComponent = info.icon;

  return (
    <div className="space-y-6">
      {/* Category Editorial Banner */}
      <div className="bg-white dark:bg-[#0F1520] border-b border-slate-200/80 dark:border-white/[0.07] py-8 px-4 relative overflow-hidden shadow-xs">
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${info.topGlow} to-transparent`} />
        <div className="container-main">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[2px] bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/10 flex items-center justify-center text-emerald-600 dark:text-[#34D399] shrink-0 shadow-xs">
              <IconComponent className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8]">
                  {info.title}
                </h1>
                {data?.pagination?.total !== undefined && (
                  <span className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs px-2.5 py-0.5 rounded-[2px] font-mono">
                    {data.pagination.total} items
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#8B96A8] mt-1">{info.desc}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-main space-y-6">
        {/* Filters & Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0F1520] border border-slate-200/80 dark:border-white/[0.07] p-3 rounded-[2px] shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-[#8B96A8] mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Filters:</span>
            </div>
            <button
              onClick={() => setFilters(f => ({ ...f, isOrganic: !f.isOrganic }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-bold active:translate-y-0.5 transition-all cursor-pointer ${
                filters.isOrganic
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#8B96A8] hover:text-slate-900 dark:hover:text-[#E8EEF8]'
              }`}
            >
              <Leaf className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Organic Only</span>
            </button>
            <button
              onClick={() => setFilters(f => ({ ...f, isFreshToday: !f.isFreshToday }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-bold active:translate-y-0.5 transition-all cursor-pointer ${
                filters.isFreshToday
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#8B96A8] hover:text-slate-900 dark:hover:text-[#E8EEF8]'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              <span>Harvested Today</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-[#8B96A8] hidden sm:block">Sort by:</span>
            <select
              value={`${sort.sort}_${sort.order}`}
              onChange={e => {
                const opt = SORT_OPTIONS.find(o => `${o.sort}_${o.order}` === e.target.value);
                if (opt) setSort(opt);
              }}
              className="text-xs font-bold border border-slate-200 dark:border-white/10 rounded-[2px] px-3 py-1.5 bg-slate-100 dark:bg-[#161E2E] text-slate-900 dark:text-[#E8EEF8] focus:outline-hidden focus:border-emerald-500/50"
            >
              {SORT_OPTIONS.map(o => (
                <option key={`${o.sort}_${o.order}`} value={`${o.sort}_${o.order}`} className="bg-white dark:bg-[#0F1520] text-slate-900 dark:text-[#E8EEF8]">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 mb-8">
          {isLoading
            ? Array(12).fill(0).map((_, i) => <ProductSkeleton key={i} />)
            : data?.data?.map((product: any, i: number) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <ProductCard product={product} />
              </motion.div>
            ))
          }
        </div>

        {/* Empty state */}
        {!isLoading && (!data?.data || data.data.length === 0) && (
          <div className="text-center py-20 bg-white dark:bg-[#0F1520] rounded-[2px] border border-slate-200/80 dark:border-white/[0.07]">
            <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center text-slate-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">
              {filters.isOrganic || filters.isFreshToday
                ? 'No items match your filters'
                : 'No products in this category yet'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#8B96A8] mt-1 max-w-xs mx-auto">
              {filters.isOrganic || filters.isFreshToday
                ? 'Try removing some filters to see more produce.'
                : 'Products will appear here once the admin adds them to this category.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {data?.pagination?.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pb-8">
            {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-[2px] text-xs font-heading font-extrabold transition-all active:translate-y-0.5 cursor-pointer ${
                  p === page
                    ? 'bg-[#10B981] text-white dark:text-[#080C14] shadow-xs'
                    : 'bg-white dark:bg-[#0F1520] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-[#8B96A8] hover:text-slate-900 dark:hover:text-[#E8EEF8] hover:border-emerald-500/30'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
