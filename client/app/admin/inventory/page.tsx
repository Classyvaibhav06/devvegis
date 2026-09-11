'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle, CheckCircle2, RefreshCw, Plus, Package,
  ArrowUpRight, Clock, ShieldAlert, Sparkles
} from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AdminInventoryPage() {
  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async () => {
      const res = await api.get('/products?limit=50');
      return res.data.data || [];
    },
  });

  const restockMutation = useMutation({
    mutationFn: async ({ id, addedStock }: { id: string; addedStock: number }) => {
      const res = await api.patch(`/inventory/${id}/restock`, { stock: addedStock });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast.success('Stock updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update stock');
    },
  });

  const products = productsData || [];
  const lowStockItems = products.filter((p: any) => p.stock <= 15);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">
          Darkstore Inventory & Restock Alerts
        </h1>
        <p className="text-xs text-gray-500">
          Live stock tracking across fulfillment micro-hubs
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Critical Low Stock</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-2">
            {lowStockItems.length} Items
          </p>
          <p className="text-[11px] text-rose-600 mt-1">Requires immediate farm dispatch</p>
        </div>

        <div className="card p-5 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">In Stock Products</span>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-2">
            {products.length - lowStockItems.length} Items
          </p>
          <p className="text-[11px] text-green-600 mt-1">Healthy fulfillment level</p>
        </div>

        <div className="card p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Next Mandi Harvest Inflow</span>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-2">
            04:30 AM
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Expected 4.2 tonnes</p>
        </div>
      </div>

      {/* Inventory Table with 1-Click Restock */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-green-600" />
            <span>Produce Stock Grid</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Item Name</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    Loading stock data...
                  </td>
                </tr>
              ) : (
                products.map((item: any) => {
                  const isCritical = item.stock <= 15;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                            {item.images?.[0] ? (
                              <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">🥦</div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100">{item.name}</p>
                            <p className="text-[11px] text-gray-400">{item.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-sm text-gray-900 dark:text-gray-100">
                        {item.stock} units
                      </td>
                      <td className="p-4">
                        {isCritical ? (
                          <span className="badge-red">Low Stock Warning</span>
                        ) : (
                          <span className="badge-green">Optimal</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => restockMutation.mutate({ id: item.id, addedStock: 50 })}
                            disabled={restockMutation.isPending}
                            className="btn-secondary text-[11px] py-1 px-2.5 hover:border-green-500"
                          >
                            +50 Units
                          </button>
                          <button
                            onClick={() => restockMutation.mutate({ id: item.id, addedStock: 100 })}
                            disabled={restockMutation.isPending}
                            className="btn-primary text-[11px] py-1 px-2.5"
                          >
                            +100 Units
                          </button>
                        </div>
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
