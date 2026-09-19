'use client';

import Image from 'next/image';
import Link from 'next/link';
import { History, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function BuyAgainShelf() {
  const { items, addItem, updateQuantity } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Fetch real past orders if user is authenticated, else fallback to real products from API
  const { data: staples = [] } = useQuery({
    queryKey: ['buy-again-staples', isAuthenticated],
    queryFn: async () => {
      if (isAuthenticated) {
        try {
          const res = await api.get('/orders?limit=3');
          const orders = res.data.data || [];
          const extracted: any[] = [];
          const seen = new Set<string>();

          for (const order of orders) {
            const daysAgo = Math.max(1, Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
            for (const item of order.items || []) {
              if (item.product && !seen.has(item.productId)) {
                seen.add(item.productId);
                extracted.push({
                  id: item.productId,
                  name: item.product.name,
                  price: item.price,
                  unit: item.product.unit || '500g',
                  subtitle: `Ordered ${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`,
                  image: item.product.images?.[0]?.url || '',
                });
              }
            }
          }
          if (extracted.length > 0) return extracted.slice(0, 4);
        } catch {
          // ignore error and fallback
        }
      }

      // If no past orders or guest, fetch real fresh produce from API
      try {
        const res = await api.get('/products?limit=4&sort=popular');
        const prods = res.data?.data || [];
        return prods.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          unit: p.unit || '500g',
          subtitle: 'Daily Fresh Pick',
          image: p.images?.[0]?.url || '',
        }));
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleAdd = (item: { id: string; name: string; price: number; unit: string; image: string }) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      unit: item.unit,
      image: item.image,
    });
    toast.success(`${item.name} added to cart`);
  };

  if (!staples || staples.length === 0) {
    return null;
  }

  return (
    <section className="bg-white dark:bg-[#0F1520] p-5 sm:p-6 rounded-[4px] border border-slate-200/80 dark:border-white/[0.07] hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden shadow-xs dark:shadow-xl">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[2px] bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <History className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8] leading-tight">
              {isAuthenticated ? 'Quick Reorder: Frequent Staples' : 'Daily Harvest Essentials'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#8B96A8]">
              Restock your kitchen with regular dawn essentials in 1 tap
            </p>
          </div>
        </div>

        <Link
          href={isAuthenticated ? "/orders" : "/categories/vegetables"}
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 group self-start sm:self-auto"
        >
          <span>{isAuthenticated ? 'Past Orders History' : 'Browse All Produce'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid of Staples */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {staples.map((staple: any) => {
          const cartItem = items.find(i => i.id === staple.id);
          const quantity = cartItem?.quantity || 0;

          return (
            <div
              key={staple.id}
              className="bg-slate-50 dark:bg-[#161E2E] p-3 rounded-[2px] border border-slate-200/70 dark:border-white/[0.07] hover:border-emerald-500/30 transition-all duration-200 flex items-center gap-3 shadow-xs group"
            >
              <div className="w-14 h-14 rounded-[2px] bg-white dark:bg-[#0F1520] overflow-hidden shrink-0 relative border border-slate-200 dark:border-white/10">
                {staple.image ? (
                  <Image
                    src={staple.image}
                    alt={staple.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                    {staple.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                  {staple.subtitle}
                </span>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-[#E8EEF8] truncate">
                  {staple.name}
                </h4>
                
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading font-extrabold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(staple.price)}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-[#8B96A8]">
                      / {staple.unit.split(' ')[0]}
                    </span>
                  </div>

                  {quantity === 0 ? (
                    <button
                      onClick={() => handleAdd(staple)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:bg-emerald-500/10 dark:hover:bg-emerald-500 dark:text-emerald-400 dark:hover:text-[#080C14] rounded-[2px] text-xs font-bold transition-all border border-emerald-200 dark:border-emerald-500/30 active:translate-y-0.5 cursor-pointer"
                    >
                      + Add
                    </button>
                  ) : (
                    <div className="flex items-center bg-[#10B981] text-white dark:text-[#080C14] rounded-[2px] px-1.5 py-0.5 text-xs font-bold gap-1.5 shadow-xs">
                      <button
                        onClick={() => updateQuantity(staple.id, quantity - 1)}
                        className="hover:opacity-75 active:scale-90 px-1 cursor-pointer"
                      >
                        –
                      </button>
                      <span className="font-mono text-xs">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(staple.id, quantity + 1)}
                        className="hover:opacity-75 active:scale-90 px-1 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
