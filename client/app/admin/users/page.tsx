'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, Search, Filter, ShieldCheck, UserCheck,
  UserX, Mail, Phone, ShoppingBag, Wallet, CheckCircle2
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

const ROLE_FILTERS = ['ALL', 'CUSTOMER', 'RIDER', 'WHOLESALE_BUYER', 'ADMIN'];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', selectedRole, search],
    queryFn: async () => {
      const params: any = { limit: 50 };
      if (selectedRole !== 'ALL') params.role = selectedRole;
      if (search) params.search = search;
      const res = await api.get('/users/admin/all', { params });
      return res.data;
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.patch(`/users/admin/${userId}/toggle-status`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User account status updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    },
  });

  const users = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-green-600" />
            <span>User Management</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage customer accounts, wholesale partners, delivery riders, and administrators
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          Total Registered: <span className="text-green-600 font-bold">{users.length}</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                selectedRole === r
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone number..."
            className="input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Role</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Wallet</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    Loading users database...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-bold flex items-center justify-center text-xs">
                          {u.name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Joined {new Date(u.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                          <Phone className="w-3 h-3" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                          : u.role === 'RIDER'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                          : u.role === 'WHOLESALE_BUYER'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4 font-semibold text-gray-800 dark:text-gray-200">
                      {u._count?.orders || 0}
                    </td>

                    <td className="p-4 font-semibold text-green-600">
                      ₹{u.wallet?.balance || 0}
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleStatusMutation.mutate(u.id)}
                        disabled={toggleStatusMutation.isPending}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                          u.isActive
                            ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                            : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30'
                        }`}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
