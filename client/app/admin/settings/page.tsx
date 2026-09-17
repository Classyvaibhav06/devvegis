'use client';

import { useState, useEffect } from 'react';
import { Settings, Sliders, Database, CheckCircle2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    targetDeliveryTime: 12,
    baseDeliveryFee: 25,
    freeDeliveryThreshold: 199,
    darkstoreRadiusKm: 5,
    instantDeliverySlot: '10-15 Min',
    eveningDeliverySlot: '6 PM - 9 PM',
    morningDeliverySlot: '7 AM - 9 AM',
    expressWholesaleMinOrder: 2000,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings');
      if (res.data?.success && res.data?.data) {
        setFormData((prev) => ({ ...prev, ...res.data.data }));
      }
    } catch (err: any) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/admin/settings', formData);
      if (res.data?.success) {
        toast.success('Platform settings saved successfully and active live!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-green-600" />
          <span>Platform Settings</span>
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure quick-commerce delivery SLAs, darkstore operational radius, and store preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery SLAs */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-gray-100">
            <Sliders className="w-4 h-4 text-green-600" />
            <span>Fulfillment Dispatch SLA & Fees</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Target Delivery Time (Minutes)</label>
                <input
                  type="number"
                  value={formData.targetDeliveryTime}
                  onChange={(e) => setFormData({ ...formData, targetDeliveryTime: Number(e.target.value) })}
                  className="input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Base Delivery Fee (₹)</label>
                <input
                  type="number"
                  value={formData.baseDeliveryFee}
                  onChange={(e) => setFormData({ ...formData, baseDeliveryFee: Number(e.target.value) })}
                  className="input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Free Delivery Threshold (₹)</label>
                <input
                  type="number"
                  value={formData.freeDeliveryThreshold}
                  onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: Number(e.target.value) })}
                  className="input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Darkstore Delivery Radius (KM)</label>
                <input
                  type="number"
                  value={formData.darkstoreRadiusKm}
                  onChange={(e) => setFormData({ ...formData, darkstoreRadiusKm: Number(e.target.value) })}
                  className="input text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary text-xs py-2.5 w-full mt-2 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Delivery Rules</span>
              </button>
            </div>
          )}
        </div>

        {/* Delivery Slot Windows */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-gray-100">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Storefront Delivery Slots</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Instant Slot Window</label>
              <input
                type="text"
                value={formData.instantDeliverySlot}
                onChange={(e) => setFormData({ ...formData, instantDeliverySlot: e.target.value })}
                className="input text-xs"
                placeholder="10-15 Min"
              />
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Evening Slot Window</label>
              <input
                type="text"
                value={formData.eveningDeliverySlot}
                onChange={(e) => setFormData({ ...formData, eveningDeliverySlot: e.target.value })}
                className="input text-xs"
                placeholder="6 PM - 9 PM"
              />
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Morning Slot Window</label>
              <input
                type="text"
                value={formData.morningDeliverySlot}
                onChange={(e) => setFormData({ ...formData, morningDeliverySlot: e.target.value })}
                className="input text-xs"
                placeholder="7 AM - 9 AM"
              />
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-400 mb-1 font-medium">Wholesale Minimum Order (₹)</label>
              <input
                type="number"
                value={formData.expressWholesaleMinOrder}
                onChange={(e) => setFormData({ ...formData, expressWholesaleMinOrder: Number(e.target.value) })}
                className="input text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-secondary text-xs py-2.5 w-full mt-2 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Slot Windows</span>
            </button>
          </div>
        </div>

        {/* Database & Cloud Info */}
        <div className="card p-5 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-gray-100">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Infrastructure Status</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-gray-500 block">Database</span>
              <span className="font-semibold text-green-600 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Neon Serverless Postgres
              </span>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-gray-500 block">Storage Driver</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 block mt-1">
                Neon S3 Blob Storage
              </span>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="text-gray-500 block">Live Storefront Sync</span>
              <span className="badge-green inline-block mt-1">Real-time DB Active</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
