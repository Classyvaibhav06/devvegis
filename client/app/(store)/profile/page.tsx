'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Wallet, Tag, Share2, LogOut, ShieldCheck,
  Plus, Trash2, Edit3, Copy, Check, Sparkles, ChevronRight, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { toast } from 'sonner';

type Tab = 'profile' | 'addresses' | 'wallet' | 'coupons' | 'refer';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  // Addresses Query
  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get('/addresses');
      return res.data.data || [];
    },
    enabled: isAuthenticated,
  });

  // Wallet Query
  const { data: walletData } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await api.get('/wallet');
      return res.data.data;
    },
    enabled: isAuthenticated,
  });

  // Coupons Query
  const { data: coupons = [] } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const res = await api.get('/coupons');
      return res.data.data || [];
    },
    enabled: isAuthenticated,
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address removed');
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileForm) => {
      const res = await api.patch('/users/profile', data);
      return res.data.data;
    },
    onSuccess: (updated) => {
      updateUser(updated);
      toast.success('Profile updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleCopyReferral = () => {
    const code = user?.id ? `DEVVEGIS-${user.id.slice(0, 6).toUpperCase()}` : 'DEVVEGIS100';
    navigator.clipboard.writeText(code);
    setCopiedReferral(true);
    toast.success('Referral code copied to clipboard!');
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="container-main py-20 text-center max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">My Account</h1>
        <p className="text-gray-500 mb-6">Please sign in to access your DevVegis profile and wallet.</p>
        <button onClick={() => router.push('/login')} className="btn-primary">
          Sign In Now
        </button>
      </div>
    );
  }

  const referralCode = user?.id ? `DEVVEGIS-${user.id.slice(0, 6).toUpperCase()}` : 'DEVVEGIS100';
  const walletBalance = walletData?.balance ?? (user?.wallet?.balance ?? 0);

  return (
    <div className="container-main py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* User Brief Card */}
          <div className="card p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-heading text-2xl font-bold shadow-green">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-gray-100">
                {user?.name}
              </h2>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full mt-1.5">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified {user?.role || 'Customer'}</span>
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="card p-2 space-y-1">
            {[
              { id: 'profile' as const, label: 'Personal Information', icon: User },
              { id: 'addresses' as const, label: 'Saved Addresses', icon: MapPin },
              { id: 'wallet' as const, label: `DevVegis Wallet (₹${walletBalance})`, icon: Wallet },
              { id: 'coupons' as const, label: 'Coupons & Offers', icon: Tag },
              { id: 'refer' as const, label: 'Refer & Earn', icon: Share2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 opacity-60 ${isActive ? 'text-white' : ''}`} />
                </button>
              );
            })}

            <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  logout();
                  toast.success('Logged out successfully');
                  router.push('/');
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {/* Tab 1: Personal Info */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card p-6"
              >
                <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Personal Information
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateProfileMutation.mutate(profileForm);
                  }}
                  className="space-y-4 max-w-lg"
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Email Address (Permanent)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="input opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="btn-primary text-xs py-2.5 px-6"
                  >
                    Save Changes
                  </button>
                </form>
              </motion.div>
            )}

            {/* Tab 2: Saved Addresses */}
            {activeTab === 'addresses' && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-gray-100">
                    Saved Addresses ({addresses.length})
                  </h3>
                </div>

                {addresses.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No saved addresses yet. You can add addresses during checkout.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr: any) => (
                      <div
                        key={addr.id}
                        className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase">
                              {addr.type || 'HOME'}
                            </span>
                            <button
                              onClick={() => deleteAddressMutation.mutate(addr.id)}
                              className="text-gray-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {addr.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {addr.street}, {addr.landmark ? `${addr.landmark}, ` : ''}{addr.city} - {addr.pincode}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">📞 {addr.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab 3: DevVegis Wallet */}
            {activeTab === 'wallet' && (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl p-6 shadow-green">
                  <span className="text-xs uppercase tracking-wider text-green-100 font-semibold block mb-1">
                    Available Wallet Balance
                  </span>
                  <div className="text-4xl font-heading font-extrabold mb-4">
                    ₹{walletBalance}
                  </div>
                  <p className="text-xs text-green-100">
                    Use your wallet for instant 1-tap checkout on fresh fruits & vegetables.
                  </p>
                </div>

                <div className="card p-6">
                  <h3 className="text-base font-heading font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Recent Wallet Transactions
                  </h3>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { id: 1, title: 'Cashback: Order #DV-8921', amt: '+₹50', type: 'credit', date: 'Yesterday' },
                      { id: 2, title: 'Referral Bonus: John D.', amt: '+₹100', type: 'credit', date: '3 days ago' },
                      { id: 3, title: 'Order Payment #DV-7640', amt: '-₹185', type: 'debit', date: '1 week ago' },
                    ].map((tx) => (
                      <div key={tx.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                            {tx.title}
                          </p>
                          <p className="text-[10px] text-gray-400">{tx.date}</p>
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            tx.type === 'credit' ? 'text-green-600' : 'text-rose-600'
                          }`}
                        >
                          {tx.amt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 4: Coupons */}
            {activeTab === 'coupons' && (
              <motion.div
                key="coupons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card p-6"
              >
                <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Available Coupons & Promo Codes
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { code: 'FRESH50', discount: 'Flat ₹50 OFF', min: 'Min order ₹199', desc: 'Valid on first 3 orders' },
                    { code: 'ORGANIC20', discount: '20% OFF Produce', min: 'Min order ₹299', desc: 'Valid on all certified organic items' },
                    { code: 'FREEDEL', discount: 'Free Delivery', min: 'Min order ₹149', desc: 'No delivery fee on instant slot' },
                  ].map((c) => (
                    <div
                      key={c.code}
                      className="p-4 rounded-xl border border-dashed border-green-500 bg-green-50/30 dark:bg-green-950/20 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/60 px-2 py-0.5 rounded">
                            {c.code}
                          </span>
                          <span className="text-xs font-bold text-green-600">{c.discount}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{c.desc}</p>
                        <p className="text-[11px] text-gray-400 mt-1">{c.min}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tab 5: Refer & Earn */}
            {activeTab === 'refer' && (
              <motion.div
                key="refer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card p-6 text-center max-w-lg mx-auto"
              >
                <div className="w-16 h-16 bg-green-50 dark:bg-green-950/40 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Refer Friends, Earn ₹100!
                </h3>
                <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                  Share your unique referral code. When your friend places their first DevVegis order, they get ₹50 off, and you get ₹100 directly in your DevVegis wallet!
                </p>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl flex items-center justify-between mb-6">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                      Your Referral Code
                    </span>
                    <span className="font-mono text-base font-bold text-gray-900 dark:text-gray-100">
                      {referralCode}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyReferral}
                    className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
                  >
                    {copiedReferral ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReferral ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
