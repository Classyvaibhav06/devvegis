'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, MapPin, Tag, Share2, LogOut, ShieldCheck,
  Plus, Trash2, Edit3, Copy, Check, Sparkles, ChevronRight,
  Phone, Home, Briefcase, Building, X, CheckCircle2, Loader2, LocateFixed
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useAuthModalStore } from '@/store/authModalStore';
import GoogleOAuthButton from '@/components/auth/GoogleOAuthButton';
import api from '@/lib/api';
import { detectCurrentPosition } from '@/lib/geolocation';
import { toast } from 'sonner';

type Tab = 'profile' | 'addresses' | 'coupons' | 'refer';

interface AddressItem {
  id: string;
  label: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
}

const EMPTY_ADDRESS_FORM = {
  label: 'Home',
  name: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  latitude: null as number | null,
  longitude: null as number | null,
  isDefault: false,
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const { openModal } = useAuthModalStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);

  // User Profile Query (keeps profile & phone synced with server)
  const { data: serverProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await api.get('/users/profile');
      return res.data.data;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (serverProfile) {
      setProfileForm({
        name: serverProfile.name || '',
        phone: serverProfile.phone || '',
      });
    } else if (user) {
      setProfileForm((prev) => ({
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [serverProfile?.name, serverProfile?.phone, user?.name, user?.phone]);

  // Addresses Query
  const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get('/addresses');
      return res.data.data || [];
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

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileForm) => {
      const res = await api.patch('/users/profile', data);
      return res.data.data;
    },
    onSuccess: (updated) => {
      updateUser(updated);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile and phone number updated successfully! 🎉');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });

  const saveAddressMutation = useMutation({
    mutationFn: async (formData: typeof addressForm) => {
      if (editingAddressId) {
        const res = await api.put(`/addresses/${editingAddressId}`, formData);
        return res.data.data;
      } else {
        const res = await api.post('/addresses', formData);
        return res.data.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm(EMPTY_ADDRESS_FORM);
      toast.success(editingAddressId ? 'Address updated successfully' : 'New address added successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save address');
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address removed');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    },
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/addresses/${id}`, { isDefault: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Default delivery address updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to set default address');
    },
  });

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      ...EMPTY_ADDRESS_FORM,
      name: user?.name || '',
      phone: user?.phone || '',
    });
    setShowAddressForm(true);
  };

  const handleOpenEditAddress = (addr: AddressItem) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label || 'Home',
      name: addr.name || '',
      phone: addr.phone || '',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      landmark: addr.landmark || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      latitude: addr.latitude || null,
      longitude: addr.longitude || null,
      isDefault: addr.isDefault || false,
    });
    setShowAddressForm(true);
  };

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const loc = await detectCurrentPosition();
      setAddressForm((prev) => ({
        ...prev,
        city: loc.city || prev.city,
        state: loc.state || prev.state,
        pincode: loc.pincode || prev.pincode,
        addressLine2: loc.suburb || loc.road || prev.addressLine2,
        landmark: loc.landmark || prev.landmark,
        addressLine1: prev.addressLine1 ? prev.addressLine1 : (loc.road || ''),
        latitude: loc.latitude,
        longitude: loc.longitude,
      }));
      toast.success('Current location captured! Please verify and enter your flat/house number.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to capture current location');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleCopyReferral = () => {
    const code = user?.id ? `DEVVEGIS-${user.id.slice(0, 6).toUpperCase()}` : 'DEVVEGIS100';
    navigator.clipboard.writeText(code);
    setCopiedReferral(true);
    toast.success('Referral code copied to clipboard!');
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="container-main py-12 px-4 max-w-2xl mx-auto">
        {/* Guest Hero Card */}
        <div className="card p-8 text-center bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-[#0F1520] border border-emerald-500/20 shadow-xl rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center font-heading text-2xl font-bold mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8] mb-2">
            Welcome to DevVegis
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#8B96A8] max-w-md mx-auto mb-6">
            Sign in to track your live orders, manage saved delivery addresses, and unlock exclusive farm coupons.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-8">
            <button
              onClick={() => openModal('signin')}
              className="btn-primary w-full sm:w-auto py-2.5 px-6 text-sm font-bold shadow-md"
            >
              Sign In / Register
            </button>
            <div className="w-full sm:w-auto shrink-0">
              <GoogleOAuthButton mode="signin" className="w-full sm:w-auto py-2.5 px-5" />
            </div>
          </div>

          {/* Perks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left border-t border-slate-100 dark:border-white/[0.08] pt-6">
            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-slate-100 dark:border-white/[0.05]">
              <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 mb-1">
                <span>⚡ Express Delivery</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#8B96A8]">
                Farm produce dispatched quickly from local dark store.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-slate-100 dark:border-white/[0.05]">
              <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 mb-1">
                <span>📍 Saved Addresses</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#8B96A8]">
                Save home and work locations for 1-tap checkout.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-slate-100 dark:border-white/[0.05]">
              <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 mb-1">
                <span>🛡️ Freshness Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#8B96A8]">
                Zero-question refunds if produce is below standard.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const referralCode = user?.id ? `DEVVEGIS-${user.id.slice(0, 6).toUpperCase()}` : 'DEVVEGIS100';

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
                {user?.name || 'Customer'}
              </h2>
              <p className="text-xs text-gray-500">{user?.email}</p>
              {user?.phone && (
                <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>+91 {user.phone}</span>
                </p>
              )}
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
              { id: 'addresses' as const, label: `Saved Addresses (${addresses.length})`, icon: MapPin },
              { id: 'coupons' as const, label: 'Coupons & Offers', icon: Tag },
              { id: 'refer' as const, label: 'Refer & Earn', icon: Share2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowAddressForm(false);
                  }}
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
            {/* Tab 1: Personal Information */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-gray-100">
                      Personal Information
                    </h3>
                    <p className="text-xs text-gray-500">
                      Manage your contact details and delivery phone number
                    </p>
                  </div>
                  <span className="badge-green text-xs">Customer Account</span>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (profileForm.phone && !/^\d{10}$/.test(profileForm.phone.trim())) {
                      toast.error('Please enter a valid 10-digit mobile number');
                      return;
                    }
                    updateProfileMutation.mutate(profileForm);
                  }}
                  className="space-y-4 max-w-lg"
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="input"
                      placeholder="Your full name"
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
                      className="input opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800/40"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Used for order receipts and verification.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Mobile Phone Number *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-semibold text-gray-500 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '') })}
                        className="input pl-12 font-mono text-sm tracking-wider"
                        placeholder="9876543210"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Delivery partners call this number for live order handoff & OTP.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Save Contact Details</span>
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
                className="space-y-6"
              >
                <div className="card p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-gray-100">
                        Saved Delivery Addresses
                      </h3>
                      <p className="text-xs text-gray-500">
                        Manage delivery locations for fast doorstep orders
                      </p>
                    </div>

                    {!showAddressForm && (
                      <button
                        onClick={handleOpenAddAddress}
                        className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Address</span>
                      </button>
                    )}
                  </div>

                  {/* Add / Edit Address Form */}
                  {showAddressForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 p-5 rounded-2xl border-2 border-green-500/30 bg-green-50/20 dark:bg-green-950/10 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-heading font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span>{editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}</span>
                        </h4>
                        <button
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddressId(null);
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Direct Capture Current Position Button */}
                      <div className="space-y-2 pt-1">
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={isDetectingLocation}
                          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-green-600/30 bg-green-600/10 hover:bg-green-600/20 active:scale-[0.99] text-green-700 dark:text-green-300 font-semibold text-xs sm:text-sm transition-all shadow-sm group"
                        >
                          {isDetectingLocation ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                              <span>Detecting GPS & reverse geocoding address...</span>
                            </>
                          ) : (
                            <>
                              <LocateFixed className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                              <span>Use Current Location (Auto-fill via GPS)</span>
                            </>
                          )}
                        </button>

                        {addressForm.latitude && addressForm.longitude && (
                          <div className="flex items-center justify-between text-[11px] px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>GPS coordinates mapped: <strong>{addressForm.latitude.toFixed(4)}, {addressForm.longitude.toFixed(4)}</strong></span>
                            </div>
                            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">High Accuracy</span>
                          </div>
                        )}
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!/^\d{10}$/.test(addressForm.phone.trim())) {
                            toast.error('Please enter a valid 10-digit phone number for delivery contact');
                            return;
                          }
                          if (!/^\d{6}$/.test(addressForm.pincode.trim())) {
                            toast.error('Please enter a valid 6-digit postal pincode');
                            return;
                          }
                          saveAddressMutation.mutate(addressForm);
                        }}
                        className="space-y-4"
                      >
                        {/* Label selector */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Address Tag
                          </label>
                          <div className="flex gap-2">
                            {[
                              { label: 'Home', icon: Home },
                              { label: 'Work', icon: Briefcase },
                              { label: 'Other', icon: Building },
                            ].map((tag) => {
                              const TagIcon = tag.icon;
                              const isSelected = addressForm.label.toUpperCase() === tag.label.toUpperCase();
                              return (
                                <button
                                  type="button"
                                  key={tag.label}
                                  onClick={() => setAddressForm({ ...addressForm, label: tag.label })}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                    isSelected
                                      ? 'bg-green-600 text-white shadow-sm'
                                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  <TagIcon className="w-3.5 h-3.5" />
                                  <span>{tag.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              Contact Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={addressForm.name}
                              onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                              className="input"
                              placeholder="Receiver's name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              Contact Phone (10 digits) *
                            </label>
                            <div className="relative flex items-center">
                              <span className="absolute left-3 text-xs font-semibold text-gray-500 select-none">
                                +91
                              </span>
                              <input
                                type="tel"
                                maxLength={10}
                                required
                                value={addressForm.phone}
                                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '') })}
                                className="input pl-12 font-mono text-xs"
                                placeholder="9876543210"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Flat, House no., Building, Company, Apartment, Street *
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.addressLine1}
                            onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                            className="input"
                            placeholder="e.g. Flat 302, Green Heights, 12th Main Road"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              Area, Street, Sector, Village
                            </label>
                            <input
                              type="text"
                              value={addressForm.addressLine2}
                              onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                              className="input"
                              placeholder="e.g. Indiranagar 2nd Stage"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              Landmark (Optional)
                            </label>
                            <input
                              type="text"
                              value={addressForm.landmark}
                              onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                              className="input"
                              placeholder="e.g. Near Metro Station / Behind City Hospital"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              City *
                            </label>
                            <input
                              type="text"
                              required
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="input"
                              placeholder="Bengaluru"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              State *
                            </label>
                            <input
                              type="text"
                              required
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              className="input"
                              placeholder="Karnataka"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                              Pincode (6 digits) *
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              required
                              value={addressForm.pincode}
                              onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })}
                              className="input font-mono"
                              placeholder="560038"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="rounded text-green-600 focus:ring-green-500"
                          />
                          <span>Set as default delivery address</span>
                        </label>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="submit"
                            disabled={saveAddressMutation.isPending}
                            className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
                          >
                            {saveAddressMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>{editingAddressId ? 'Update Address' : 'Save Address'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddressForm(false);
                              setEditingAddressId(null);
                            }}
                            className="btn-secondary text-xs py-2 px-4"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {/* Addresses List */}
                  {isLoadingAddresses ? (
                    <div className="space-y-3">
                      <div className="skeleton h-20 w-full rounded-xl" />
                      <div className="skeleton h-20 w-full rounded-xl" />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                      <MapPin className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">No saved addresses yet</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto mb-4">
                        Add your delivery address with contact phone number for ultra-fast doorstep dispatch.
                      </p>
                      <button
                        onClick={handleOpenAddAddress}
                        className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add First Address</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr: AddressItem) => (
                        <div
                          key={addr.id}
                          className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                            addr.isDefault
                              ? 'border-green-500/50 bg-green-50/20 dark:bg-green-950/10 shadow-sm'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase">
                                  {addr.label || 'Home'}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditAddress(addr)}
                                  className="text-gray-400 hover:text-green-600 p-1 rounded-lg transition-colors"
                                  title="Edit address"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('Are you sure you want to remove this address?')) {
                                      deleteAddressMutation.mutate(addr.id);
                                    }
                                  }}
                                  className="text-gray-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                                  title="Delete address"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {addr.name}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                              {addr.addressLine1}
                              {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                              {addr.landmark ? `, ${addr.landmark}` : ''}
                              , {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-green-600" />
                              <span>+91 {addr.phone}</span>
                            </p>
                          </div>

                          {!addr.isDefault && (
                            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
                              <button
                                onClick={() => setDefaultAddressMutation.mutate(addr.id)}
                                className="text-xs font-semibold text-green-600 hover:text-green-700 hover:underline"
                              >
                                Set as Default Address
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Tab 3: Coupons */}
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

            {/* Tab 4: Refer & Earn */}
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
                  Share your unique referral code. When your friend places their first DevVegis order, they get ₹50 off, and you get ₹100 discount coupon on your next fresh produce order!
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
