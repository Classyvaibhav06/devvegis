'use client';

import Link from 'next/link';

const categories = [
  {
    name: 'Daily Vegetables',
    sub: 'Farm Harvested',
    slug: 'vegetables',
    icon: '',
  },
  {
    name: 'Sweet Fruits',
    sub: 'Orchard Fresh',
    slug: 'fruits',
    icon: '',
  },
  {
    name: 'Leafy Greens',
    sub: 'Washed & Crisp',
    slug: 'leafy-greens',
    icon: '',
  },
  {
    name: 'Herbs & Seasoning',
    sub: 'Fresh Aroma',
    slug: 'herbs-spices',
    icon: '',
  },
  {
    name: '100% Organic',
    sub: 'Zero Pesticides',
    slug: 'organic',
    icon: '',
  },
  {
    name: 'Dry Fruits & Nuts',
    sub: 'Premium Grade',
    slug: 'dry-fruits-nuts',
    icon: '',
  },
  {
    name: 'Seasonal Mandi',
    sub: 'Peak Nutrition',
    slug: 'seasonal',
    icon: '',
  },
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {categories.map((cat) => (
        <Link key={cat.slug} href={`/categories/${cat.slug}`}>
          <div className="flex flex-col items-center text-center p-3.5 rounded-[4px] bg-white dark:bg-[#0F1520] border border-slate-200/80 dark:border-white/[0.07] hover:border-emerald-500/40 group cursor-pointer h-full transition-all duration-200 relative overflow-hidden shadow-xs hover:shadow-md dark:shadow-lg dark:hover:shadow-emerald-500/5">
            {/* Top subtle line on hover */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Icon Container */}
            <div className="w-14 h-14 rounded-[4px] bg-slate-100 dark:bg-[#161E2E] border border-slate-200/70 dark:border-white/[0.08] group-hover:border-emerald-500/40 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-all duration-200 mb-2.5 shadow-xs">
              <span className="text-sm font-heading font-bold text-slate-500 dark:text-[#8B96A8] group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{cat.name.charAt(0)}</span>
            </div>
            
            <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-[#E8EEF8] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight line-clamp-1">
              {cat.name}
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-[#8B96A8] line-clamp-1 mt-0.5">
              {cat.sub}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
