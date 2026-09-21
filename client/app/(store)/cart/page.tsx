'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, Tag, ChevronRight, ShoppingBag, AlertCircle, Gift, ShoppingCart, Leaf, Zap, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/lib/utils';

const DELIVERY_FEE = 25;
const FREE_DELIVERY_ABOVE = 199;
const GST_RATE = 0.05;

export default function CartPage() {
  const { items, itemCount, total, updateQuantity, removeItem, clearCart } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = total;
  const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const discount = appliedCoupon?.discount || 0;
  const gst = Math.round(subtotal * GST_RATE * 100) / 100;
  const grandTotal = subtotal + deliveryFee - discount + gst;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (couponCode.toUpperCase() === 'WELCOME50') {
      setAppliedCoupon({ code: 'WELCOME50', discount: 50 });
      toast.success('Coupon applied! ₹50 off');
    } else {
      toast.error('Invalid coupon code');
    }
    setCouponLoading(false);
  };

  if (itemCount === 0) {
    return (
      <div className="container-main py-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-20 h-20 rounded-[4px] bg-slate-100 dark:bg-[#0F1520] border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto mb-6 shadow-xs text-[#10B981]">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8] mb-3">Your cart is empty</h2>
          <p className="text-slate-500 dark:text-[#8B96A8] text-sm mb-8">Add fresh vegetables and fruits to get started</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white dark:text-[#080C14] font-bold px-6 py-3 rounded-[2px] transition-all active:translate-y-0.5 shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-white dark:text-[#080C14]" />
            <span>Start Shopping</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-main py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8]">
          Shopping Cart <span className="text-emerald-600 dark:text-emerald-400">({itemCount})</span>
        </h1>
        <button
          onClick={() => { clearCart(); toast.success('Cart cleared'); }}
          className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/[0.07] px-3 py-1.5 rounded-[2px] active:translate-y-0.5 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear all items</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence mode="popLayout">
            {items.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                className="bg-white dark:bg-[#0F1520] border border-slate-200/80 dark:border-white/[0.07] hover:border-emerald-500/30 rounded-[4px] p-4 flex items-center gap-4 transition-all duration-200 shadow-xs relative overflow-hidden"
              >
                {/* Image */}
                <Link href={`/products/${item.id}`}>
                  <div className="relative w-20 h-20 rounded-[2px] overflow-hidden bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/10 shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Leaf className="w-6 h-6 text-emerald-500" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.id}`}>
                    <h3 className="font-heading font-bold text-slate-900 dark:text-[#E8EEF8] text-sm sm:text-base line-clamp-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-[#8B96A8] mt-0.5 font-mono">per {item.unit}</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-heading font-extrabold text-sm sm:text-base mt-1">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>

                {/* Qty Controls */}
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/10 rounded-[2px] overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-[#8B96A8] hover:text-slate-900 dark:hover:text-[#E8EEF8] transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-heading font-extrabold text-sm text-slate-900 dark:text-[#E8EEF8]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => { removeItem(item.id); toast.success('Removed from cart'); }}
                    className="p-2 text-slate-400 dark:text-[#8B96A8] hover:text-red-500 hover:bg-red-50 dark:hover:bg-[#161E2E] rounded-[2px] transition-all border border-transparent hover:border-red-500/20 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-white dark:bg-[#0F1520] border border-slate-200/80 dark:border-white/[0.07] rounded-[4px] p-4 shadow-xs">
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-[#E8EEF8] mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Apply Coupon
            </h3>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-[2px] p-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Gift className="w-4 h-4" />
                  <span className="font-bold text-sm">{appliedCoupon.code}</span>
                  <span className="text-xs">— ₹{appliedCoupon.discount} off</span>
                </div>
                <button onClick={() => setAppliedCoupon(null)} className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 cursor-pointer">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="Enter code (WELCOME50)"
                  className="bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-[#E8EEF8] placeholder-slate-400 dark:placeholder-[#4E5A6B] rounded-[2px] px-3 py-2 flex-1 text-sm focus:outline-hidden focus:border-emerald-500/50"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                  className="bg-[#10B981] hover:bg-[#059669] text-white dark:text-[#080C14] font-bold py-2 px-4 text-sm rounded-[2px] transition-all active:translate-y-0.5 disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-[#8B96A8] mt-2.5">
              Available: <button onClick={() => setCouponCode('WELCOME50')} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer">WELCOME50</button>
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="bg-white dark:bg-[#0F1520] border border-slate-200/80 dark:border-white/[0.07] rounded-[4px] p-4 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-transparent" />
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-[#E8EEF8] mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-[#8B96A8]">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-mono text-slate-900 dark:text-[#E8EEF8]">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-[#8B96A8]">
                <span>Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" /> FREE
                  </span>
                ) : (
                  <span className="font-mono text-slate-900 dark:text-[#E8EEF8]">{formatCurrency(deliveryFee)}</span>
                )}
              </div>
              {deliveryFee > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-[2px] p-2.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  Add {formatCurrency(FREE_DELIVERY_ABOVE - subtotal)} more for free delivery
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-[#8B96A8]">
                <span>GST (5%)</span>
                <span className="font-mono text-slate-900 dark:text-[#E8EEF8]">{formatCurrency(gst)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Coupon Discount</span>
                  <span className="font-mono">- {formatCurrency(discount)}</span>
                </div>
              )}
              <div className="border-t border-slate-100 dark:border-white/[0.07] pt-3 flex justify-between font-heading font-extrabold text-base text-slate-900 dark:text-[#E8EEF8]">
                <span>Total Amount</span>
                <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <Link
            href="/checkout"
            className="w-full bg-[#10B981] hover:bg-[#059669] text-white dark:text-[#080C14] font-heading font-extrabold text-base py-3.5 rounded-[2px] shadow-xs flex items-center justify-center gap-2 text-center transition-all duration-150 active:translate-y-0.5"
          >
            <span>Proceed to Checkout</span>
            <ChevronRight className="w-5 h-5 text-white dark:text-[#080C14]" />
          </Link>

          <p className="text-xs text-slate-400 dark:text-[#8B96A8] text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure checkout powered by Razorpay</span>
          </p>
        </div>
      </div>
    </div>
  );
}
