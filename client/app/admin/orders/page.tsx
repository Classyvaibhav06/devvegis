'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBag, Search, Filter, CheckCircle2, Clock, Truck,
  XCircle, AlertCircle, ChevronDown, ExternalLink, Loader2,
  RefreshCw, Bike, Phone, User
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'sonner';

const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'PACKED', 'RIDER_ASSIGNED', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const { data: orders = [], isLoading, isFetching } = useQuery({
    queryKey: ['admin-orders', selectedStatus],
    queryFn: async () => {
      const res = await api.get('/orders/admin/all', {
        params: { status: selectedStatus === 'ALL' ? undefined : selectedStatus },
      });
      return res.data.data || [];
    },
    refetchInterval: 3000, // Live poll every 3 seconds for instant dispatch
  });

  const { data: riders = [] } = useQuery({
    queryKey: ['admin-riders'],
    queryFn: async () => {
      const res = await api.get('/riders/admin/all');
      return res.data.data || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, riderId }: { id: string; status: string; riderId?: string }) => {
      const res = await api.patch(`/orders/${id}/status`, { status, riderId });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order stage / rider assignment updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update order');
    },
  });

  const filteredOrders = orders.filter((o: any) =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    (o.orderNumber && o.orderNumber.toLowerCase().includes(search.toLowerCase())) ||
    (o.user?.name && o.user.name.toLowerCase().includes(search.toLowerCase())) ||
    (o.address?.name && o.address.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>Order Fulfillment Management</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>Live Sync Active</span>
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time quick-commerce orders queue, rider dispatching, and delivery progression
          </p>
        </div>

        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-orders'] })}
          className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 self-start sm:self-auto"
          title="Refresh orders"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-green-600' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                selectedStatus === st
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, customer name, phone number..."
            className="input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Order & OTP</th>
                <th className="p-4">Customer & Location</th>
                <th className="p-4">Produce Items</th>
                <th className="p-4">Bill & Payment</th>
                <th className="p-4">Assigned Rider</th>
                <th className="p-4">Fulfillment Stage</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 text-green-600 animate-spin mx-auto mb-2" />
                    <span>Loading live orders queue...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order: any) => {
                  const assignedRiderId = order.delivery?.rider?.id || '';

                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      {/* Order Number & OTP */}
                      <td className="p-4">
                        <span className="font-mono font-bold text-gray-900 dark:text-gray-100 block">
                          #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[10px] text-gray-400">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {order.deliveryOtp && (
                            <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/20">
                              OTP: {order.deliveryOtp}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="p-4">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {order.user?.name || order.address?.name || 'Customer'}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          📞 {order.user?.phone || order.address?.phone || 'No phone'}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[180px] mt-0.5">
                          📍 {order.address?.addressLine1 || order.delivery?.deliveryAddress || `${order.address?.city || 'Bengaluru'}`}
                        </p>
                      </td>

                      {/* Items */}
                      <td className="p-4">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                          {order.items?.length || 1} produce item{order.items?.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate block max-w-[160px]">
                          {order.items?.map((it: any) => it.productName).filter(Boolean).join(', ') || 'Produce'}
                        </span>
                      </td>

                      {/* Total & Payment */}
                      <td className="p-4">
                        <span className="font-bold text-green-600 block text-sm">
                          ₹{order.totalAmount}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          order.payment?.method === 'CASH_ON_DELIVERY' || order.paymentMethod === 'COD'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                        }`}>
                          {order.payment?.method === 'CASH_ON_DELIVERY' || order.paymentMethod === 'COD' ? 'COD' : 'PREPAID'}
                        </span>
                      </td>

                      {/* Assigned Rider Dropdown */}
                      <td className="p-4">
                        <select
                          value={assignedRiderId}
                          onChange={(e) => {
                            const newRiderId = e.target.value;
                            if (newRiderId) {
                              updateStatusMutation.mutate({
                                id: order.id,
                                status: order.status === 'CONFIRMED' || order.status === 'PACKED' ? 'RIDER_ASSIGNED' : order.status,
                                riderId: newRiderId,
                              });
                            }
                          }}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs font-medium text-gray-800 dark:text-gray-200 cursor-pointer max-w-[140px]"
                        >
                          <option value="">-- Assign Rider --</option>
                          {riders.map((r: any) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.vehicleType || 'Bike'})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Stage Dropdown */}
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                          className={`border rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer ${
                            order.status === 'DELIVERED'
                              ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-950/40 dark:text-green-300'
                              : order.status === 'ON_THE_WAY'
                              ? 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300'
                              : order.status === 'PACKED'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300'
                              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700'
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PACKED">PACKED</option>
                          <option value="RIDER_ASSIGNED">RIDER ASSIGNED</option>
                          <option value="ON_THE_WAY">ON THE WAY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>

                      {/* Action */}
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700"
                        >
                          <span>View Details</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
