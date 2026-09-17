'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  Image as ImageIcon, Plus, ExternalLink, Pencil, Trash2,
  X, Check, Loader2, ToggleLeft, ToggleRight, Eye
} from 'lucide-react';
import S3ImageUploader from '@/components/ui/S3ImageUploader';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const BANNER_TYPES = ['HERO', 'OFFER', 'CATEGORY', 'PRODUCT'] as const;

const emptyForm = {
  title: '',
  subtitle: '',
  imageUrl: '',
  linkType: 'URL',
  linkValue: '',
  type: 'HERO' as typeof BANNER_TYPES[number],
  isActive: true,
  sortOrder: 0,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const authHeader = () => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      // Fetch all banners including inactive for admin view
      const { data } = await axios.get(`${API}/banners/admin/all`, { headers: authHeader() });
      setBanners(data.data || []);
    } catch {
      // Fallback to public endpoint
      try {
        const { data } = await axios.get(`${API}/banners`);
        setBanners(data.data || []);
      } catch { toast.error('Failed to load banners'); }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBanners(); }, []);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (b: any) => {
    setEditId(b.id);
    setForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      imageUrl: b.imageUrl || '',
      linkType: b.linkType || 'URL',
      linkValue: b.linkValue || '',
      type: b.type || 'HERO',
      isActive: b.isActive,
      sortOrder: b.sortOrder || 0,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Banner title is required'); return; }
    if (!form.imageUrl.trim()) { toast.error('Image URL is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) };
      if (editId) {
        await axios.put(`${API}/banners/${editId}`, payload, { headers: authHeader() });
        toast.success('Banner updated — live on storefront!');
      } else {
        await axios.post(`${API}/banners`, payload, { headers: authHeader() });
        toast.success('Banner created and live!');
      }
      setShowModal(false);
      fetchBanners();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API}/banners/${id}`, { headers: authHeader() });
      toast.success('Banner deleted');
      fetchBanners();
    } catch { toast.error('Delete failed'); } finally { setDeletingId(null); }
  };

  const handleToggleActive = async (b: any) => {
    try {
      await axios.put(`${API}/banners/${b.id}`, { isActive: !b.isActive }, { headers: authHeader() });
      toast.success(`Banner ${b.isActive ? 'hidden' : 'activated'}`);
      fetchBanners();
    } catch { toast.error('Update failed'); }
  };

  const typeColors: Record<string, string> = {
    HERO: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    OFFER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    CATEGORY: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    PRODUCT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-green-600" /> Marketing Banners
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Create and manage storefront hero banners and promotional offers. Changes go live instantly.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Banner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {BANNER_TYPES.map(type => (
          <div key={type} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{type} Banners</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {banners.filter(b => b.type === type).length}
            </p>
          </div>
        ))}
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="h-40 bg-gray-100 dark:bg-gray-700 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No banners yet. Create your first banner!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map(b => (
            <div key={b.id} className={`bg-white dark:bg-gray-800 rounded-2xl border overflow-hidden transition-all ${b.isActive ? 'border-gray-100 dark:border-gray-700' : 'border-dashed border-gray-200 dark:border-gray-600 opacity-60'}`}>
              {/* Image Preview */}
              <div className="relative h-40 bg-gray-100 dark:bg-gray-700">
                {b.imageUrl ? (
                  <Image src={b.imageUrl} alt={b.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>
                )}
                {/* Type badge */}
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColors[b.type] || ''}`}>
                  {b.type}
                </span>
                {/* Active badge */}
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${b.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                  {b.isActive ? '● Live' : '○ Hidden'}
                </span>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">{b.title}</h3>
                {b.subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{b.subtitle}</p>}
                {b.linkValue && (
                  <a href={b.linkValue} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline">
                    <span className="truncate max-w-[150px]">{b.linkValue}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <button onClick={() => handleToggleActive(b)} className="transition-colors">
                    {b.isActive
                      ? <ToggleRight className="w-6 h-6 text-green-500" />
                      : <ToggleLeft className="w-6 h-6 text-gray-300 dark:text-gray-600" />}
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(b.id)} disabled={deletingId === b.id} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      {deletingId === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editId ? 'Edit Banner' : 'New Banner'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Up to 40% Off on Vegetables"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Subtitle</label>
                <input type="text" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                  placeholder="e.g. Weekend Flash Sale"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              <S3ImageUploader
                label="Banner Image"
                value={form.imageUrl}
                onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
                folder="banners"
                required
              />

              {/* Type + Sort Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Banner Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                    {BANNER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Sort Order</label>
                  <input type="number" min={0} value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              {/* CTA Link */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">CTA Link URL</label>
                <input type="url" value={form.linkValue} onChange={e => setForm(f => ({ ...f, linkValue: e.target.value }))}
                  placeholder="/categories/vegetables or https://..."
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Active (show on storefront)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editId ? 'Save Changes' : 'Create Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
