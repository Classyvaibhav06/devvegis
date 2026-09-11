'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get('/wishlist');
      return res.data.data;
    },
    enabled: isAuthenticated,
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/wishlist');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Wishlist cleared');
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="container-main py-20 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-slate-100 dark:bg-[#0F1520] border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-xl">
          <Heart className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8] mb-2">
          Save items you love
        </h1>
        <p className="text-slate-500 dark:text-[#8B96A8] mb-8 text-sm leading-relaxed">
          Sign in to your DevVegis account to view and manage your saved fresh veggies, fruits, and recipes.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white dark:text-[#080C14] font-extrabold px-6 py-3 rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all"
        >
          <span>Sign In to Continue</span>
          <ArrowRight className="w-4 h-4 text-white dark:text-[#080C14]" />
        </Link>
      </div>
    );
  }

  const items = data || [];

  return (
    <div className="container-main py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8]">
              My Saved Wishlist
            </h1>
            <span className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs px-2.5 py-1 rounded-full font-mono">
              {items.length} items
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8B96A8] mt-1">
            Fresh picks saved for your next fast cold-chain delivery
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending}
            className="bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/[0.07] hover:border-red-500/30 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2 self-start sm:self-auto text-xs font-bold py-2 px-4 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex flex-col gap-2 bg-white dark:bg-[#0F1520] p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.07]">
                <div className="aspect-square rounded-xl bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
                <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
                <div className="h-8 rounded-xl bg-slate-100 dark:bg-[#161E2E] animate-pulse" />
              </div>
            ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-slate-100 dark:bg-[#0F1520] border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400 dark:text-[#8B96A8] shadow-sm dark:shadow-xl">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8] mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-slate-500 dark:text-[#8B96A8] mb-6 text-xs sm:text-sm">
            Explore fresh organic produce, exotic veggies, and seasonal fruits to add here.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white dark:text-[#080C14] font-extrabold px-6 py-2.5 rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all"
          >
            <Sparkles className="w-4 h-4 text-white dark:text-[#080C14]" />
            <span>Start Shopping</span>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          <AnimatePresence>
            {items.map((item: any) => {
              const product = item.product || item;
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
