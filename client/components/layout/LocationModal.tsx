'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, LocateFixed, Check, Plus, Home, Briefcase, Building2, Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onSelectLocation: (locationStr: string) => void;
}

export default function LocationModal({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}: LocationModalProps) {
  const [manualInput, setManualInput] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      try {
        const res = await api.get('/addresses');
        return res.data.data || [];
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated && isOpen,
  });

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const suburb = data.address?.suburb || data.address?.neighbourhood || data.address?.residential || '';
            const city = data.address?.city || data.address?.town || data.address?.county || '';
            const pincode = data.address?.postcode || '';
            
            const locName = [suburb, city].filter(Boolean).join(', ') || pincode || 'Current Location';
            onSelectLocation(locName);
            localStorage.setItem('devvegis_user_location', locName);
            toast.success(`Location set to ${locName}`);
            onClose();
          } else {
            const fallback = `GPS Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
            onSelectLocation(fallback);
            localStorage.setItem('devvegis_user_location', fallback);
            onClose();
          }
        } catch {
          toast.error('Failed to resolve city name. Please enter your pincode or area manually.');
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === 1) {
          toast.error('Location permission denied. Please enter your location manually.');
        } else {
          toast.error('Could not detect location. Please type your pincode or area.');
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualInput.trim();
    if (!clean) return;

    if (clean.length < 3) {
      toast.error('Please enter at least 3 characters');
      return;
    }

    onSelectLocation(clean);
    localStorage.setItem('devvegis_user_location', clean);
    toast.success(`Delivery location updated to ${clean}`);
    setManualInput('');
    onClose();
  };

  const handleSelectAddress = async (addr: any) => {
    const locString = addr.landmark ? `${addr.landmark}, ${addr.city}` : `${addr.city} - ${addr.pincode}`;
    onSelectLocation(locString);
    localStorage.setItem('devvegis_user_location', locString);

    if (!addr.isDefault) {
      try {
        await api.put(`/addresses/${addr.id}`, { isDefault: true });
        queryClient.invalidateQueries({ queryKey: ['addresses'] });
      } catch {}
    }

    toast.success(`Delivering to ${addr.label} (${addr.city})`);
    onClose();
  };

  const getLabelIcon = (label: string) => {
    const l = String(label).toLowerCase();
    if (l === 'work') return <Briefcase className="w-4 h-4 text-amber-500" />;
    if (l === 'other') return <Building2 className="w-4 h-4 text-purple-500" />;
    return <Home className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#111915] border border-slate-200 dark:border-[#1e2e26] rounded-[4px] shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.07]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[2px] bg-emerald-500/15 flex items-center justify-center text-[#10B981]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-[#E8EEF8] text-base">Select Delivery Location</h3>
                  <p className="text-xs text-slate-500 dark:text-[#8B96A8]">Get accurate delivery times and local freshness</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-[2px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* GPS Auto-detect Button */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isDetecting}
                className="w-full flex items-center justify-between p-3.5 rounded-[2px] border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-[#34D399] active:translate-y-0.5 transition-all group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  {isDetecting ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#10B981]" />
                  ) : (
                    <LocateFixed className="w-5 h-5 text-[#10B981] group-hover:scale-110 transition-transform" />
                  )}
                  <div className="text-left">
                    <span className="text-xs font-bold block">
                      {isDetecting ? 'Detecting your GPS location...' : 'Use Current Location'}
                    </span>
                    <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">Using browser GPS</span>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded-[2px]">
                  FAST
                </span>
              </button>

              {/* Manual Input Form */}
              <form onSubmit={handleManualSubmit} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-[#8B96A8] block">
                  Or enter your Pincode / City
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="e.g. 560038, Koramangala, Sector 62..."
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#161E2E] border border-slate-200 dark:border-white/[0.08] rounded-[2px] text-xs text-slate-900 dark:text-[#E8EEF8] placeholder-slate-400 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs rounded-[2px] active:translate-y-0.5 transition-all cursor-pointer shrink-0 shadow-xs"
                  >
                    Apply
                  </button>
                </div>
              </form>

              {/* Saved Addresses Section (if logged in) */}
              {isAuthenticated ? (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/[0.07]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#8B96A8]">
                      Saved Addresses ({addresses.length})
                    </span>
                    <a
                      href="/profile"
                      className="text-xs font-semibold text-[#10B981] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Manage
                    </a>
                  </div>

                  {isLoadingAddresses ? (
                    <div className="py-4 text-center text-xs text-slate-400">Loading saved addresses...</div>
                  ) : addresses.length === 0 ? (
                    <div className="p-4 rounded-[2px] border border-dashed border-slate-200 dark:border-white/10 text-center space-y-1">
                      <p className="text-xs font-medium text-slate-600 dark:text-[#8B96A8]">No saved addresses yet</p>
                      <a href="/profile" className="text-xs font-bold text-[#10B981] inline-block hover:underline">
                        + Add an address in your Profile
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {addresses.map((addr: any) => {
                        const isMatch =
                          currentLocation.includes(addr.city) ||
                          (addr.landmark && currentLocation.includes(addr.landmark));

                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr)}
                            className={`p-3 rounded-[2px] border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              isMatch
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/40'
                                : 'bg-slate-50 dark:bg-[#161E2E] border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="mt-0.5 p-1.5 rounded-[2px] bg-white dark:bg-[#111915] border border-slate-200 dark:border-white/10">
                                {getLabelIcon(addr.label)}
                              </div>
                              <div className="text-left">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900 dark:text-[#E8EEF8]">
                                    {addr.label}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="text-[9px] font-extrabold bg-emerald-500/15 text-[#10B981] px-1.5 py-0.2 rounded-[2px] uppercase tracking-wide">
                                      DEFAULT
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-[#8B96A8] line-clamp-1 mt-0.5">
                                  {addr.addressLine1}, {addr.city} - {addr.pincode}
                                </p>
                              </div>
                            </div>
                            {isMatch && (
                              <div className="w-5 h-5 rounded-[2px] bg-[#10B981] text-white flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-[2px] bg-slate-50 dark:bg-[#161E2E] border border-slate-200 dark:border-white/[0.07] flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-[#8B96A8]">Sign in to access your saved addresses</span>
                  <a href="/login" className="font-bold text-[#10B981] hover:underline">
                    Sign In →
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
