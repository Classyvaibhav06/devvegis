'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MapPin, Clock, CreditCard, Wallet, Banknote, ShieldCheck,
  ChevronRight, Plus, Check, AlertCircle, Loader2, Sparkles, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [deliverySlot, setDeliverySlot] = useState<'INSTANT' | 'EVENING' | 'TOMORROW'>('INSTANT');
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'WALLET' | 'COD'>('RAZORPAY');
  const [tip, setTip] = useState<number>(10);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    landmark: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    label: 'HOME',
  });

  // Fetch saved addresses
  const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const res = await api.get('/addresses');
      const data = res.data.data || [];
      if (data.length > 0 && !selectedAddressId) {
        const defaultAddr = data.find((a: any) => a.isDefault) || data[0];
        setSelectedAddressId(defaultAddr.id);
      }
      return data;
    },
    enabled: isAuthenticated,
  });

  // Calculate bill breakdown
  // Fetch platform settings dynamically
  const { data: platformSettings } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const res = await api.get('/admin/settings');
      return res.data.data;
    },
  });

  const freeThreshold = platformSettings?.freeDeliveryThreshold ?? 199;
  const baseFee = platformSettings?.baseDeliveryFee ?? 25;
  const deliveryFee = total > freeThreshold ? 0 : baseFee;
  const handlingFee = 5;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, total - couponDiscount + deliveryFee + handlingFee + tip);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode.toUpperCase().trim(),
        orderTotal: total,
      });
      setAppliedCoupon({
        code: couponCode.toUpperCase().trim(),
        discount: res.data.data?.discountAmount || 50,
      });
      toast.success(`Coupon ${couponCode.toUpperCase()} applied!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const createAddressMutation = useMutation({
    mutationFn: async (formData: typeof newAddressForm) => {
      const res = await api.post('/addresses', formData);
      return res.data.data;
    },
    onSuccess: (newAddr) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setSelectedAddressId(newAddr.id);
      setShowNewAddress(false);
      toast.success('Address saved successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save address');
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        addressId: selectedAddressId,
        deliverySlot,
        paymentMethod,
        tipAmount: tip,
        couponCode: appliedCoupon?.code,
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit,
        })),
        totalAmount: grandTotal,
      };
      const res = await api.post('/orders', payload);
      return res.data.data;
    },
    onSuccess: (order) => {
      clearCart();
      toast.success('Order placed successfully');
      router.push(`/orders/${order.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to place order. Please check your details.');
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="container-main py-20 text-center max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Please Sign In</h1>
        <p className="text-gray-500 mb-6">You need to be signed in to place your DevVegis order.</p>
        <Link href="/login" className="btn-primary inline-flex items-center gap-2">
          <span>Sign In to Continue</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-main py-20 text-center max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-6">Add delicious fresh vegetables and fruits to proceed with checkout.</p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <span>Start Shopping</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-main py-8">
      {/* Back button */}
      <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Cart</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Delivery Details & Payment */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Delivery Address */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-50 dark:bg-green-950/40 rounded-[2px] flex items-center justify-center text-green-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-gray-100">
                    Delivery Address
                  </h2>
                  <p className="text-xs text-gray-500">Choose where to deliver your fresh produce</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewAddress(!showNewAddress)}
                className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showNewAddress ? 'Cancel' : 'Add New'}</span>
              </button>
            </div>

            {/* Address Selection List */}
            {!showNewAddress && (
              <div className="space-y-3">
                {isLoadingAddresses ? (
                  <div className="skeleton h-16 w-full rounded-[2px]" />
                ) : addresses.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-[2px]">
                    <p className="text-sm text-gray-500 mb-3">No addresses found</p>
                    <button
                      onClick={() => setShowNewAddress(true)}
                      className="btn-outline text-xs py-1.5 px-3"
                    >
                      Add Delivery Address
                    </button>
                  </div>
                ) : (
                  addresses.map((addr: any) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-4 rounded-[2px] border cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-green-500 bg-green-50/40 dark:bg-green-950/20 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 text-green-600 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase">
                             {addr.label || 'HOME'}
                           </span>
                           <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                             {addr.name}
                           </span>
                           <span className="text-xs text-gray-500">({addr.phone})</span>
                         </div>
                         <p className="text-xs text-gray-600 dark:text-gray-400">
                           {addr.addressLine1}, {addr.landmark ? `${addr.landmark}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}
                         </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            )}

            {/* New Address Form */}
            {showNewAddress && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createAddressMutation.mutate(newAddressForm);
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
              >
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newAddressForm.name}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, name: e.target.value })}
                    className="input"
                    placeholder="Recipient's Name"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newAddressForm.phone}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                    className="input"
                    placeholder="10-digit mobile"
                  />
                </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Tag As</label>
                    <div className="flex gap-2">
                      {['Home', 'Work', 'Other'].map((l) => (
                        <button
                          type="button"
                          key={l}
                          onClick={() => setNewAddressForm({ ...newAddressForm, label: l })}
                          className={`px-3 py-1 rounded-[2px] text-xs font-semibold transition-all ${
                            newAddressForm.label.toUpperCase() === l.toUpperCase()
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Street / House / Apt *</label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.addressLine1}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, addressLine1: e.target.value })}
                      className="input"
                      placeholder="Flat 402, Green Meadows Apartment, 12th Main Road"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={newAddressForm.landmark}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, landmark: e.target.value })}
                      className="input"
                      placeholder="Near Metro Station / Next to Cafe"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.city}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1">Pincode (6 digits) *</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={newAddressForm.pincode}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, pincode: e.target.value.replace(/\D/g, '') })}
                      className="input font-mono"
                      placeholder="560001"
                    />
                  </div>
                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewAddress(false)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createAddressMutation.isPending}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    {createAddressMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save & Select</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 2. Delivery Slot */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-amber-50 dark:bg-amber-950/40 rounded-[2px] flex items-center justify-center text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-gray-100">
                  Delivery Speed & Slot
                </h2>
                <p className="text-xs text-gray-500">Pick how quickly you want your fresh order</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'INSTANT' as const,
                  title: `Instant (${platformSettings?.instantDeliverySlot || '10-15 Min'})`,
                  desc: 'Superfast quick delivery',
                  badge: 'Popular',
                },
                {
                  id: 'EVENING' as const,
                  title: 'Today Evening',
                  desc: `Between ${platformSettings?.eveningDeliverySlot || '6 PM - 9 PM'}`,
                  badge: 'Free Slot',
                },
                {
                  id: 'TOMORROW' as const,
                  title: 'Tomorrow Morning',
                  desc: `Between ${platformSettings?.morningDeliverySlot || '7 AM - 9 AM'}`,
                  badge: 'Fresh Harvest',
                },
              ].map(slot => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setDeliverySlot(slot.id)}
                  className={`p-4 rounded-[2px] border text-left transition-all cursor-pointer ${
                    deliverySlot === slot.id
                      ? 'border-green-500 bg-green-50/40 dark:bg-green-950/20 ring-1 ring-green-500'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{slot.title}</span>
                    {deliverySlot === slot.id && <Check className="w-4 h-4 text-green-600" />}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{slot.desc}</p>
                  <span className="inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                    {slot.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950/40 rounded-[2px] flex items-center justify-center text-blue-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-gray-100">
                  Payment Method
                </h2>
                <p className="text-xs text-gray-500">100% secure encrypted transactions</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'RAZORPAY' as const,
                  icon: CreditCard,
                  title: 'Online Payment (UPI, Cards, NetBanking)',
                  desc: 'Powered by Razorpay sandbox with instant confirmation',
                },
                {
                  id: 'WALLET' as const,
                  icon: Wallet,
                  title: `DevVegis Wallet (Balance: ₹${user?.wallet?.balance || 0})`,
                  desc: 'Fast 1-tap checkout from your preloaded cashback balance',
                },
                {
                  id: 'COD' as const,
                  icon: Banknote,
                  title: 'Cash on Delivery (COD)',
                  desc: 'Pay cash or scan QR when your delivery partner arrives',
                },
              ].map(opt => {
                const Icon = opt.icon;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3.5 p-4 rounded-[2px] border cursor-pointer transition-all ${
                      paymentMethod === opt.id
                        ? 'border-green-500 bg-green-50/40 dark:bg-green-950/20 ring-1 ring-green-500'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.id}
                      checked={paymentMethod === opt.id}
                      onChange={() => setPaymentMethod(opt.id)}
                      className="mt-1 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {opt.title}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary & Placement */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Box */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Apply Coupon</span>
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="TRY VEGIS50"
                className="input text-xs uppercase"
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={isApplyingCoupon}
                className="btn-primary text-xs px-4 py-2"
              >
                {isApplyingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
              </button>
            </div>
            {appliedCoupon && (
              <div className="mt-2.5 flex items-center justify-between text-xs bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 p-2 rounded-[2px]">
                <span>Coupon {appliedCoupon.code} applied!</span>
                <span className="font-bold">-₹{appliedCoupon.discount}</span>
              </div>
            )}
          </div>

          {/* Delivery Partner Tip */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Rider Tip (Optional)
            </h3>
            <p className="text-xs text-gray-500 mb-3">100% goes to your delivery superhero</p>
            <div className="flex gap-2">
              {[0, 10, 20, 50].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTip(amt)}
                  className={`flex-1 py-1.5 rounded-[2px] text-xs font-semibold border transition-all cursor-pointer ${
                    tip === amt
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {amt === 0 ? 'None' : `₹${amt}`}
                </button>
              ))}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Bill Breakdown
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Items Subtotal ({items.length})</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">₹{total}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery Charge</span>
                {deliveryFee === 0 ? (
                  <span className="font-bold text-green-600">FREE</span>
                ) : (
                  <span className="font-medium text-gray-900 dark:text-gray-100">₹{deliveryFee}</span>
                )}
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Packaging & Handling</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">₹{handlingFee}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}
              {tip > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Rider Tip</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">₹{tip}</span>
                </div>
              )}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between text-sm font-bold text-gray-900 dark:text-gray-100">
                <span>To Pay</span>
                <span className="text-green-600 text-base">₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={() => placeOrderMutation.mutate()}
              disabled={placeOrderMutation.isPending || !selectedAddressId}
              className="btn-primary w-full mt-6 py-3 flex items-center justify-center gap-2"
            >
              {placeOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Place Order • ₹{grandTotal}</span>
                </>
              )}
            </button>

            {!selectedAddressId && (
              <p className="text-[11px] text-amber-600 text-center mt-2 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Please select or add a delivery address</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
