'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Search, Filter } from 'lucide-react';
import { formatCurrency, formatDate, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils';
import api from '@/lib/api';

const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'];

function OrderSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex justify-between">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="flex gap-2">
        {[1,2,3].map(i => <div key={i} className="skeleton w-12 h-12 rounded-xl" />)}
      </div>
      <div className="skeleton h-4 w-24 rounded" />
    </div>
  );
}

export default function OrdersPage() {
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', activeStatus],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '20' });
      if (activeStatus !== 'ALL') params.append('status', activeStatus);
      return (await api.get(`/orders?${params}`)).data;
    },
  });

  const orders = data?.data?.filter((o: any) =>
    !search || o.orderNumber.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="container-main py-6">
      <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100 mb-6">My Orders</h1>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by order number..."
          className="input pl-10"
        />
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${activeStatus === s ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
          >
            {s === 'ALL' ? 'All Orders' : getOrderStatusLabel(s)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <OrderSkeleton key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
          <Link href="/" className="btn-primary inline-block">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any, i: number) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/orders/${order.id}`}>
                <div className="card p-4 hover:border-green-200 dark:hover:border-green-800 transition-all group">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex items-center gap-2 mb-3">
                    {order.items.slice(0, 4).map((item: any) => (
                      <div key={item.id} className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0 relative">
                        {item.productImage ? (
                          <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🥬</div>
                        )}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                    <span className="font-bold text-green-600">{formatCurrency(order.totalAmount)}</span>
                  </div>

                  {/* Delivery progress for active orders */}
                  {['CONFIRMED', 'PACKED', 'RIDER_ASSIGNED', 'ON_THE_WAY'].includes(order.status) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-green-600 font-medium animate-pulse">
                        🛵 Your order is on its way! Track in real-time →
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
