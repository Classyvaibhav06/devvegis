'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, Truck, Package, Phone, AlertTriangle,
  ArrowLeft, Download, ShieldCheck, MapPin, Sparkles, XCircle
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Order Placed', desc: 'Received by DevVegis' },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Harvest / Store notified' },
  { key: 'PACKING', label: 'Packing Produce', desc: 'Sorted and freshness verified' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Rider is on the way' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Farm-fresh at your doorstep' },
];

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const queryClient = useQueryClient();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}`);
      return res.data.data;
    },
    refetchInterval: 5000, // Live poll every 5s for delivery status updates
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

  // Calculate timeline index
  const currentStatusIndex = STATUS_STEPS.findIndex(s => s.key === order.status);
  const activeIndex = currentStatusIndex !== -1 ? currentStatusIndex : 1;
  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="container-main py-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Link href="/orders" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">
                Order #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
              </h1>
              <span className={`badge-${isDelivered ? 'green' : isCancelled ? 'red' : 'blue'}`}>
                {order.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString()}
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
        {/* Left Column: Tracking Timeline & Simulated Live Map */}
        <div className="lg:col-span-8 space-y-6">
          {/* Estimated Delivery / OTP Banner */}
          {!isDelivered && !isCancelled && (
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl p-6 shadow-green">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-5 h-5 animate-pulse" />
                    <span className="text-xs uppercase tracking-wider font-bold text-green-100">
                      Estimated Arrival
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-heading font-extrabold">
                    10 - 15 Minutes
                  </h2>
                  <p className="text-xs text-green-100 mt-1">
                    Delivering fresh produce straight to your door
                  </p>
                </div>

                {order.deliveryOtp && (
                  <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 text-center sm:text-right border border-white/20">
                    <span className="text-[11px] text-green-100 uppercase tracking-wider block">
                      Delivery OTP
                    </span>
                    <span className="text-2xl font-mono font-bold tracking-widest text-white">
                      {order.deliveryOtp}
                    </span>
                    <span className="text-[10px] text-green-200 block mt-0.5">
                      Share with rider upon arrival
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Simulated Live GPS Tracking Map */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Live Delivery Route
                </span>
              </div>
              <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                GPS Active
              </span>
            </div>

            {/* Simulated Map Visual */}
            <div className="relative h-64 bg-slate-900 overflow-hidden flex items-center justify-center">
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:24px_24px]" />
              
              {/* Animated Route Line */}
              <svg className="absolute inset-0 w-full h-full">
                <path
                  d="M 120 180 Q 280 80 440 160 T 680 100"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="4"
                  strokeDasharray="8 6"
                  className="animate-pulse"
                />
              </svg>

              {/* Destination Point */}
              <div className="absolute right-16 top-16 flex flex-col items-center">
                <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg ring-4 ring-rose-500/30">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded mt-1">
                  Your Address
                </span>
              </div>

              {/* Rider Point */}
              <motion.div
                animate={{ x: [0, 40, 80, 120], y: [0, -10, 15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-28 bottom-16 flex flex-col items-center"
              >
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg ring-4 ring-green-500/30">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded mt-1">
                  Rider Suresh • 0.8 km
                </span>
              </motion.div>
            </div>

            {/* Delivery Partner Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-green-700 font-bold">
                  S
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Suresh Kumar
                  </h4>
                  <p className="text-xs text-gray-500">DevVegis Certified Rider • ⭐ 4.9 (540+ orders)</p>
                </div>
              </div>
              <a
                href="tel:+919876543210"
                className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Rider</span>
              </a>
            </div>
          </div>

          {/* Timeline Progress */}
          <div className="card p-6">
            <h3 className="font-heading font-semibold text-base text-gray-900 dark:text-gray-100 mb-6">
              Order Timeline
            </h3>

            <div className="space-y-6">
              {STATUS_STEPS.map((step, index) => {
                const isPassed = index <= activeIndex;
                const isCurrent = index === activeIndex;

                return (
                  <div key={step.key} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isPassed
                            ? 'bg-green-600 text-white shadow-sm ring-4 ring-green-100 dark:ring-green-950/40'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                      </div>
                      {index < STATUS_STEPS.length - 1 && (
                        <div
                          className={`w-0.5 h-10 my-1 ${
                            isPassed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      )}
                    </div>

                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-sm font-semibold ${
                            isCurrent
                              ? 'text-green-600 dark:text-green-400'
                              : isPassed
                              ? 'text-gray-900 dark:text-gray-100'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] uppercase font-bold text-green-600 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded">
                            In Progress
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Items & Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          {/* Items in Order */}
          <div className="card p-5">
            <h3 className="font-heading font-semibold text-sm text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-green-600" />
              <span>Items in this Order ({order.items?.length || 0})</span>
            </h3>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {order.items?.map((item: any) => {
                const product = item.product || {};
                return (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name || 'Product'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">
                            🥦
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                          {product.name || 'Produce Item'}
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                      ₹{item.quantity * item.price}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="card p-5">
              <h3 className="font-heading font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span>Delivery Address</span>
              </h3>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                {order.address.name} ({order.address.phone})
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {order.address.street}, {order.address.landmark ? `${order.address.landmark}, ` : ''}
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
            </div>
          )}

          {/* Bill Summary */}
          <div className="card p-5">
            <h3 className="font-heading font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3">
              Payment Summary
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Payment Method</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {order.paymentMethod || 'ONLINE'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Payment Status</span>
                <span className="badge-green">{order.paymentStatus || 'PAID'}</span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-between text-sm font-bold text-gray-900 dark:text-gray-100">
                <span>Total Amount Paid</span>
                <span className="text-green-600 text-base">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
