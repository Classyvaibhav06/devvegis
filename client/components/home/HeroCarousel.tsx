'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Mail, Clock, Leaf, ShieldCheck, Truck, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function HeroBanner() {
  const [email, setEmail] = useState('');

  return (
    <section className="relative rounded-3xl overflow-hidden min-h-[340px] sm:min-h-[400px]">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80"
        alt="Fresh grocery background"
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/20 dark:from-[#080C14]/95 dark:via-[#080C14]/80 dark:to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8] leading-[1.1] tracking-tight">
          Farm-Fresh Produce.<br />
          Delivered in<br />
          <span className="text-emerald-600 dark:text-emerald-400">12 Minutes.</span>
        </h1>
        <p className="text-slate-600 dark:text-[#8B96A8] text-sm sm:text-base mt-4 leading-relaxed max-w-md">
          DevVegis connects certified organic farm clusters directly to your kitchen. Crisp vegetables, sweet fruits, and hydroponic greens harvested at dawn.
        </p>

        {/* Newsletter Input */}
        <div className="flex items-center mt-6 max-w-md shadow-lg rounded-xl overflow-hidden">
          <div className="flex-1 flex items-center bg-white dark:bg-[#161E2E] px-4 py-3.5 gap-2.5">
            <Mail className="w-5 h-5 text-slate-400 dark:text-[#4E5A6B] shrink-0" />
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent text-sm text-slate-900 dark:text-[#E8EEF8] placeholder-slate-400 dark:placeholder-[#4E5A6B] outline-none w-full"
            />
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-[#080C14] px-6 py-3.5 text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 shrink-0">
            Subscribe 🌿
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Featured Categories — dynamic from /api/v1/categories ───
export function FeaturedCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/categories`)
      .then(r => r.json())
      .then(d => setCategories(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fallback palette for categories without a set color
  const palette = [
    { bg: 'bg-green-100 dark:bg-green-900/40', border: 'border-green-200 dark:border-green-700/40' },
    { bg: 'bg-red-100 dark:bg-red-900/40', border: 'border-red-200 dark:border-red-700/40' },
    { bg: 'bg-teal-100 dark:bg-teal-900/40', border: 'border-teal-200 dark:border-teal-700/40' },
    { bg: 'bg-lime-100 dark:bg-lime-900/40', border: 'border-lime-200 dark:border-lime-700/40' },
    { bg: 'bg-emerald-100 dark:bg-emerald-900/40', border: 'border-emerald-200 dark:border-emerald-700/40' },
    { bg: 'bg-purple-100 dark:bg-purple-900/40', border: 'border-purple-200 dark:border-purple-700/40' },
    { bg: 'bg-amber-100 dark:bg-amber-900/40', border: 'border-amber-200 dark:border-amber-700/40' },
    { bg: 'bg-orange-100 dark:bg-orange-900/40', border: 'border-orange-200 dark:border-orange-700/40' },
  ];

  if (loading) {
    return (
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8] tracking-tight">Featured Categories</h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8] tracking-tight">
          Featured Categories
        </h2>
        <div className="flex items-center gap-3">
          <Link
            href="/categories"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1"
          >
            All Categories
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
        {categories.map((cat, i) => {
          const p = palette[i % palette.length];
          return (
            <Link key={cat.id} href={`/categories/${cat.slug}`} className="group">
              <div className="flex flex-col items-center text-center">
                {cat.image ? (
                  <div className={`w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-full overflow-hidden border-2 ${p.border} group-hover:border-emerald-500 dark:group-hover:border-emerald-400 transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl shadow-sm relative`}>
                    <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="96px" />
                  </div>
                ) : (
                  <div className={`w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-full ${p.bg} border-2 ${p.border} group-hover:border-emerald-500 dark:group-hover:border-emerald-400 flex items-center justify-center text-[28px] sm:text-[36px] transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl shadow-sm`}>
                    {cat.icon || '📦'}
                  </div>
                )}
                <h4 className="font-bold text-[11px] sm:text-xs text-slate-800 dark:text-[#E8EEF8] mt-2 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {cat.name}
                </h4>
                {cat._count?.products != null && (
                  <span className="text-[10px] text-slate-400 dark:text-[#4E5A6B] mt-0.5">
                    {cat._count.products} items
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ─── Three Promotional Banners — dynamic from /api/v1/banners ───

const FALLBACK_BANNERS = [
  {
    title: "Onions You'll Love at First Slice",
    subtitle: 'Everyday Essentials',
    ctaText: 'Shop Now',
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&q=80',
    linkUrl: '/categories/vegetables',
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30',
    textColor: 'text-amber-900 dark:text-amber-100',
    subtitleColor: 'text-amber-700 dark:text-amber-400',
  },
  {
    title: 'Quick, Fresh, and Good for You',
    subtitle: 'Farm Fresh in 12 Mins',
    ctaText: 'Shop Now',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=80',
    linkUrl: '/categories/fruits',
    bg: 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30',
    textColor: 'text-emerald-900 dark:text-emerald-100',
    subtitleColor: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    title: 'The Best Organic Products Online',
    subtitle: '100% Certified Organic',
    ctaText: 'Shop Now',
    imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80',
    linkUrl: '/categories/organic',
    bg: 'bg-gradient-to-br from-teal-50 to-green-100 dark:from-teal-950/50 dark:to-green-900/30',
    textColor: 'text-teal-900 dark:text-teal-100',
    subtitleColor: 'text-teal-700 dark:text-teal-400',
  },
];

const BANNER_BG_PALETTE = [
  { bg: 'bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30', textColor: 'text-amber-900 dark:text-amber-100', subtitleColor: 'text-amber-700 dark:text-amber-400' },
  { bg: 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30', textColor: 'text-emerald-900 dark:text-emerald-100', subtitleColor: 'text-emerald-700 dark:text-emerald-400' },
  { bg: 'bg-gradient-to-br from-teal-50 to-green-100 dark:from-teal-950/50 dark:to-green-900/30', textColor: 'text-teal-900 dark:text-teal-100', subtitleColor: 'text-teal-700 dark:text-teal-400' },
];

export function PromoBanners() {
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API}/banners?type=OFFER&isActive=true&limit=3`)
      .then(r => r.json())
      .then(d => {
        if (d.data && d.data.length > 0) setBanners(d.data);
        else setBanners(FALLBACK_BANNERS as any);
      })
      .catch(() => setBanners(FALLBACK_BANNERS as any));
  }, []);

  const displayBanners = banners.length > 0 ? banners : FALLBACK_BANNERS;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {displayBanners.slice(0, 3).map((b: any, i) => {
        const palette = BANNER_BG_PALETTE[i % BANNER_BG_PALETTE.length];
        const bg = b.bg || palette.bg;
        const textColor = b.textColor || palette.textColor;
        const subtitleColor = b.subtitleColor || palette.subtitleColor;
        return (
          <Link key={b.id || i} href={b.linkUrl || b.href || '/'} className="group">
            <div className={`relative rounded-2xl overflow-hidden ${bg} border border-slate-200/60 dark:border-white/[0.07] p-5 sm:p-6 min-h-[200px] flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300`}>
              {/* Background image (subtle) */}
              <div className="absolute right-0 bottom-0 w-36 h-36 sm:w-44 sm:h-44 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500">
                <Image
                  src={b.imageUrl || b.image}
                  alt={b.title}
                  fill
                  className="object-cover rounded-tl-[40px]"
                  sizes="200px"
                />
              </div>

              <div className="relative z-10 max-w-[60%]">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${subtitleColor}`}>
                  {b.subtitle}
                </span>
                <h3 className={`font-heading font-extrabold text-base sm:text-lg leading-snug mt-1.5 ${textColor}`}>
                  {b.title}
                </h3>
              </div>

              <div className="relative z-10 mt-4">
                <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold group-hover:gap-2.5 transition-all">
                  {b.ctaText || b.cta || 'Shop Now'} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─── Trust Strip ───
export function TrustStrip() {
  const items = [
    { icon: Clock, label: '12-Min Express', desc: 'Cold-chain dispatch', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
    { icon: Leaf, label: '100% Farm Direct', desc: 'Harvested at 4:30 AM', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/15' },
    { icon: ShieldCheck, label: 'Zero Chemicals', desc: 'Lab tested organic', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-500/15' },
    { icon: Truck, label: 'Free Delivery', desc: 'Above ₹199', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/15' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-3 bg-white dark:bg-[#0F1520] rounded-2xl border border-slate-200/80 dark:border-white/[0.07] px-4 py-3.5 shadow-sm hover:shadow-md dark:shadow-md transition-shadow"
        >
          <div className={`w-11 h-11 rounded-full ${item.bg} flex items-center justify-center shrink-0`}>
            <item.icon className={`w-5 h-5 ${item.color}`} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-[#E8EEF8] truncate">
              {item.label}
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-[#8B96A8] truncate">
              {item.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
