'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag, Plus, Trash2, CheckCircle2, XCircle, Sparkles, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    title: '',
    discountType: 'FLAT', // FLAT or PERCENTAGE
    discountValue: 50,
    minOrderAmount: 199,
    maxDiscount: 100,
    usageLimit: 500,
  });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await api.get('/coupons');
      return res.data.data || [];
    },
  });

  const createCouponMutation = useMutation({
    mutationFn: async (payload: typeof newCoupon) => {
      const res = await api.post('/coupons', {
        ...payload,
        title: payload.title.trim() || `${payload.code} Coupon`,
        code: payload.code.toUpperCase().trim(),
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setShowModal(false);
      toast.success('Coupon created successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/coupons/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Coupon deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete coupon');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">
            Coupons & Marketing Campaigns
          </h1>
          <p className="text-xs text-gray-500">
            Create discount codes, first-order incentives, and flash-sale vouchers
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full card p-12 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-green-600" />
            Loading campaigns...
          </div>
        ) : coupons.length === 0 ? (
          <div className="col-span-full card p-12 text-center text-gray-500">
            No active coupons found. Click &quot;Create Coupon&quot; to launch a campaign.
          </div>
        ) : (
          coupons.map((coupon: any) => (
            <div
              key={coupon.id}
              className="card p-5 border border-dashed border-green-500 bg-green-50/20 dark:bg-green-950/20 flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-base font-extrabold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/60 px-2.5 py-1 rounded-lg">
                    {coupon.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-green-600">
                      {coupon.type === 'PERCENTAGE' || coupon.discountType === 'PERCENTAGE'
                        ? `${coupon.value || coupon.discountValue}% OFF`
                        : `Flat ₹${coupon.value || coupon.discountValue} OFF`}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Delete coupon "${coupon.code}"?`)) {
                          deleteCouponMutation.mutate(coupon.id);
                        }
                      }}
                      disabled={deleteCouponMutation.isPending}
                      className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                      title="Delete coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {coupon.title && (
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    {coupon.title}
                  </p>
                )}
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Min order amount: <strong>₹{coupon.minOrderValue || coupon.minOrderAmount || 0}</strong>
                </p>
                {coupon.maxDiscount && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Max discount capped: <strong>₹{coupon.maxDiscount}</strong>
                  </p>
                )}
                <p className="text-[11px] text-gray-400 mt-2">
                  Usage: {coupon.usedCount || 0} / {coupon.maxUses || coupon.usageLimit || '∞'} times
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                <span className="badge-green">Active</span>
                <span className="text-gray-400 text-[10px]">Auto-applied at checkout</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-gray-100">
              Create Promotional Coupon
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createCouponMutation.mutate(newCoupon);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-semibold block mb-1">Coupon Title</label>
                <input
                  type="text"
                  required
                  value={newCoupon.title}
                  onChange={(e) => setNewCoupon({ ...newCoupon, title: e.target.value })}
                  placeholder="e.g. Monsoon Produce Super Saver"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. MONSOON30"
                  className="input text-xs uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    className="input text-xs"
                  >
                    <option value="FLAT">Flat Amount (₹)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.minOrderAmount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.maxDiscount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: Number(e.target.value) })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCouponMutation.isPending}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  {createCouponMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Coupon</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
