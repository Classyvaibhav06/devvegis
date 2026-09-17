'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import api from '@/lib/api';

const DEFAULT_CATEGORIES = [
  { name: 'Daily Vegetables', slug: 'vegetables', icon: '🥦', description: 'Farm-fresh daily staples, potatoes, onions, tomatoes & greens' },
  { name: 'Sweet Fruits', slug: 'fruits', icon: '🍎', description: 'Orchard fresh apples, bananas, citrus, berries & seasonal delights' },
  { name: 'Leafy Greens', slug: 'leafy-greens', icon: '🌿', description: 'Hydroponic and farm-cut spinach, coriander, methi & mint' },
  { name: 'Herbs & Seasoning', slug: 'herbs-spices', icon: '🌱', description: 'Fresh culinary herbs, ginger, garlic & fragrant chillies' },
  { name: '100% Organic', slug: 'organic', icon: '🌾', description: 'Certified chemical-free, pesticide-free pure organic produce' },
  { name: 'Gourmet & Exotic', slug: 'exotic-vegetables', icon: '✨', description: 'Avocados, asparagus, zucchini, broccoli & international greens' },
  { name: 'Dry Fruits & Nuts', slug: 'dry-fruits-nuts', icon: '🥜', description: 'Premium almonds, cashews, walnuts, raisins & healthy seeds' },
  { name: 'Seasonal Mandi', slug: 'seasonal', icon: '🎋', description: 'Harvest fresh seasonal specialties direct from local mandis' },
];

export default function AllCategoriesPage() {
  const { data: dbCategories, isLoading } = useQuery({
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

  const categoriesList = dbCategories && dbCategories.length > 0 ? dbCategories : DEFAULT_CATEGORIES;

  return (
    <div className="container-main py-8 space-y-8">
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
                <div className="group h-full flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-[#0F1520] border border-slate-200/80 dark:border-white/[0.07] hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:shadow-xl dark:hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer relative overflow-hidden">
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div>
                    {/* Icon container */}
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-all duration-200 mb-4 shadow-xs">
                      <span>{icon}</span>
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
    </div>
  );
}
