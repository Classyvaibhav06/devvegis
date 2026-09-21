'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Plus, Minus, Star, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency, formatProductWeight } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';


const FILTER_TABS = [
  { label: 'Featured', filter: 'featured' },
  { label: 'Popular', filter: 'popular' },
  { label: 'New Added', filter: 'new' },
];

function DealCard({ product }: { product: any }) {
  const { items, addItem, updateQuantity } = useCartStore();
  const displayUnit = formatProductWeight(product);
  const cartItem = items.find(i => i.id === product.id);
  const quantity = cartItem?.quantity || 0;
  const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500&q=80';
  const finalPrice = product.discountPercentage
    ? Math.round(product.price * (1 - product.discountPercentage / 100))
    : product.price;

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: imageUrl,
      unit: displayUnit,
    });
    toast.success(`${product.name} added!`, { duration: 1500 });
  };

  return (
    <div className="bg-white dark:bg-[#0F1520] rounded-[4px] border border-slate-100 dark:border-white/[0.07] p-3.5 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all shadow-xs dark:shadow-md hover:shadow-md dark:hover:shadow-lg group relative">
      {/* Discount Badge */}
      {product.discountPercentage && product.discountPercentage > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-[2px]">
          Save {Math.round(product.discountPercentage)}%
        </div>
      )}

      {/* Image with Weight Tag */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square rounded-[4px] overflow-hidden bg-slate-50 dark:bg-[#161E2E] mb-3">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
          {displayUnit && (
            <div className="absolute bottom-1.5 left-1.5 bg-white/90 dark:bg-[#080C14]/85 backdrop-blur-sm text-slate-800 dark:text-[#E8EEF8] text-[10px] font-bold px-2 py-0.5 rounded-[2px] border border-slate-200/80 dark:border-white/10 font-mono">
              {displayUnit}
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <span className="text-[10px] font-bold text-slate-400 dark:text-[#4E5A6B] uppercase tracking-wider">
        {product.isOrganic ? 'Certified Organic' : 'Farm Fresh'}
      </span>
      <Link href={`/products/${product.slug}`}>
        <h4 className="font-bold text-sm text-slate-900 dark:text-[#E8EEF8] leading-snug line-clamp-2 mt-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {product.name}
        </h4>
      </Link>

      {/* Rating */}
      {product.rating && (
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-200 text-slate-200 dark:fill-[#1C2637] dark:text-[#1C2637]'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-[#4E5A6B]">({product.reviewCount || 0})</span>
        </div>
      )}

      {/* Price + Add to Cart */}
      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100 dark:border-white/[0.05]">
        <div>
          <span className="font-heading font-extrabold text-base text-emerald-600 dark:text-emerald-400">
            {formatCurrency(finalPrice)}
          </span>
          {product.comparePrice && product.comparePrice > finalPrice && (
            <span className="text-xs text-slate-400 dark:text-[#4E5A6B] line-through ml-1.5">
              {formatCurrency(product.comparePrice)}
            </span>
          )}
        </div>

        {quantity === 0 ? (
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-[#080C14] rounded-[4px] text-xs font-bold border border-emerald-200 dark:border-emerald-500/30 transition-all active:scale-95 active:translate-y-[1px]"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-[#080C14] rounded-[4px] px-2 py-1 text-xs font-extrabold">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="w-5 h-5 flex items-center justify-center hover:bg-black/20 rounded-[2px] transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="min-w-[14px] text-center">{quantity}</span>
            <button
              onClick={handleAdd}
              className="w-5 h-5 flex items-center justify-center hover:bg-black/20 rounded-[2px] transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DailyBestSells() {
  const [activeFilter, setActiveFilter] = useState('featured');

  const { data, isLoading } = useQuery({
    queryKey: ['daily-best-sells', activeFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          limit: '4',
          sort: activeFilter === 'new' ? 'createdAt' : 'rating',
          order: 'desc',
          ...(activeFilter === 'featured' && { isFeatured: 'true' }),
        });
        const res = await api.get(`/products?${params}`);
        if (res.data?.data && res.data.data.length > 0) {
          return res.data.data;
        }
      } catch {
        // network or server error
      }
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8] tracking-tight">
          Daily Best Sells
        </h2>
        <div className="flex items-center gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.filter}
              onClick={() => setActiveFilter(tab.filter)}
              className={`px-3 py-1 rounded-[4px] text-xs font-bold transition-all ${
                activeFilter === tab.filter
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30'
                  : 'text-slate-500 dark:text-[#8B96A8] hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content: Left Banner + Right Products */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left Promotional Banner */}
        <div className="lg:col-span-1 relative rounded-[4px] overflow-hidden bg-gradient-to-b from-emerald-600 to-green-800 dark:from-emerald-700 dark:to-green-900 min-h-[280px] lg:min-h-0 shadow-lg">
          <Image
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80"
            alt="Bring nature into your home"
            fill
            className="object-cover opacity-40 mix-blend-overlay"
            sizes="(max-width: 1024px) 100vw, 20vw"
          />
          <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
            <div>
              <h3 className="text-white font-heading font-extrabold text-xl sm:text-2xl leading-snug">
                Bring nature<br />into your<br />home.
              </h3>
            </div>
            <Link
              href="/categories/organic"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold text-xs px-4 py-2.5 rounded-[4px] hover:bg-emerald-50 transition-colors w-fit shadow-md"
            >
              Shop Now
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Product Cards */}
        <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {isLoading
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#0F1520] rounded-[4px] border border-slate-100 dark:border-white/[0.07] p-3.5">
                  <div className="aspect-square rounded-[4px] bg-slate-100 dark:bg-[#161E2E] animate-pulse mb-3" />
                  <div className="h-3 w-2/3 rounded-[2px] bg-slate-100 dark:bg-[#161E2E] animate-pulse mb-2" />
                  <div className="h-4 w-full rounded-[2px] bg-slate-100 dark:bg-[#161E2E] animate-pulse mb-2" />
                  <div className="h-8 rounded-[4px] bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
                </div>
              ))
            : data?.map((product: any) => (
                <DealCard key={product.id} product={product} />
              ))
          }
        </div>
      </div>
    </section>
  );
}
