'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { Heart, Star, Leaf, Zap, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';
import { cn, formatCurrency, getDiscountedPrice, resolveImageUrl } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  discountPercentage?: number;
  unit: string;
  images: { url: string; alt?: string }[];
  isOrganic?: boolean;
  isFreshToday?: boolean;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  inventory?: { availableStock: number };
}

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
  showWishlist?: boolean;
}

export default function ProductCard({ product, variant = 'default', showWishlist = true }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);
  const { items, addItem, updateQuantity } = useCartStore();

  const cartItem = items.find(i => i.id === product.id);
  const quantity = cartItem?.quantity || 0;
  const imageUrl = resolveImageUrl(product.images?.[0]?.url);
  const inStock = !product.inventory || product.inventory.availableStock > 0;
  const finalPrice = product.discountPercentage
    ? getDiscountedPrice(product.price, product.discountPercentage)
    : product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;

    addItem({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image: imageUrl,
      unit: product.unit,
    });

    setAddedAnim(true);
    toast.success(`${product.name} added to cart`, {
      icon: '🌿',
      duration: 1800,
    });
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast(isWishlisted ? 'Removed from saved items' : '❤️ Saved to wishlist', { duration: 1500 });
  };

  if (variant === 'horizontal') {
    return (
      <Link href={`/products/${product.slug}`}>
        <div className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-[#0F1520] rounded-2xl border border-slate-200/80 dark:border-white/[0.07] hover:border-emerald-500/40 transition-all duration-200 shadow-xs dark:shadow-md">
          <div className="relative w-18 h-18 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-[#161E2E] border border-slate-200/80 dark:border-white/10">
            <Image src={imageUrl} alt={product.name} fill className="object-cover" sizes="72px" />
            <div className="absolute bottom-1 left-1 bg-white/90 dark:bg-[#080C14]/85 text-slate-800 dark:text-[#E8EEF8] text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-slate-200/80 dark:border-white/10">
              {product.unit}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Farm Direct</span>
            <p className="font-heading font-bold text-slate-900 dark:text-[#E8EEF8] text-sm truncate">{product.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-heading font-extrabold text-sm">{formatCurrency(finalPrice)}</span>
              {product.comparePrice && product.comparePrice > finalPrice && (
                <span className="text-[11px] text-slate-400 dark:text-[#4E5A6B] line-through">{formatCurrency(product.comparePrice)}</span>
              )}
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:bg-emerald-500/10 dark:hover:bg-emerald-500 dark:text-emerald-400 dark:hover:text-[#080C14] rounded-xl text-xs font-extrabold transition-all active:scale-95 border border-emerald-200 dark:border-emerald-500/30"
          >
            + ADD
          </button>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0F1520] rounded-2xl border border-slate-200/80 dark:border-white/[0.07] hover:border-emerald-500/40 p-3.5 transition-all duration-200 flex flex-col justify-between group h-full shadow-xs hover:shadow-md dark:shadow-lg dark:hover:shadow-emerald-500/5 relative overflow-hidden">
      {/* Subtle top highlight on hover */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <Link href={`/products/${product.slug}`} className="flex-1 flex flex-col">
        {/* Image Container with Exact Weight Badge and Badges */}
        <div className="w-full aspect-square rounded-xl bg-slate-50 dark:bg-[#161E2E] border border-slate-100 dark:border-white/[0.06] relative overflow-hidden mb-3">
          {/* Zoom Image */}
          <div className="w-full h-full relative overflow-hidden">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>

          {/* Badges Overlays */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.isOrganic && (
              <div className="bg-emerald-600 dark:bg-emerald-500/90 text-white dark:text-[#080C14] backdrop-blur-md text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <Leaf className="w-2.5 h-2.5 fill-current" />
                <span>Organic</span>
              </div>
            )}
            {product.isFreshToday && !product.isOrganic && (
              <div className="bg-amber-500 text-white dark:text-[#080C14] text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <Zap className="w-2.5 h-2.5 fill-current" />
                <span>Fresh Dawn</span>
              </div>
            )}
          </div>

          {/* Rating Pill Top-Right */}
          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            {product.rating && (
              <div className="bg-white/90 dark:bg-[#080C14]/85 text-slate-800 dark:text-[#E8EEF8] backdrop-blur-md text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs border border-slate-200/80 dark:border-white/10">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}

            {showWishlist && (
              <button
                onClick={handleWishlist}
                className="w-6 h-6 bg-white/90 dark:bg-[#080C14]/85 rounded-full flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 border border-slate-200/80 dark:border-white/10"
                title="Save for later"
              >
                <Heart className={cn('w-3 h-3 transition-colors', isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400 dark:text-[#8B96A8]')} />
              </button>
            )}
          </div>

          {/* EXACT GRAMS / PIECES UNIT BADGE */}
          <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-[#080C14]/85 backdrop-blur-md text-slate-800 dark:text-[#E8EEF8] text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs border border-slate-200/80 dark:border-white/10 flex items-center gap-1 z-10 font-mono">
            <span>{product.unit || '500g'}</span>
          </div>

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-slate-900/60 dark:bg-[#080C14]/80 backdrop-blur-xs flex items-center justify-center z-20">
              <span className="text-white font-bold text-xs bg-slate-950/90 dark:bg-[#161E2E] px-3 py-1 rounded-full border border-white/20">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Title & Subtitle */}
        <div className="space-y-0.5 flex-1">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            {product.isOrganic ? '100% Certified Farm' : 'Daily Dawn Harvest'}
          </span>
          <h3 className="font-heading font-bold text-slate-900 dark:text-[#E8EEF8] text-sm leading-snug line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {product.name}
          </h3>
        </div>
      </Link>

      {/* Bottom Area: Pricing & Tactile ADD/Stepper Button */}
      <div className="pt-3 mt-2 border-t border-slate-100 dark:border-white/[0.07] flex items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-extrabold text-base sm:text-lg text-emerald-600 dark:text-emerald-400">
              {formatCurrency(finalPrice)}
            </span>
            {product.comparePrice && product.comparePrice > finalPrice && (
              <span className="text-xs text-slate-400 dark:text-[#4E5A6B] line-through">
                {formatCurrency(product.comparePrice)}
              </span>
            )}
          </div>
          {product.discountPercentage && product.discountPercentage > 0 ? (
            <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.5 rounded">
              Save {Math.round(product.discountPercentage)}%
            </span>
          ) : (
            <span className="text-[10px] font-medium text-slate-400 dark:text-[#8B96A8]">
              {product.unit}
            </span>
          )}
        </div>

        {/* Tactile Stepper / ADD Button */}
        <div className="shrink-0">
          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <button
                key="add"
                onClick={handleAddToCart}
                disabled={!inStock}
                className={cn(
                  'px-3 sm:px-4 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:bg-emerald-500/10 dark:hover:bg-emerald-500 dark:text-emerald-400 dark:hover:text-[#080C14] border border-emerald-300 dark:border-emerald-500/35 hover:border-emerald-600 dark:hover:border-emerald-500 rounded-xl text-xs font-extrabold tracking-wider transition-all duration-150 active:scale-95 flex items-center gap-1 shadow-xs dark:shadow-[0_0_12px_rgba(16,185,129,0.15)]',
                  !inStock && 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-[#4E5A6B] hover:bg-transparent hover:text-slate-400 cursor-not-allowed shadow-none'
                )}
              >
                <span>ADD</span>
                <Plus className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div
                key="stepper"
                className="flex items-center bg-emerald-600 dark:bg-gradient-to-r dark:from-[#10B981] dark:to-[#059669] text-white dark:text-[#080C14] rounded-xl px-2 py-0.5 text-xs font-extrabold gap-2 shadow-md shadow-emerald-500/25"
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateQuantity(product.id, quantity - 1);
                  }}
                  className="w-5 h-5 flex items-center justify-center hover:bg-black/20 rounded-lg transition-colors active:scale-90"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-0.5 text-xs font-extrabold min-w-[14px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: finalPrice,
                      image: imageUrl,
                      unit: product.unit,
                    });
                  }}
                  className="w-5 h-5 flex items-center justify-center hover:bg-black/20 rounded-lg transition-colors active:scale-90"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
