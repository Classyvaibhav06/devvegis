'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { History, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const defaultStaples = [
  {
    id: '377ff3cd-a728-46ec-ad9a-462b05e384a2',
    name: 'Organic Hass Avocados',
    price: 149,
    unit: '2 pcs (320g)',
    orderedAgo: 'Ordered 3 days ago',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&q=80',
  },
  {
    id: '399bfede-c84e-4b0d-a52c-02d4d96a3520',
    name: 'Hydro English Cucumber',
    price: 45,
    unit: '500g (2-3 pcs)',
    orderedAgo: 'Ordered 4 days ago',
    image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=300&q=80',
  },
  {
    id: 'f6818ca0-71a9-48e4-9778-bf1cdc7f2025',
    name: 'Cherry Vine Tomatoes',
    price: 65,
    unit: '250g punnet',
    orderedAgo: 'Ordered 6 days ago',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&q=80',
  },
  {
    id: '4a172e0d-6f4e-4009-8f07-9adf828d577b',
    name: 'Tender Baby Spinach',
    price: 40,
    unit: '200g bunch',
    orderedAgo: 'Ordered 2 days ago',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&q=80',
  },
];

export default function BuyAgainShelf() {
  const { items, addItem, updateQuantity } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Fetch real past orders if user is authenticated
  const { data: pastOrders } = useQuery({
    queryKey: ['past-ordered-staples'],
    queryFn: async () => {
      if (!isAuthenticated) return null;
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
              orderedAgo: `Ordered ${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`,
              image: item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=300&q=80',
            });
          }
        }
      }
      return extracted.length > 0 ? extracted.slice(0, 4) : null;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const displayStaples = pastOrders && pastOrders.length > 0 ? pastOrders : defaultStaples;

  const handleAdd = (item: { id: string; name: string; price: number; unit: string; image: string }) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      unit: item.unit,
      image: item.image,
    });
    toast.success(`${item.name} added to cart`, { icon: '🌿' });
  };

  return (
    <section className="bg-white dark:bg-[#0F1520] p-5 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-white/[0.07] hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden shadow-xs dark:shadow-xl">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8] leading-tight">
              Quick Reorder: Frequent Staples
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#8B96A8]">
              Restock your kitchen with regular dawn essentials in 1 tap
            </p>
          </div>
        </div>

        <Link
          href="/orders"
          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 group self-start sm:self-auto"
        >
          <span>Past Orders History</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid of Staples */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {displayStaples.map(staple => {
          const cartItem = items.find(i => i.id === staple.id);
          const quantity = cartItem?.quantity || 0;

          return (
            <div
              key={staple.id}
              className="bg-slate-50 dark:bg-[#161E2E] p-3.5 rounded-2xl border border-slate-200/70 dark:border-white/[0.07] hover:border-emerald-500/30 transition-all duration-200 flex items-center gap-3.5 shadow-xs dark:shadow-md group"
            >
              <div className="w-16 h-16 rounded-xl bg-white dark:bg-[#0F1520] overflow-hidden shrink-0 relative border border-slate-200 dark:border-white/10">
                <Image
                  src={staple.image}
                  alt={staple.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="64px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {staple.orderedAgo}
                </span>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-[#E8EEF8] truncate">
                  {staple.name}
                </h4>
                
                <div className="flex items-center justify-between mt-2">
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
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:bg-emerald-500/10 dark:hover:bg-emerald-500 dark:text-emerald-400 dark:hover:text-[#080C14] rounded-xl text-xs font-extrabold transition-all border border-emerald-200 dark:border-emerald-500/30 active:scale-95"
                    >
                      + Add
                    </button>
                  ) : (
                    <div className="flex items-center bg-emerald-600 dark:bg-gradient-to-r dark:from-[#10B981] dark:to-[#059669] text-white dark:text-[#080C14] rounded-xl px-2 py-0.5 text-xs font-extrabold gap-1.5 shadow-md shadow-emerald-500/20">
                      <button
                        onClick={() => updateQuantity(staple.id, quantity - 1)}
                        className="hover:opacity-75 active:scale-90"
                      >
                        –
                      </button>
                      <span className="px-0.5 min-w-[12px] text-center">{quantity}</span>
                      <button
                        onClick={() => handleAdd(staple)}
                        className="hover:opacity-75 active:scale-90"
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
