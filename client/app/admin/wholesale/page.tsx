'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Plus, Pencil, Trash2, X, Check, Loader2,
  TrendingUp, TrendingDown, Building2, ShieldCheck,
  RefreshCw, DollarSign, Users, Search, Package,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface MandiTicker {
  id: string;
  commodity: string;
  unit: string;
  modalPrice: number;
  change: string;
  isUp: boolean;
  arrivals: string | null;
  market: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface WholesaleBuyer {
  id: string;
  businessName: string;
  gstin: string;
  businessType: string;
  panNumber: string | null;
  isVerified: boolean;
  creditLimit: number;
  paymentTerms: number;
  createdAt: string;
  user: { id: string; name: string; email: string; phone: string | null; createdAt: string };
}

interface WholesaleProduct {
  id: string;
  name: string;
  price: number;
  wholesalePrice: number | null;
  unit: string;
  images: { url: string }[];
  category: { name: string } | null;
  inventory: { availableStock: number } | null;
}

const emptyTicker = {
  commodity: '',
  unit: 'kg',
  modalPrice: 0,
  change: '+0.0%',
  isUp: true,
  arrivals: '',
  market: '',
  sortOrder: 0,
};

export default function AdminWholesalePage() {
  const [tickers, setTickers] = useState<MandiTicker[]>([]);
  const [buyers, setBuyers] = useState<WholesaleBuyer[]>([]);
  const [products, setProducts] = useState<WholesaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'tickers' | 'buyers' | 'catalog'>('tickers');
  const [search, setSearch] = useState('');

  // Ticker modal
  const [showTickerModal, setShowTickerModal] = useState(false);
  const [editTickerId, setEditTickerId] = useState<string | null>(null);
  const [tickerForm, setTickerForm] = useState(emptyTicker);
  const [savingTicker, setSavingTicker] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Buyer verification
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const authHeader = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [t, b, p] = await Promise.allSettled([
        axios.get(`${API}/wholesale/admin/mandi-tickers`, { headers: authHeader() }),
        axios.get(`${API}/wholesale/admin/buyers`, { headers: authHeader() }),
        axios.get(`${API}/wholesale/products`, { headers: authHeader() }),
      ]);
      if (t.status === 'fulfilled') setTickers(t.value.data.data || []);
      if (b.status === 'fulfilled') setBuyers(b.value.data.data || []);
      if (p.status === 'fulfilled') setProducts(p.value.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Ticker CRUD ─────────────────────────────────────────────────────────────

  const openCreateTicker = () => {
    setEditTickerId(null);
    setTickerForm(emptyTicker);
    setShowTickerModal(true);
  };

  const openEditTicker = (t: MandiTicker) => {
    setEditTickerId(t.id);
    setTickerForm({
      commodity: t.commodity,
      unit: t.unit,
      modalPrice: t.modalPrice,
      change: t.change,
      isUp: t.isUp,
      arrivals: t.arrivals || '',
      market: t.market || '',
      sortOrder: t.sortOrder,
    });
    setShowTickerModal(true);
  };

  const handleSaveTicker = async () => {
    if (!tickerForm.commodity.trim()) { toast.error('Commodity name required'); return; }
    setSavingTicker(true);
    try {
      const payload = { ...tickerForm, modalPrice: Number(tickerForm.modalPrice), sortOrder: Number(tickerForm.sortOrder) };
      if (editTickerId) {
        await axios.patch(`${API}/wholesale/admin/mandi-tickers/${editTickerId}`, payload, { headers: authHeader() });
        toast.success('Ticker updated — live on wholesale portal!');
      } else {
        await axios.post(`${API}/wholesale/admin/mandi-tickers`, payload, { headers: authHeader() });
        toast.success('Ticker added to live APMC board!');
      }
      setShowTickerModal(false);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setSavingTicker(false);
    }
  };

  const handleDeleteTicker = async (id: string) => {
    if (!confirm('Delete this mandi commodity?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API}/wholesale/admin/mandi-tickers/${id}`, { headers: authHeader() });
      toast.success('Ticker removed');
      fetchAll();
    } catch { toast.error('Delete failed'); } finally { setDeletingId(null); }
  };

  // ── Buyer Verification ───────────────────────────────────────────────────────

  const handleVerifyBuyer = async (buyer: WholesaleBuyer, approve: boolean) => {
    setVerifyingId(buyer.id);
    try {
      await axios.patch(
        `${API}/wholesale/admin/buyers/${buyer.id}/verify`,
        { isVerified: approve, creditLimit: approve ? 500000 : 0 },
        { headers: authHeader() }
      );
      toast.success(approve ? `${buyer.businessName} approved! Credit line: ₹5,00,000` : `${buyer.businessName} rejected`);
      fetchAll();
    } catch { toast.error('Update failed'); } finally { setVerifyingId(null); }
  };

  // ── Filtered lists ───────────────────────────────────────────────────────────

  const filteredTickers = tickers.filter(t => t.commodity.toLowerCase().includes(search.toLowerCase()));
  const filteredBuyers = buyers.filter(b =>
    b.businessName.toLowerCase().includes(search.toLowerCase()) ||
    b.gstin.toLowerCase().includes(search.toLowerCase()) ||
    b.user.email.toLowerCase().includes(search.toLowerCase())
  );
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wholesale & Merchant Command Center</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage live APMC mandi tickers, merchant verification, and wholesale catalog.
          </p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Live Tickers', value: tickers.filter(t => t.isActive).length, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Wholesale Buyers', value: buyers.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Pending Verification', value: buyers.filter(b => !b.isVerified).length, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Wholesale Products', value: products.length, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-fit">
        {[
          { id: 'tickers', label: 'APMC Mandi Tickers' },
          { id: 'buyers', label: `Merchant Buyers (${buyers.length})` },
          { id: 'catalog', label: `Wholesale Catalog (${products.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id as any); setSearch(''); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + Actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${tab}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        {tab === 'tickers' && (
          <button
            onClick={openCreateTicker}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Commodity
          </button>
        )}
      </div>

      {/* ── TICKERS TAB ─────────────────────────────────────────────────────── */}
      {tab === 'tickers' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
          ) : filteredTickers.length === 0 ? (
            <div className="text-center py-16">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No mandi tickers yet. Add your first commodity.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    {['Commodity', 'Market', 'Modal Price', 'Change', 'Arrivals', 'Active', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTickers.map(t => (
                    <tr key={t.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-sm text-gray-900 dark:text-white">{t.commodity}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{t.market || '—'}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">₹{t.modalPrice.toFixed(1)}/{t.unit}</td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs font-semibold font-mono ${t.isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                          {t.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {t.change}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{t.arrivals || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${t.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {t.isActive ? '● Live' : '○ Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditTicker(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteTicker(t.id)} disabled={deletingId === t.id} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            {deletingId === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── BUYERS TAB ──────────────────────────────────────────────────────── */}
      {tab === 'buyers' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : filteredBuyers.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No merchant buyers registered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    {['Business', 'GSTIN', 'Type', 'Credit Limit', 'Terms', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBuyers.map(b => (
                    <tr key={b.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{b.businessName}</p>
                        <p className="text-xs text-gray-400">{b.user.name} · {b.user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-gray-300">{b.gstin}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{b.businessType}</td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {b.creditLimit > 0 ? `₹${(b.creditLimit / 100000).toFixed(1)}L` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">Net-{b.paymentTerms}</td>
                      <td className="px-4 py-3">
                        {b.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <AlertCircle className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {!b.isVerified && (
                            <button
                              onClick={() => handleVerifyBuyer(b, true)}
                              disabled={verifyingId === b.id}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors"
                            >
                              {verifyingId === b.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                              Approve
                            </button>
                          )}
                          {b.isVerified && (
                            <button
                              onClick={() => handleVerifyBuyer(b, false)}
                              disabled={verifyingId === b.id}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-600 text-xs font-semibold transition-colors border border-red-200 dark:border-red-800"
                            >
                              {verifyingId === b.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── CATALOG TAB ─────────────────────────────────────────────────────── */}
      {tab === 'catalog' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No wholesale products. Add wholesale pricing to products in the Products section.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    {['Product', 'Category', 'Retail ₹', 'Wholesale ₹', 'Margin', 'Stock'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => {
                    const margin = p.wholesalePrice ? Math.round(((p.price - p.wholesalePrice) / p.price) * 100) : null;
                    return (
                      <tr key={p.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {p.images?.[0] && (
                              <img src={p.images[0].url} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-600" />
                            )}
                            <div>
                              <p className="font-semibold text-sm text-gray-900 dark:text-white">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.unit}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{p.category?.name || '—'}</td>
                        <td className="px-4 py-3 font-semibold text-sm text-gray-700 dark:text-gray-300">₹{p.price}</td>
                        <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">₹{p.wholesalePrice?.toFixed(1) || '—'}</td>
                        <td className="px-4 py-3">
                          {margin !== null ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                              {margin}% off retail
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {p.inventory?.availableStock ?? '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Mandi Ticker Modal ────────────────────────────────────────────────── */}
      {showTickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editTickerId ? 'Edit Mandi Commodity' : 'Add Mandi Commodity'}
              </h2>
              <button onClick={() => setShowTickerModal(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Commodity Name *</label>
                <input
                  type="text"
                  value={tickerForm.commodity}
                  onChange={e => setTickerForm(f => ({ ...f, commodity: e.target.value }))}
                  placeholder="e.g. Nashik Red Onion"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Modal Price (₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tickerForm.modalPrice}
                    onChange={e => setTickerForm(f => ({ ...f, modalPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Unit</label>
                  <select
                    value={tickerForm.unit}
                    onChange={e => setTickerForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="kg">per kg</option>
                    <option value="quintal">per quintal</option>
                    <option value="piece">per piece</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Change %</label>
                  <input
                    type="text"
                    value={tickerForm.change}
                    onChange={e => setTickerForm(f => ({ ...f, change: e.target.value }))}
                    placeholder="+1.8% or -0.9%"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Trend</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTickerForm(f => ({ ...f, isUp: true }))}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${tickerForm.isUp ? 'bg-emerald-500 text-white border-emerald-500' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" /> Up
                    </button>
                    <button
                      onClick={() => setTickerForm(f => ({ ...f, isUp: false }))}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${!tickerForm.isUp ? 'bg-red-500 text-white border-red-500' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <TrendingDown className="w-3.5 h-3.5" /> Down
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Market / Mandi</label>
                  <input
                    type="text"
                    value={tickerForm.market}
                    onChange={e => setTickerForm(f => ({ ...f, market: e.target.value }))}
                    placeholder="Vashi, Azadpur..."
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Arrivals Volume</label>
                  <input
                    type="text"
                    value={tickerForm.arrivals}
                    onChange={e => setTickerForm(f => ({ ...f, arrivals: e.target.value }))}
                    placeholder="4,200 Qtl"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => setShowTickerModal(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSaveTicker}
                disabled={savingTicker}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {savingTicker ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editTickerId ? 'Update Ticker' : 'Add to Board'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
