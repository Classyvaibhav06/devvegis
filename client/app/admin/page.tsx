'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Users, Package, TrendingUp, ArrowUpRight, AlertTriangle,
  Star, Clock, CheckCircle, XCircle, Truck, BarChart3
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => (await api.get('/analytics/dashboard')).data.data,
    refetchInterval: 30000,
  });

  const { data: chartData } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: async () => (await api.get('/analytics/revenue?period=7days')).data.data,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => (await api.get('/orders/admin/all?limit=8')).data.data,
  });

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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Revenue — Last 7 Days</h2>
          {chartData ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(v: any) => [formatCurrency(v), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="url(#revenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="skeleton h-48 rounded-xl" />
          )}
        </div>

        {/* Orders Chart */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Orders — Last 7 Days</h2>
          {chartData ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="skeleton h-48 rounded-xl" />
          )}
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
