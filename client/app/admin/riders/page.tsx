'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Truck, CheckCircle2, XCircle, Phone, Star, DollarSign, Package,
  ExternalLink, RefreshCw, Plus, X, Loader2, Bike
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AdminRidersPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRider, setNewRider] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    vehicleType: 'BIKE',
    vehicleNumber: '',
  });

  const { data: riders = [], isLoading, isFetching } = useQuery({
    queryKey: ['admin-riders'],
    queryFn: async () => {
      const res = await api.get('/riders/admin/all');
      return res.data.data || [];
    },
    refetchInterval: 3000, // Live poll every 3 seconds
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/riders/admin/${id}/approve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-riders'] });
      toast.success('Rider approval status updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update rider approval');
    },
  });

  const createRiderMutation = useMutation({
    mutationFn: async (data: typeof newRider) => {
      const res = await api.post('/riders/admin/create', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-riders'] });
      toast.success('Rider created successfully and ready for dispatches!');
      setShowAddModal(false);
      setNewRider({
        name: '',
        email: '',
        phone: '',
        password: '',
        vehicleType: 'BIKE',
        vehicleNumber: '',
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create rider');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Truck className="w-6 h-6 text-green-600" />
            <span>Delivery Fleet & Riders</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage certified delivery partners, track ratings, approvals, and active dispatches
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Rider</span>
          </button>
          <Link
            href="/admin/orders"
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <span>View Orders Queue</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-riders'] })}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            title="Refresh riders"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-green-600' : ''}`} />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Rider</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Deliveries</th>
                <th className="p-4">Earnings</th>
                <th className="p-4">Current Dispatch</th>
                <th className="p-4">Approval</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400">
                    Loading rider fleet...
                  </td>
                </tr>
              ) : riders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-500">
                    <Bike className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-gray-700 dark:text-gray-300">No riders registered yet.</p>
                    <p className="text-[11px] text-gray-400 mt-1">Click &quot;Add New Rider&quot; to onboard delivery partners.</p>
                  </td>
                </tr>
              ) : (
                riders.map((r: any) => {
                  const activeDelivery = r.deliveries?.[0];

                  return (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                            {r.name?.[0] || 'R'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {r.name}
                            </p>
                            <p className="text-[10px] text-gray-400">{r.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{r.phone}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-[11px]">
                          {r.vehicleType || 'BIKE'} {r.vehicleNumber ? `• ${r.vehicleNumber}` : ''}
                        </span>
                      </td>

                      <td className="p-4 font-semibold text-amber-500 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{r.rating || 5.0}</span>
                      </td>

                      <td className="p-4 font-semibold text-gray-800 dark:text-gray-200">
                        {r.totalDeliveries || 0}
                      </td>

                      <td className="p-4 font-bold text-green-600">
                        ₹{r.totalEarnings || 0}
                      </td>

                      {/* Current Active Dispatch */}
                      <td className="p-4">
                        {activeDelivery?.order ? (
                          <Link
                            href={`/admin/orders/${activeDelivery.order.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800"
                          >
                            <span>#{activeDelivery.order.orderNumber} (₹{activeDelivery.order.totalAmount})</span>
                            <span className="text-[10px] font-normal">({activeDelivery.status})</span>
                          </Link>
                        ) : (
                          <span className="text-[11px] text-gray-400">Available</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.isApproved
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}>
                          {r.isApproved ? 'Approved' : 'Pending Verification'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {!r.isApproved && (
                          <button
                            onClick={() => approveMutation.mutate(r.id)}
                            disabled={approveMutation.isPending}
                            className="btn-primary text-xs py-1 px-2.5"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rider Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Bike className="w-5 h-5 text-emerald-600" />
                <span>Add Delivery Rider</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createRiderMutation.mutate(newRider);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-semibold block mb-1">Rider Full Name *</label>
                <input
                  type="text"
                  required
                  value={newRider.name}
                  onChange={(e) => setNewRider({ ...newRider, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Email Address (Login ID) *</label>
                <input
                  type="email"
                  required
                  value={newRider.email}
                  onChange={(e) => setNewRider({ ...newRider, email: e.target.value })}
                  placeholder="e.g. ramesh.rider@devvegis.com"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newRider.phone}
                  onChange={(e) => setNewRider({ ...newRider, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Login Password *</label>
                <input
                  type="password"
                  required
                  value={newRider.password}
                  onChange={(e) => setNewRider({ ...newRider, password: e.target.value })}
                  placeholder="Password for rider app login"
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Vehicle Type</label>
                  <select
                    value={newRider.vehicleType}
                    onChange={(e) => setNewRider({ ...newRider, vehicleType: e.target.value })}
                    className="input text-xs"
                  >
                    <option value="BIKE">Motorbike</option>
                    <option value="SCOOTER">Scooter / EV</option>
                    <option value="CYCLE">Bicycle</option>
                    <option value="VAN">Delivery Van</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    value={newRider.vehicleNumber}
                    onChange={(e) => setNewRider({ ...newRider, vehicleNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. KA01AB1234"
                    className="input text-xs uppercase"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRiderMutation.isPending}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  {createRiderMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save & Register Rider</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
