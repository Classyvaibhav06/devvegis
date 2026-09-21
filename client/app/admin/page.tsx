'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Users, Package, TrendingUp, ArrowUpRight, AlertTriangle,
  Star, Clock, CheckCircle, XCircle, Truck, BarChart3
} from 'lucide-react';
import { AreaChart, Area, Grid, XAxis, ChartTooltip } from '@bklitui/ui/charts';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import Link from 'next/link';

function StatCard({ title, value, sub, icon: Icon, color, trend }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={`text-xs font-semibold flex items-center gap-1 ${Number(trend) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            <ArrowUpRight className={`w-3 h-3 ${Number(trend) < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(Number(trend))}%
          </span>
        )}
      </div>
      <p className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{title}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState<'7days' | '30days'>('7days');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get('/analytics/dashboard')).data.data,
    refetchInterval: 30000,
  });

  const { data: rawChartData, isLoading: chartLoading } = useQuery({
    queryKey: ['revenue-chart', period],
    queryFn: async () => (await api.get(`/analytics/revenue?period=${period}`)).data.data,
    refetchInterval: 30000,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => (await api.get('/orders/admin/all?limit=8')).data.data,
  });

  const formattedChartData = useMemo(() => {
    if (!rawChartData || !Array.isArray(rawChartData)) return [];
    return rawChartData.map((d: any) => ({
      ...d,
      date: new Date(d.date),
      revenue: Number(d.revenue || 0),
      costs: Number(d.costs || 0),
      orders: Number(d.orders || 0),
    }));
  }, [rawChartData]);

  const totalPeriodRevenue = useMemo(() => {
    return formattedChartData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  }, [formattedChartData]);

  const totalPeriodOrders = useMemo(() => {
    return formattedChartData.reduce((acc, curr) => acc + (curr.orders || 0), 0);
  }, [formattedChartData]);

  const kpis = stats?.kpis;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time operations overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live • Updates every 30s
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Today's Orders" value={kpis?.todayOrders ?? '—'} icon={ShoppingBag} color="bg-blue-500" trend={12} />
        <StatCard title="Today's Revenue" value={kpis ? formatCurrency(kpis.todayRevenue) : '—'} icon={TrendingUp} color="bg-green-500" trend={kpis?.revenueGrowth} />
        <StatCard title="Active Customers" value={kpis?.activeCustomers ?? '—'} icon={Users} color="bg-purple-500" />
        <StatCard title="Active Riders" value={kpis?.activeRiders ?? '—'} sub="Currently online" icon={Truck} color="bg-orange-500" />
        <StatCard title="Pending Orders" value={kpis?.pendingOrders ?? '—'} icon={Clock} color="bg-amber-500" />
        <StatCard title="Total Orders" value={kpis?.totalOrders ?? '—'} icon={Package} color="bg-teal-500" />
        <StatCard title="Total Revenue" value={kpis ? formatCurrency(kpis.totalRevenue) : '—'} icon={BarChart3} color="bg-indigo-500" />
        <StatCard title="Low Stock Items" value={kpis?.lowStockCount ?? '—'} icon={AlertTriangle} color="bg-red-500" />
      </div>

      {/* Composable Area Charts with Live Database Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Area Chart */}
        <div className="card p-5 overflow-hidden flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Revenue Analytics</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Total {formatCurrency(totalPeriodRevenue)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time gross sales & cost basis ({period === '7days' ? 'Last 7 Days' : 'Last 30 Days'})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Revenue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                  Cost
                </span>
              </div>
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-gray-800/60">
                <button
                  type="button"
                  onClick={() => setPeriod('7days')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    period === '7days'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  7D
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('30days')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    period === '30days'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  30D
                </button>
              </div>
            </div>
          </div>

          <div className="w-full relative min-h-[220px]">
            {formattedChartData.length > 0 ? (
              <AreaChart
                data={formattedChartData}
                status={chartLoading ? 'loading' : 'ready'}
                loadingLabel="Loading revenue..."
                aspectRatio="2.3 / 1"
                margin={{ top: 20, right: 15, bottom: 25, left: 15 }}
              >
                <Grid horizontal stroke="var(--chart-grid)" />
                <Area
                  dataKey="revenue"
                  fill="var(--chart-line-primary)"
                  stroke="#10b981"
                  fillOpacity={0.35}
                  fadeEdges
                  strokeWidth={2}
                />
                <Area
                  dataKey="costs"
                  fill="var(--chart-line-secondary)"
                  stroke="#0ea5e9"
                  fillOpacity={0.18}
                  fadeEdges
                  strokeWidth={2}
                />
                <XAxis numTicks={5} />
                <ChartTooltip
                  rows={(point) => [
                    {
                      label: 'Revenue',
                      value: formatCurrency(Number(point.revenue || 0)),
                      color: 'var(--chart-line-primary)',
                    },
                    {
                      label: 'Est. Cost',
                      value: formatCurrency(Number(point.costs || 0)),
                      color: 'var(--chart-line-secondary)',
                    },
                  ]}
                />
              </AreaChart>
            ) : (
              <div className="skeleton h-56 rounded-xl w-full" />
            )}
          </div>
        </div>

        {/* Orders Area Chart */}
        <div className="card p-5 overflow-hidden flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Order Volume</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                  {totalPeriodOrders} Orders
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Completed & pending customer fulfillment ({period === '7days' ? 'Last 7 Days' : 'Last 30 Days'})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                Orders
              </div>
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-gray-800/60">
                <button
                  type="button"
                  onClick={() => setPeriod('7days')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    period === '7days'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  7D
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('30days')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    period === '30days'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  30D
                </button>
              </div>
            </div>
          </div>

          <div className="w-full relative min-h-[220px]">
            {formattedChartData.length > 0 ? (
              <AreaChart
                data={formattedChartData}
                status={chartLoading ? 'loading' : 'ready'}
                loadingLabel="Loading order volume..."
                aspectRatio="2.3 / 1"
                margin={{ top: 20, right: 15, bottom: 25, left: 15 }}
              >
                <Grid horizontal stroke="var(--chart-grid)" />
                <Area
                  dataKey="orders"
                  fill="var(--chart-line-secondary)"
                  stroke="#0ea5e9"
                  fillOpacity={0.35}
                  fadeEdges
                  strokeWidth={2}
                />
                <XAxis numTicks={5} />
                <ChartTooltip
                  rows={(point) => [
                    {
                      label: 'Orders Placed',
                      value: `${point.orders ?? 0} orders`,
                      color: 'var(--chart-line-secondary)',
                    },
                  ]}
                />
              </AreaChart>
            ) : (
              <div className="skeleton h-56 rounded-xl w-full" />
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-green-600 hover:text-green-700">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                {['Order #', 'Customer', 'Items', 'Amount', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentOrders?.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">#{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{order.user?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{order.items?.length} items</td>
                  <td className="px-4 py-3 font-semibold text-green-600">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-green-600 hover:text-green-700 text-xs font-medium">
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!recentOrders && (
            <div className="p-8 text-center text-gray-400">Loading orders...</div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Manage Products', href: '/admin/products', icon: Package, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
          { label: 'Manage Users', href: '/admin/users', icon: Users, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
          { label: 'Manage Orders', href: '/admin/orders', icon: ShoppingBag, color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
          { label: 'Inventory', href: '/admin/inventory', icon: AlertTriangle, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
        ].map(link => (
          <Link key={link.href} href={link.href} className={`card p-4 flex items-center gap-3 hover:shadow-md transition-all ${link.color}`}>
            <link.icon className="w-5 h-5" />
            <span className="text-sm font-semibold">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
