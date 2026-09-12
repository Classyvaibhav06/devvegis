'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Package, User, MapPin, CreditCard,
  Truck, Clock, CheckCircle2, AlertTriangle, Printer, Phone, Mail, ExternalLink,
  Bike, Loader2
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

const STATUSES = ['PENDING', 'CONFIRMED', 'PACKED', 'RIDER_ASSIGNED', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'];

export default function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const queryClient = useQueryClient();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}`);
      return res.data.data;
    },
    refetchInterval: 3000, // Live poll every 3 seconds
  });

  const { data: riders = [] } = useQuery({
    queryKey: ['admin-riders'],
    queryFn: async () => {
      const res = await api.get('/riders/admin/all');
      return res.data.data || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, riderId }: { status: string; riderId?: string }) => {
      const res = await api.patch(`/orders/${orderId}/status`, { status, riderId });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order fulfillment updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 skeleton h-96 rounded-2xl" />
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="card p-12 text-center max-w-md mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold mb-2">Order Not Found</h2>
        <p className="text-xs text-gray-500 mb-6">
          Could not find an order with ID: <span className="font-mono">{orderId}</span>
        </p>
        <Link href="/admin/orders" className="btn-primary text-xs py-2 px-4">
          Back to Orders
        </Link>
      </div>
    );
  }

  const assignedRider = order.delivery?.rider;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-heading font-bold text-gray-900 dark:text-gray-100">
                Order #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
              </h1>
              <span className="badge-green text-xs font-semibold px-2.5 py-0.5">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString()} • ID: {order.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Changer */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold">Stage:</span>
            <select
              value={order.status}
              onChange={(e) => updateStatusMutation.mutate({ status: e.target.value })}
              disabled={updateStatusMutation.isPending}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-gray-100 shadow-sm cursor-pointer"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Items & Delivery Logistics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Table */}
          <div className="card p-5">
            <h3 className="font-heading font-semibold text-sm text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-green-600" />
              <span>Ordered Produce ({order.items?.length || 0} items)</span>
            </h3>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {order.items?.map((item: any) => {
                const product = item.product || {};
                const rawImg = item.productImage || (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url);
                const validImg = typeof rawImg === 'string' && rawImg.trim().length > 0 ? rawImg.trim() : null;
                const unitPrice = Number(item.unitPrice ?? item.price ?? product.price ?? 0);
                const quantity = Number(item.quantity) || 1;
                const totalPrice = Number(item.totalPrice ?? (unitPrice * quantity));
                const displayName = item.productName || product.name || 'Produce Item';

                return (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                        {validImg ? (
                          <Image
                            src={validImg}
                            alt={displayName}
                            fill
                            sizes="48px"
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

            {/* Total breakdown */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
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
              <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-100 dark:border-gray-800">
                <span>Grand Total</span>
                <span className="text-green-600 text-base">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Fulfillment & Rider Assignment Card */}
          <div className="card p-5">
            <h3 className="font-heading font-semibold text-sm text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Fulfillment & Dispatch Logistics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Delivery Speed</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 mt-1 block">
                  {order.deliverySlot || 'INSTANT (10-15 Min)'}
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Customer Delivery OTP</span>
                <span className="font-mono text-base font-bold text-green-600 mt-1 block tracking-wider">
                  {order.deliveryOtp || 'N/A'}
                </span>
                <span className="text-[10px] text-gray-400">Required by rider for doorstep drop</span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl">
                <span className="text-gray-400 block text-[10px] uppercase font-bold mb-1">Rider Assignment</span>
                <select
                  value={assignedRider?.id || ''}
                  onChange={(e) => {
                    const riderId = e.target.value;
                    if (riderId) {
                      updateStatusMutation.mutate({
                        status: order.status === 'CONFIRMED' || order.status === 'PACKED' ? 'RIDER_ASSIGNED' : order.status,
                        riderId,
                      });
                    }
                  }}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer"
                >
                  <option value="">-- Assign Rider --</option>
                  {riders.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.vehicleType || 'Bike'})
                    </option>
                  ))}
                </select>
                {assignedRider && (
                  <span className="text-[10px] text-green-600 font-semibold block mt-1">
                    📞 {assignedRider.phone} • ⭐ {assignedRider.rating || '4.8'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Customer & Payment Details */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="card p-5 space-y-3 text-xs">
            <h3 className="font-heading font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              <span>Customer Information</span>
            </h3>

            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-gray-100">
                {order.user?.name || order.address?.name || 'Customer'}
              </p>
              {order.user?.email && (
                <div className="flex items-center gap-2 text-gray-500 mt-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{order.user.email}</span>
                </div>
              )}
              {(order.user?.phone || order.address?.phone) && (
                <div className="flex items-center gap-2 text-gray-500 mt-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{order.user?.phone || order.address?.phone}</span>
                </div>
              )}
            </div>

            {order.address && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {order.address.addressLine1}
                    {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ''}
                    {order.address.landmark ? `, ${order.address.landmark}` : ''},
                    {' '}{order.address.city}, {order.address.state} - {order.address.pincode}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Card */}
          <div className="card p-5 space-y-3 text-xs">
            <h3 className="font-heading font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-600" />
              <span>Payment Details</span>
            </h3>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">Method</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {order.payment?.method || order.paymentMethod || 'CASH_ON_DELIVERY'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status</span>
              <span className="badge-green">
                {order.payment?.status || order.paymentStatus || 'PAID'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total Charged</span>
              <span className="font-bold text-sm text-green-600">
                ₹{order.totalAmount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
