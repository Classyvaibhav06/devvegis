'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Zap, ShoppingBag } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';

export default function AllCategoriesPage() {
  const { data: dbCategories = [], isLoading: isCategoriesLoading } = useQuery({
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

  const { data: productsData = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['all-products-catalog'],
    queryFn: async () => {
      try {
        const res = await api.get('/products', { params: { limit: 50 } });
        return res.data?.data || [];
      } catch {
        return [];
      }
    },
  });

  const categoriesList = dbCategories;
  const productsList = Array.isArray(productsData) ? productsData : [];

  return (
    <div className="container-main py-8 space-y-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-emerald-100 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Farm-to-Doorstep Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight">
            Explore All Fresh Categories
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Handpicked farm produce sorted, graded, and delivered to your doorstep in 10–15 minutes from your nearest dark store hub.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-emerald-200">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" /> 10-15 Min Express Delivery
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" /> Zero Chemical Residue
            </span>
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Categories Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8]">
              Browse by Category
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#8B96A8]">
              Select a category to view specific farm-harvested collections
            </p>
          </div>
        </div>

        {isCategoriesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 rounded-3xl bg-slate-100 dark:bg-[#0F1520] animate-pulse border border-slate-200/80 dark:border-white/[0.07]" />
            ))}
          </div>
        ) : categoriesList.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#0F1520] rounded-3xl border border-slate-200/80 dark:border-white/[0.07] p-8 max-w-lg mx-auto">
            <p className="text-4xl mb-3">🧺</p>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-[#E8EEF8]">
              Catalog is Being Prepared
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#8B96A8] mt-2 leading-relaxed">
              Fresh produce categories and harvests will appear here as soon as they are added by the store administrator.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {categoriesList.map((cat: any, idx: number) => {
              const icon = cat.icon || '🥦';
              const desc = cat.description || 'Fresh harvested produce ready for immediate dispatch';
              const name = cat.name;
              const slug = cat.slug;

              return (
                <motion.div
                  key={slug || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Link href={`/categories/${slug}`}>
                    <div className="group h-full flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-[#0F1520] border border-slate-200/80 dark:border-white/[0.07] hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:shadow-xl dark:hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer relative overflow-hidden">
                      {/* Top accent bar */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div>
                        {/* Prominent Category Image */}
                        <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-[#161E2E] border border-slate-200/60 dark:border-white/10 shadow-xs">
                          {cat.image ? (
                            <Image
                              src={cat.image}
                              alt={name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 text-5xl group-hover:scale-110 transition-transform duration-200">
                              <span>{icon}</span>
                            </div>
                          )}
                          {cat._count?.products != null && (
                            <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white shadow-xs">
                              {cat._count.products} {cat._count.products === 1 ? 'item' : 'items'}
                            </div>
                          )}
                        </div>

                        <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-[#E8EEF8] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-[#8B96A8] line-clamp-2 mt-1.5 leading-relaxed">
                          {desc}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <span>Shop Collection</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* All Products Catalog Section */}
      <section className="pt-6 border-t border-slate-200/80 dark:border-white/[0.07] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Full Storefront Produce</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8]">
              All Farm Fresh Produce
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#8B96A8] mt-1">
              Browse our entire catalog of chemical-tested vegetables, fruits, and drinks
            </p>
          </div>
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-slate-100 dark:bg-[#0F1520] animate-pulse border border-slate-200/80 dark:border-white/[0.07]" />
            ))}
          </div>
        ) : productsList.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#0F1520] rounded-2xl border border-slate-200/80 dark:border-white/[0.07] p-6">
            <p className="text-sm text-slate-500">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {productsList.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
