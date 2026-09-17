'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Clock, Truck, Package, Phone, AlertTriangle,
  ArrowLeft, Download, ShieldCheck, MapPin, Sparkles, XCircle,
  Copy, Check, Bike, Navigation, ShoppingBag, Mail
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

const TRACKING_STAGES = [
  {
    key: 'CONFIRMED',
    title: 'Order Confirmed',
    desc: 'Order received & sent to nearest Darkstore',
    etaText: '12 - 15 Mins',
  },
  {
    key: 'PACKED',
    title: 'Produce Packed & Verified',
    desc: 'Fresh fruits & vegetables sorted and packed in eco-bag',
    etaText: '8 - 10 Mins',
  },
  {
    key: 'ON_THE_WAY',
    title: 'Out for Delivery',
    desc: 'Delivery partner has picked up and is on the way',
    etaText: '3 - 5 Mins',
  },
  {
    key: 'DELIVERED',
    title: 'Delivered at Doorstep',
    desc: 'Farm-fresh goodness handed over successfully',
    etaText: 'Delivered',
  },
];

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const queryClient = useQueryClient();
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);

  const handleResendOtpEmail = async () => {
    setIsResendingOtp(true);
    try {
      await api.post(`/orders/${orderId}/resend-otp`);
      toast.success('📬 Delivery OTP sent to your email via Resend!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP email.');
    } finally {
      setIsResendingOtp(false);
    }
  };

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}`);
      return res.data.data;
    },
    refetchInterval: 3000, // Live poll every 3 seconds for instant updates
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/orders/${orderId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      toast.success('Order cancelled successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Cannot cancel order right now');
    },
  });

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(true);
    toast.success('Delivery OTP copied to clipboard');
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="container-main py-12">
        <div className="skeleton h-8 w-48 mb-6 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 skeleton h-96 rounded-2xl" />
          <div className="lg:col-span-4 skeleton h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-main py-20 text-center max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Order Not Found</h1>
        <p className="text-gray-500 mb-6">We couldn't retrieve the details for this order ID.</p>
        <Link href="/orders" className="btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  // Determine current active step index (0 to 3)
  const getStageIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'CONFIRMED':
        return 0;
      case 'PACKED':
        return 1;
      case 'RIDER_ASSIGNED':
      case 'ON_THE_WAY':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return 0;
    }
  };

  const activeStageIndex = getStageIndex(order.status);
  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED';
  const currentStage = TRACKING_STAGES[activeStageIndex];
  const assignedRider = order.delivery?.rider;

  return (
    <div className="container-main py-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">
                Order #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
              </h1>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isDelivered
                    ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                    : isCancelled
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 animate-pulse'
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString()} • 10-Min Quick Delivery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['PENDING', 'CONFIRMED'].includes(order.status) && (
            <button
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="btn-secondary text-rose-600 hover:text-rose-700 text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Order</span>
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Invoice</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live Tracker & Map */}
        <div className="lg:col-span-8 space-y-6">
          {/* Estimated Arrival / OTP Hero Banner */}
          {!isDelivered && !isCancelled && (
            <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    <span className="text-xs uppercase tracking-widest font-extrabold text-green-100">
                      Live Delivery Tracking
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight">
                    {currentStage.etaText}
                  </h2>
                  <p className="text-xs text-green-100 mt-1 max-w-md">
                    {currentStage.desc}
                  </p>
                </div>

                {/* Delivery OTP Card */}
                {order.deliveryOtp && (
                  <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center sm:text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-green-200 block mb-1">
                      Customer Delivery OTP
                    </span>
                    <div className="flex items-center justify-center sm:justify-end gap-2">
                      <span className="text-3xl font-mono font-extrabold tracking-widest text-white">
                        {order.deliveryOtp}
                      </span>
                      <button
                        onClick={() => handleCopyOtp(order.deliveryOtp)}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                        title="Copy OTP"
                      >
                        {copiedOtp ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={handleResendOtpEmail}
                        disabled={isResendingOtp}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors disabled:opacity-50 flex items-center gap-1 text-xs"
                        title="Resend OTP to email"
                      >
                        <Mail className={`w-4 h-4 ${isResendingOtp ? 'animate-pulse text-amber-300' : ''}`} />
                        <span className="hidden sm:inline text-[10px]">Email</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-green-200 block mt-1">
                      Share with partner ONLY after verification • Sent via Email
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {isDelivered && (
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-3xl p-6 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold">Order Delivered Successfully! 🎉</h3>
                <p className="text-xs text-green-100 mt-0.5">
                  Delivered on {order.deliveredAt ? new Date(order.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'time'}. Hope you enjoy the farm-fresh produce!
                </p>
              </div>
            </div>
          )}

          {/* Blinkit Dynamic Map Visual */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Live Dispatch Route & Hub Radar
                </span>
              </div>
              <span className="text-xs text-green-600 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span>GPS Live Active</span>
              </span>
            </div>

            {/* Simulated Live Route Canvas */}
            <div className="relative h-64 bg-slate-950 overflow-hidden flex items-center justify-center">
              {/* Radar Grid */}
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:24px_24px]" />

              {/* Glowing Route SVG */}
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <path
                  d="M 60 190 Q 180 70 280 140 T 360 80"
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="4"
                  strokeDasharray="8 6"
                  className="animate-pulse"
                />
              </svg>

              {/* Hub / Darkstore Node */}
              <div className="absolute left-4 sm:left-12 bottom-8 sm:bottom-12 flex flex-col items-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg ring-4 ring-emerald-500/30">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-white bg-slate-900/90 border border-slate-700 px-1.5 sm:px-2 py-0.5 rounded mt-1 whitespace-nowrap">
                  Darkstore Hub #04
                </span>
              </div>

              {/* Customer Destination Node */}
              <div className="absolute right-4 sm:right-12 top-8 sm:top-12 flex flex-col items-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-rose-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg ring-4 ring-rose-500/30">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-white bg-slate-900/90 border border-slate-700 px-1.5 sm:px-2 py-0.5 rounded mt-1 whitespace-nowrap">
                  Your Address
                </span>
              </div>

              {/* Moving Rider Node */}
              {!isDelivered && (
                <motion.div
                  animate={{
                    x: order.status === 'ON_THE_WAY' ? [0, 35, 75, 110] : [0, 15, 0],
                    y: order.status === 'ON_THE_WAY' ? [0, -15, 8, -5] : [0, -5, 0],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-[30%] sm:left-32 bottom-16 sm:bottom-20 flex flex-col items-center z-10"
                >
                  <div className="relative">
                    <span className="absolute -inset-2 rounded-full bg-green-500/40 animate-ping" />
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-black shadow-xl ring-4 ring-green-400/50">
                      <Bike className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-white bg-green-600 px-2 py-0.5 rounded-full shadow mt-1.5 whitespace-nowrap max-w-[150px] truncate">
                    {assignedRider?.name ? `${assignedRider.name}` : 'Rider'} • 0.6 km
                  </span>
                </motion.div>
              )}
            </div>

            {/* Delivery Partner Card */}
            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/60 flex items-center justify-between gap-3">
              {assignedRider ? (
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-xl sm:rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
                    {assignedRider.name?.[0] || 'R'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                        {assignedRider.name}
                      </h4>
                      <span className="text-[9px] sm:text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded shrink-0">
                        ⭐ {assignedRider.rating || '4.9'}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">
                      {assignedRider.vehicleType || 'Bike'} {assignedRider.vehicleNumber ? `• ${assignedRider.vehicleNumber}` : ''} • Vaccinated & Sanitized
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 text-amber-700 rounded-2xl flex items-center justify-center">
                    <Clock className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      Darkstore #04 Dispatching Partner
                    </h4>
                    <p className="text-xs text-gray-500">
                      Produce verified. Assigning nearest certified delivery partner.
                    </p>
                  </div>
                </div>
              )}

              {assignedRider?.phone && (
                <a
                  href={`tel:${assignedRider.phone}`}
                  className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Rider</span>
                </a>
              )}
            </div>
          </div>

          {/* 4-Stage Progressive Timeline */}
          <div className="card p-6">
            <h3 className="font-heading font-bold text-base text-gray-900 dark:text-gray-100 mb-6">
              Order Fulfillment Stages
            </h3>

            <div className="space-y-6">
              {TRACKING_STAGES.map((step, index) => {
                const isPassed = index <= activeStageIndex;
                const isCurrent = index === activeStageIndex;

                return (
                  <div key={step.key} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                          isPassed
                            ? 'bg-green-600 text-white shadow-green ring-4 ring-green-100 dark:ring-green-950/40'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                      </div>
                      {index < TRACKING_STAGES.length - 1 && (
                        <div
                          className={`w-0.5 h-10 my-1 transition-all ${
                            isPassed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'
                          }`}
                        />
                      )}
                    </div>

                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-sm font-bold ${
                            isCurrent
                              ? 'text-green-600 dark:text-green-400'
                              : isPassed
                              ? 'text-gray-900 dark:text-gray-100'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.title}
                        </h4>
                        {isCurrent && !isDelivered && (
                          <span className="text-[10px] uppercase font-bold text-green-600 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded animate-pulse">
                            Active Now
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Items, Address, and Bill */}
        <div className="lg:col-span-4 space-y-6">
          {/* Produce Items */}
          <div className="card p-5">
            <h3 className="font-heading font-bold text-sm text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-green-600" />
              <span>Items in this Order ({order.items?.length || 0})</span>
            </h3>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {order.items?.map((item: any) => {
                const product = item.product || {};
                const rawImg = item.productImage || (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url);
                const validImgSrc = typeof rawImg === 'string' && rawImg.trim().length > 0 ? rawImg.trim() : null;
                const unitPrice = Number(item.unitPrice ?? item.price ?? product.price ?? 0);
                const quantity = Number(item.quantity) || 1;
                const totalPrice = Number(item.totalPrice ?? (unitPrice * quantity));
                const displayName = item.productName || product.name || 'Produce Item';

                return (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                        {validImgSrc ? (
                          <Image
                            src={validImgSrc}
                            alt={displayName}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            🥦
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                          {displayName}
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Qty: {quantity} × ₹{unitPrice}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                      ₹{totalPrice}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="card p-5">
              <h3 className="font-heading font-bold text-sm text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span>Delivery Address</span>
              </h3>
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                {order.address.name} ({order.address.phone})
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                {order.address.addressLine1}
                {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ''}
                {order.address.landmark ? `, ${order.address.landmark}` : ''}
                , {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
            </div>
          )}

          {/* Bill & Payment Summary */}
          <div className="card p-5">
            <h3 className="font-heading font-bold text-sm text-gray-900 dark:text-gray-100 mb-3">
              Bill & Payment Details
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Item Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Fee</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>GST / Taxes</span>
                <span>₹{order.gstAmount}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}
              {order.tipAmount > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Rider Tip</span>
                  <span>₹{order.tipAmount}</span>
                </div>
              )}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-between text-sm font-extrabold text-gray-900 dark:text-gray-100">
                <span>Total Amount</span>
                <span className="text-green-600 text-base">₹{order.totalAmount}</span>
              </div>

              <div className="pt-3 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                <span className="text-gray-500">Payment Mode</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {order.payment?.method === 'CASH_ON_DELIVERY' || order.paymentMethod === 'COD'
                    ? '💰 Cash on Delivery'
                    : '💳 Paid Online'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
