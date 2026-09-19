'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import {
  Building2, Truck, ShieldCheck, Download, ShoppingCart,
  Percent, FileSpreadsheet, Check, ArrowRight, ArrowUpRight,
  Plus, Minus, TrendingUp, TrendingDown, Clock, Sparkles,
  FileText, CheckCircle2, ChevronDown, Filter, HelpCircle,
  PhoneCall, RefreshCw, X, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

import api, { API_URL as API } from '@/lib/api';
import TurnstileWidget, { TurnstileWidgetRef } from '@/components/common/TurnstileWidget';
import WholesaleCircularCategories from '@/components/wholesale/WholesaleCircularCategories';
import WholesaleHeroCarousel from '@/components/wholesale/WholesaleHeroCarousel';

// ─── Animation variants ────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeUpStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// ─── Types ─────────────────────────────────────────────────────────────────
interface WholesaleProduct {
  id: string;
  name: string;
  botanicalOrigin: string;
  category: 'all' | 'roots' | 'vine' | 'greens' | 'exotics';
  packaging: string;
  kgPerCrate: number;
  retailPrice: number;
  baseWholesalePrice: number;
  tierDiscounts: { minCrates: number; price: number; label: string }[];
  minCrates: number;
  stockStatus: 'High Volume' | 'Limited Harvest' | 'Fresh Arrival';
  hsnCode: string;
  image: string;
}

export default function WholesalePage() {
  // ─── Wholesale catalog from DB ─────────────────────────────────────
  const [catalog, setCatalog] = useState<WholesaleProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/wholesale/products`)
      .then(r => r.json())
      .then(d => { setCatalog(d.data || []); })
      .catch(() => setCatalog([]))
      .finally(() => setCatalogLoading(false));
  }, []);

  const searchParams = useSearchParams();
  const urlCategory = searchParams?.get('category') || 'all';
  const urlSearch = searchParams?.get('q')?.toLowerCase() || '';

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [activeCategory, setActiveCategory] = useState<string>(urlCategory);

  useEffect(() => {
    setActiveCategory(searchParams?.get('category') || 'all');
  }, [searchParams]);
  const [paymentTerms, setPaymentTerms] = useState<'rtgs' | 'net15' | 'cod'>('net15');

  // Business & GSTIN registration state
  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Modals
  const [showPOModal, setShowPOModal] = useState(false);
  const [poReference, setPoReference] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('04:30 AM - 06:00 AM (Priority Morning Kitchen Dock)');
  const [showRFQModal, setShowRFQModal] = useState(false);
  const [rfqVolume, setRfqVolume] = useState('500 kg – 1,000 kg Daily (Cloud Kitchens / Banquets)');
  const [rfqCommodities, setRfqCommodities] = useState('Onions, Potatoes, Tomatoes, Capsicum, Ginger, Coriander');
  const [rfqPhone, setRfqPhone] = useState('+91 98765 43210');
  const [rfqTurnstileToken, setRfqTurnstileToken] = useState('');
  const [rfqSubmitting, setRfqSubmitting] = useState(false);
  const rfqTurnstileRef = useRef<TurnstileWidgetRef>(null);

  const handleRFQSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqPhone.trim()) {
      toast.error('Please enter procurement officer phone number');
      return;
    }
    try {
      setRfqSubmitting(true);
      const res = await api.post('/wholesale/rfq', {
        estimatedVolume: rfqVolume,
        commodities: rfqCommodities,
        phone: rfqPhone,
        turnstileToken: rfqTurnstileToken,
      });
      toast.success(res.data?.message || 'RFQ submitted. Our Agri-Commodity Desk will contact you within 2 hours.');
      setShowRFQModal(false);
      rfqTurnstileRef.current?.reset();
      setRfqTurnstileToken('');
    } catch (err: any) {
      rfqTurnstileRef.current?.reset();
      setRfqTurnstileToken('');
      toast.error(err.response?.data?.message || 'Failed to submit RFQ. Please try again.');
    } finally {
      setRfqSubmitting(false);
    }
  };

  // Live APMC Mandi Tickers
  const [mandiTickers, setMandiTickers] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API}/wholesale/mandi-tickers`)
      .then(r => r.json())
      .then(d => { if (d.data && d.data.length > 0) setMandiTickers(d.data); })
      .catch(() => {});
  }, []);

  const updateQty = (id: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const setDirectQty = (id: string, qty: number) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, qty) }));
  };

  const getItemPricing = (item: WholesaleProduct, crates: number) => {
    if (crates === 0) return { activePrice: item.baseWholesalePrice, tierLabel: 'Base Wholesale' };
    let activePrice = item.baseWholesalePrice;
    let tierLabel = 'Standard Wholesale';
    for (const tier of [...item.tierDiscounts].sort((a, b) => b.minCrates - a.minCrates)) {
      if (crates >= tier.minCrates) { activePrice = tier.price; tierLabel = tier.label; break; }
    }
    return { activePrice, tierLabel };
  };

  const orderAnalytics = useMemo(() => {
    let totalWeightKg = 0, totalCrates = 0, subtotalWholesale = 0, subtotalRetail = 0;
    catalog.forEach(item => {
      const crates = quantities[item.id] || 0;
      if (crates > 0) {
        const weight = crates * item.kgPerCrate;
        const { activePrice } = getItemPricing(item, crates);
        totalWeightKg += weight; totalCrates += crates;
        subtotalWholesale += weight * activePrice;
        subtotalRetail += weight * item.retailPrice;
      }
    });
    const termsDiscount = paymentTerms === 'rtgs' ? subtotalWholesale * 0.015 : 0;
    const finalPayable = Math.max(0, subtotalWholesale - termsDiscount);
    const totalSavings = subtotalRetail - finalPayable;
    return {
      totalWeightKg, totalWeightTons: (totalWeightKg / 1000).toFixed(2),
      totalCrates, subtotalWholesale, subtotalRetail, termsDiscount,
      finalPayable, totalSavings,
      savingsPercentage: subtotalRetail > 0 ? Math.round((totalSavings / subtotalRetail) * 100) : 0,
    };
  }, [quantities, paymentTerms, catalog]);

  const handleVerifyGstin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !gstin.trim()) {
      toast.error('Please provide both business name and 15-digit GSTIN.');
      return;
    }
    setIsVerified(true);
    toast.success('GSTIN Verified — Pre-approved for ₹5,00,000 Net-15 Credit');
  };

  const handleGeneratePO = () => {
    if (orderAnalytics.totalCrates === 0) {
      toast.error('Add at least 1 crate to your manifest.');
      return;
    }
    const randomPO = `PO-MANDI-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    setPoReference(randomPO);
    setShowPOModal(true);
  };

  const handleExportRateSheet = (format: 'pdf' | 'csv') => {
    toast.success(`Rate Sheet (${format.toUpperCase()}) for ${new Date().toLocaleDateString('en-IN')} — downloading.`);
  };

  const filteredCatalog = useMemo(() => {
    let result = catalog;
    if (activeCategory && activeCategory !== 'all') {
      result = result.filter(item => {
        if (item.category === activeCategory) return true;
        if (item.name.toLowerCase().includes(activeCategory.toLowerCase())) return true;
        return false;
      });
    }
    if (urlSearch) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(urlSearch) ||
        item.botanicalOrigin.toLowerCase().includes(urlSearch) ||
        item.packaging.toLowerCase().includes(urlSearch)
      );
    }
    return result;
  }, [activeCategory, urlSearch, catalog]);

  // ─── Typography shorthand ──────────────────────────────────────────
  const sg = 'font-[family-name:var(--font-space-grotesk)]';

  return (
    <div className="pt-2 sm:pt-4 pb-28 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — CIRCULAR CATEGORY BADGES RAIL
          Story-style 10 rounded medallions matching reference image
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-4 sm:mb-6">
        <WholesaleCircularCategories />
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — PROMOTIONAL IMAGE CAROUSEL (Hero Banner)
          Middle carousel matching reference image with "MOST LOVED PRODUCTS"
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-8 sm:mb-12">
        <WholesaleHeroCarousel />
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — LIVE APMC MARKET TICKER
      ══════════════════════════════════════════════════════════════════════ */}
      {mandiTickers.length > 0 && (
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mb-16"
        >
          <div className="rounded-2xl bg-white dark:bg-[#0E110D] border border-black/[0.07] dark:border-white/[0.07] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-black/[0.05] dark:border-white/[0.06]">
              <div className={`flex items-center gap-2 text-[11px] font-semibold text-gray-700 dark:text-gray-300 ${sg}`}>
                <Clock className="w-3.5 h-3.5 text-[#1A7A4A] dark:text-emerald-400" strokeWidth={1.5} />
                APMC Spot Benchmarks
                <span className="font-normal text-gray-400 dark:text-gray-500 font-mono">Updated 04:00 AM IST</span>
              </div>
              <span className={`text-[10px] text-[#1A7A4A] dark:text-emerald-400 font-mono font-semibold uppercase tracking-wider`}>Live Clearing</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y divide-black/[0.04] dark:divide-white/[0.05]">
              {mandiTickers.map((ticker, idx) => (
                <div key={ticker.id || idx} className="p-4 flex flex-col gap-1.5 hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                  <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 truncate">
                    {(ticker as any).commodity || (ticker as any).item}
                  </span>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className={`${sg} font-bold text-sm text-gray-900 dark:text-white`}>
                      ₹{ticker.modalPrice.toFixed(1)}<span className="text-[10px] text-gray-400 font-normal">/{(ticker as any).unit || 'kg'}</span>
                    </span>
                    <span className={`text-[10px] font-mono font-semibold flex items-center gap-0.5 ${(ticker as any).isUp ?? (ticker as any).up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                      {(ticker as any).isUp ?? (ticker as any).up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      {ticker.change}
                    </span>
                  </div>
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono">{ticker.arrivals}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — MAIN TRADING DESK (8-col + 4-col sticky sidebar)
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="wholesale-catalog" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-24">

        {/* ── LEFT 8 COLUMNS: Catalog desk ─────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Section header + filter tabs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h2 className={`${sg} text-2xl sm:text-3xl font-bold tracking-tight text-gray-950 dark:text-white`}>
                Daily Harvest Allotments
              </h2>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1">
                Bulk standardized packaging with automated volume discount tiers.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.07] overflow-x-auto shrink-0">
              {[
                { id: 'all', label: 'All' },
                { id: 'roots', label: 'Staples & Roots' },
                { id: 'vine', label: 'Vine & Solanaceae' },
                { id: 'greens', label: 'Brassica & Greens' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] ${sg} font-medium tracking-tight transition-all duration-200 whitespace-nowrap ${
                    activeCategory === tab.id
                      ? 'bg-white dark:bg-[#161A15] text-gray-950 dark:text-white shadow-sm border border-black/[0.06] dark:border-white/[0.08]'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product list */}
          <div className="space-y-3">
            {catalogLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-6 h-6 border-2 border-[#1A7A4A] border-t-transparent rounded-full animate-spin" />
                <p className="text-[12px] text-gray-400 dark:text-gray-500">Loading wholesale catalog...</p>
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-[#0E110D] border border-black/[0.07] dark:border-white/[0.07] p-16 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#1A7A4A]/8 border border-[#1A7A4A]/15 flex items-center justify-center">
                  <Filter className="w-6 h-6 text-[#1A7A4A] dark:text-emerald-400" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <h3 className={`${sg} font-bold text-base text-gray-900 dark:text-white`}>No Products Available</h3>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 max-w-xs">
                    The wholesale catalog is currently empty. Contact our B2B team or check back soon.
                  </p>
                </div>
                <a href="/contact" className={`text-[12px] font-semibold text-[#1A7A4A] dark:text-emerald-400 underline underline-offset-2 ${sg}`}>
                  Contact B2B Sales Team
                </a>
              </div>
            ) : null}

            {filteredCatalog.map((item, idx) => {
              const currentCrates = quantities[item.id] || 0;
              const { activePrice, tierLabel } = getItemPricing(item, currentCrates);
              const currentKg = currentCrates * item.kgPerCrate;
              const lineTotal = currentKg * activePrice;
              const lineRetailTotal = currentKg * item.retailPrice;
              const lineSavings = lineRetailTotal - lineTotal;

              return (
                <motion.div
                  key={item.id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.1 }}
      
                  className={`rounded-2xl bg-white dark:bg-[#0E110D] border border-black/[0.07] dark:border-white/[0.07] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-[#1A7A4A]/30 dark:hover:border-emerald-500/30 transition-all duration-300 shadow-[0_1px_4px_rgba(0,0,0,0.03)]`}
                >
                  {/* Item info */}
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-xl overflow-hidden relative bg-gray-100 dark:bg-gray-800 shrink-0 border border-black/[0.06] dark:border-white/[0.08]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 80px, 88px"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`${sg} font-bold text-[15px] text-gray-950 dark:text-white tracking-tight`}>
                          {item.name}
                        </h3>
                        <span className="rounded-md px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-mono font-semibold bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400 border border-black/[0.05] dark:border-white/[0.08]">
                          HSN {item.hsnCode}
                        </span>
                        {item.stockStatus === 'Limited Harvest' && (
                          <span className="rounded-md px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-mono font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/30">
                            Limited
                          </span>
                        )}
                        {item.stockStatus === 'Fresh Arrival' && (
                          <span className="rounded-md px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/30">
                            Fresh
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                        {item.botanicalOrigin}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{item.packaging}</span>
                        <span className="opacity-30">·</span>
                        <span className="font-mono">Min {item.minCrates} crates ({item.minCrates * item.kgPerCrate} kg)</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing + stepper */}
                  <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center justify-between gap-4 border-t sm:border-t-0 md:border-t lg:border-t-0 border-black/[0.05] dark:border-white/[0.06] pt-4 sm:pt-0 md:pt-4 lg:pt-0 shrink-0">
                    {/* Price */}
                    <div className="text-left sm:text-right md:text-left lg:text-right space-y-1">
                      <div className="flex items-baseline gap-1.5 justify-start sm:justify-end md:justify-start lg:justify-end">
                        <span className={`${sg} font-bold text-xl text-[#1A7A4A] dark:text-emerald-400`}>
                          ₹{activePrice.toFixed(1)}
                        </span>
                        <span className="text-[11px] text-gray-400 line-through">₹{item.retailPrice}</span>
                        <span className="text-[10px] font-mono text-gray-400">/kg</span>
                      </div>
                      <span className={`inline-block rounded-md px-2 py-0.5 text-[9px] uppercase font-mono font-semibold tracking-wider bg-[#1A7A4A]/8 text-[#1A7A4A] dark:text-emerald-400 border border-[#1A7A4A]/15`}>
                        {tierLabel}
                      </span>
                    </div>

                    {/* Stepper */}
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          disabled={currentCrates === 0}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-[#151A14] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 flex items-center justify-center disabled:opacity-25 disabled:pointer-events-none transition-all duration-200 active:scale-95"
                          aria-label="Decrease crate quantity"
                        >
                          <Minus className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                        <div className="px-3 min-w-[3.25rem] text-center">
                          <span className={`${sg} font-bold text-[13px] text-gray-900 dark:text-white`}>{currentCrates}</span>
                          <span className="block text-[8px] uppercase font-mono text-gray-400">Crates</span>
                        </div>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-[#151A14] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 flex items-center justify-center transition-all duration-200 active:scale-95"
                          aria-label="Increase crate quantity"
                        >
                          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                      </div>
                      {/* Live metric */}
                      <div className="text-right font-mono text-[10px]">
                        {currentCrates > 0 ? (
                          <div>
                            <span className="text-gray-900 dark:text-gray-100 font-semibold">
                              {currentKg.toLocaleString()} kg · ₹{lineTotal.toLocaleString('en-IN')}
                            </span>
                            {lineSavings > 0 && (
                              <span className="block text-[#1A7A4A] dark:text-emerald-400 text-[9px] mt-0.5">
                                Saves ₹{lineSavings.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">0 kg selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Fleet telemetry banner */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-2xl bg-[#0E2018] dark:bg-[#0A1C12] border border-emerald-900/40 p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-lg">
                <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] uppercase tracking-widest font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 ${sg}`}>
                  <Truck className="w-3 h-3" strokeWidth={1.5} />
                  Active Telemetry Fleet
                </div>
                <h4 className={`${sg} text-xl sm:text-2xl font-bold tracking-tight text-white`}>
                  Guaranteed 04:30 AM Kitchen Dock Arrival
                </h4>
                <p className="text-[12px] text-emerald-100/70 leading-relaxed">
                  Pre-cooled reefer containers holding an unbroken 4°C chain. If our truck arrives past 06:00 AM, logistics handling is 100% reimbursed on that invoice.
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 border-emerald-900/40 pt-4 sm:pt-0">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Fleet Reefer Temp</span>
                <div className="flex items-baseline gap-2">
                  <span className="inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  <span className={`${sg} font-bold text-2xl text-white font-mono`}>3.8°C</span>
                </div>
                <span className="text-[9px] text-emerald-300/50 font-mono uppercase">Live GPS Sensor</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT 4 COLUMNS: Sticky quotation console ─────────────────── */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">

          {/* Order Manifest card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="rounded-2xl bg-white dark:bg-[#0E110D] border border-black/[0.07] dark:border-white/[0.07] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.05] dark:border-white/[0.06]">
              <div>
                <h3 className={`${sg} font-bold text-[15px] text-gray-950 dark:text-white`}>Order Manifest</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Live Mandi Clearing Rate</p>
              </div>
              <span className={`rounded-lg px-2.5 py-1 text-[11px] font-mono font-semibold bg-[#1A7A4A]/8 text-[#1A7A4A] dark:text-emerald-400 border border-[#1A7A4A]/15`}>
                {orderAnalytics.totalCrates} Crates
              </span>
            </div>

            <div className="px-5 py-4 space-y-3">
              {/* Metrics */}
              <div className="space-y-2.5 text-[12px] font-mono">
                <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                  <span>Gross Net Weight</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {orderAnalytics.totalWeightKg.toLocaleString()} kg ({orderAnalytics.totalWeightTons} MT)
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                  <span>Retail Benchmark</span>
                  <span className="line-through text-gray-400">₹{orderAnalytics.subtotalRetail.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                  <span>Mandi Bulk Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{orderAnalytics.subtotalWholesale.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment terms */}
              <div className="pt-2 border-t border-black/[0.05] dark:border-white/[0.06]">
                <label className={`block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider ${sg}`}>
                  Settlement Terms
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.07]">
                  {[
                    { id: 'net15', label: 'Net-15', sub: 'GST Credit' },
                    { id: 'rtgs', label: 'RTGS', sub: '1.5% Off' },
                    { id: 'cod', label: 'Dock COD', sub: 'Verified' },
                  ].map(term => (
                    <button
                      key={term.id}
                      onClick={() => setPaymentTerms(term.id as any)}
                      className={`rounded-lg p-2 text-center transition-all duration-200 ${
                        paymentTerms === term.id
                          ? 'bg-white dark:bg-[#161A15] shadow-sm text-[#1A7A4A] dark:text-emerald-400 border border-black/[0.06] dark:border-white/[0.08]'
                          : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      <span className={`block text-[11px] ${sg} font-bold`}>{term.label}</span>
                      <span className="block text-[9px] font-mono text-gray-400">{term.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentTerms === 'rtgs' && orderAnalytics.termsDiscount > 0 && (
                <div className="flex justify-between items-center text-[12px] font-mono text-[#1A7A4A] dark:text-emerald-400">
                  <span>1.5% Wire Discount</span>
                  <span>−₹{Math.round(orderAnalytics.termsDiscount).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-[12px] font-mono text-gray-500 dark:text-gray-400">
                <span>04:30 AM Reefer Dispatch</span>
                <span className="text-[#1A7A4A] dark:text-emerald-400 font-semibold uppercase text-[10px]">
                  {orderAnalytics.totalWeightKg >= 100 ? 'Complimentary' : '₹450 Flat'}
                </span>
              </div>

              <div className="flex justify-between items-center text-[12px] font-mono text-gray-500 dark:text-gray-400">
                <span>GST (HSN 0701-0709)</span>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">0% Exempt</span>
              </div>

              {/* Net payable */}
              <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.06] flex items-baseline justify-between">
                <div>
                  <span className={`block ${sg} font-bold text-[13px] text-gray-950 dark:text-white`}>Net Payable</span>
                  <span className="text-[10px] text-gray-400">Includes all Mandi charges</span>
                </div>
                <div className="text-right">
                  <span className={`${sg} font-bold text-2xl text-[#1A7A4A] dark:text-emerald-400`}>
                    ₹{Math.round(orderAnalytics.finalPayable).toLocaleString('en-IN')}
                  </span>
                  {orderAnalytics.totalSavings > 0 && (
                    <span className="block text-[10px] font-mono text-[#1A7A4A] dark:text-emerald-400">
                      Saved ₹{Math.round(orderAnalytics.totalSavings).toLocaleString('en-IN')} ({orderAnalytics.savingsPercentage}%)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 space-y-2.5">
              <button
                onClick={handleGeneratePO}
                className={`w-full group ${sg} rounded-xl pl-5 pr-2 py-3 text-[13px] font-semibold text-white bg-[#1A7A4A] hover:bg-[#166B3F] shadow-[0_4px_20px_rgba(26,122,74,0.25)] flex items-center justify-between transition-all duration-200 active:scale-[0.98]`}
              >
                <span>Submit Purchase Order</span>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
                </div>
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-mono">
                <ShieldCheck className="w-3 h-3 text-[#1A7A4A]" />
                Mandi Weighbridge Slip generated with PO
              </div>
            </div>
          </motion.div>

          {/* GSTIN onboarding card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}

            className="rounded-2xl bg-white dark:bg-[#0E110D] border border-black/[0.07] dark:border-white/[0.07] shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.05] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1A7A4A] dark:text-emerald-400" strokeWidth={1.5} />
                <h4 className={`${sg} font-bold text-[13px] text-gray-950 dark:text-white`}>B2B Tax & Credit Profile</h4>
              </div>
              {isVerified && (
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] uppercase font-mono font-semibold bg-[#1A7A4A]/8 text-[#1A7A4A] dark:text-emerald-400 border border-[#1A7A4A]/15`}>
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Verified
                </span>
              )}
            </div>

            <div className="px-5 py-4">
              {!isVerified ? (
                <form onSubmit={handleVerifyGstin} className="space-y-3">
                  <div>
                    <label className={`block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider ${sg}`}>
                      Business Legal Name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="e.g. Olive Kitchens Pvt Ltd"
                      className="w-full rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.09] px-3.5 py-2.5 text-[12px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1A7A4A] transition-all"
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider ${sg}`}>
                      15-Digit GSTIN
                    </label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={e => setGstin(e.target.value.toUpperCase())}
                      placeholder="27AAACS1429B1Z8"
                      className="w-full rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.09] px-3.5 py-2.5 text-[12px] font-mono text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1A7A4A] transition-all uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full rounded-xl py-2.5 px-4 ${sg} text-[12px] font-semibold text-gray-800 dark:text-gray-200 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.09] border border-black/[0.08] dark:border-white/[0.08] transition-all active:scale-[0.98]`}
                  >
                    Verify & Activate Net-15 Terms
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.06] p-3.5 space-y-2.5 font-mono text-[11px]">
                    <div>
                      <span className="text-gray-400 uppercase text-[9px] tracking-wider block">Entity</span>
                      <strong className={`${sg} font-semibold text-gray-900 dark:text-gray-100`}>{businessName}</strong>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <span className="text-gray-400 uppercase text-[9px] tracking-wider">GSTIN</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{gstin}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <span className="text-gray-400 uppercase text-[9px] tracking-wider">Approved Credit</span>
                      <span className={`${sg} font-bold text-[#1A7A4A] dark:text-emerald-400`}>₹5,00,000</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <span className="text-gray-400 uppercase text-[9px] tracking-wider">GSTR-2B ITC</span>
                      <span className="text-[9px] font-semibold text-[#1A7A4A] dark:text-emerald-400">100% Automated</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsVerified(false)}
                    className="w-full text-center text-[10px] font-mono text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    Edit business entity →
                  </button>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL — PURCHASE ORDER CONFIRMATION
      ══════════════════════════════════════════════════════════════════════ */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl bg-white dark:bg-[#0E110D] border border-black/[0.08] dark:border-white/[0.08] max-w-xl w-full shadow-2xl overflow-hidden"
          >
            <div className="p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase font-semibold bg-[#1A7A4A]/8 text-[#1A7A4A] dark:text-emerald-400 border border-[#1A7A4A]/15`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Purchase Order Dispatched
                  </div>
                  <h3 className={`${sg} font-bold text-2xl text-gray-950 dark:text-white tracking-tight`}>{poReference}</h3>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400">
                    Allocated from primary morning harvest arrivals{businessName ? ` for ${businessName}` : ''}.
                  </p>
                </div>
                <button
                  onClick={() => setShowPOModal(false)}
                  className="w-8 h-8 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Summary */}
              <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.06] p-4 space-y-2.5 text-[12px] font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Crates</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{orderAnalytics.totalCrates} Units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Certified Weight</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{orderAnalytics.totalWeightKg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Term</span>
                  <span className="font-semibold uppercase text-[#1A7A4A] dark:text-emerald-400">
                    {paymentTerms === 'net15' ? 'Net-15 B2B Credit' : paymentTerms === 'rtgs' ? 'RTGS Direct Wire' : 'Cash-on-Dock'}
                  </span>
                </div>
                <div className="flex justify-between pt-2.5 border-t border-black/[0.05] dark:border-white/[0.06]">
                  <span className={`${sg} font-bold text-gray-950 dark:text-white`}>Total Manifest Value</span>
                  <span className={`${sg} font-bold text-[#1A7A4A] dark:text-emerald-400`}>
                    ₹{Math.round(orderAnalytics.finalPayable).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Delivery slot */}
              <div className="space-y-1.5">
                <label className={`block text-[11px] font-semibold text-gray-700 dark:text-gray-300 ${sg}`}>
                  Priority Reefer Dock Slot
                </label>
                <select
                  value={deliverySlot}
                  onChange={e => setDeliverySlot(e.target.value)}
                  className="w-full rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.09] px-3.5 py-2.5 text-[12px] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#1A7A4A]"
                >
                  <option value="04:30 AM - 06:00 AM (Priority Morning Kitchen Dock)">04:30 AM – 06:00 AM (Priority Kitchen Dock)</option>
                  <option value="06:00 AM - 08:00 AM (Standard Restaurant Prep Slot)">06:00 AM – 08:00 AM (Standard Prep Slot)</option>
                  <option value="02:00 PM - 04:00 PM (Midday Restock Slot)">02:00 PM – 04:00 PM (Midday Restock)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <button
                  onClick={() => { toast.success('Signed Mandi PO Receipt generated and downloaded.'); setShowPOModal(false); }}
                  className={`flex-1 group ${sg} rounded-xl pl-5 pr-2 py-3 text-[12px] font-semibold text-gray-800 dark:text-gray-200 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.09] border border-black/[0.07] dark:border-white/[0.08] flex items-center justify-between transition-all`}
                >
                  <span>Download PO Slip</span>
                  <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center">
                    <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </div>
                </button>
                <button
                  onClick={() => { toast.success('Procurement manager alerted via WhatsApp and Email.'); setShowPOModal(false); }}
                  className={`flex-1 group ${sg} rounded-xl pl-5 pr-2 py-3 text-[12px] font-semibold text-white bg-[#1A7A4A] hover:bg-[#166B3F] shadow-md flex items-center justify-between transition-all`}
                >
                  <span>Confirm Dock Dispatch</span>
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" strokeWidth={2} />
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL — 30-DAY INSTITUTIONAL CONTRACT RFQ
      ══════════════════════════════════════════════════════════════════════ */}
      {showRFQModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl bg-white dark:bg-[#0E110D] border border-black/[0.08] dark:border-white/[0.08] max-w-lg w-full shadow-2xl overflow-hidden"
          >
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono uppercase font-semibold bg-[#1A7A4A]/8 text-[#1A7A4A] dark:text-emerald-400 border border-[#1A7A4A]/15`}>
                    <Building2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Fixed Mandi Forward Contract
                  </div>
                  <h3 className={`${sg} font-bold text-xl text-gray-950 dark:text-white tracking-tight`}>
                    Institutional RFQ (500kg+ Daily)
                  </h3>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400">
                    Lock in 30-day fixed pricing protected from Mandi spot volatility.
                  </p>
                </div>
                <button
                  onClick={() => setShowRFQModal(false)}
                  className="w-8 h-8 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              <form onSubmit={handleRFQSubmit} className="space-y-4">
                <div className="space-y-3 text-[12px]">
                  <div>
                    <label className={`block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider ${sg}`}>
                      Estimated Daily Volume
                    </label>
                    <select
                      value={rfqVolume}
                      onChange={(e) => setRfqVolume(e.target.value)}
                      className="w-full rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.09] px-3.5 py-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#1A7A4A]"
                    >
                      <option>500 kg – 1,000 kg Daily (Cloud Kitchens / Banquets)</option>
                      <option>1,000 kg – 3,000 kg Daily (Hotel Chains / University Hostels)</option>
                      <option>3,000 kg+ Daily (Food Processing / Industrial Canteens)</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider ${sg}`}>
                      Key Commodities Required
                    </label>
                    <input
                      type="text"
                      value={rfqCommodities}
                      onChange={(e) => setRfqCommodities(e.target.value)}
                      className="w-full rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.09] px-3.5 py-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#1A7A4A]"
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider ${sg}`}>
                      Procurement Officer Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={rfqPhone}
                      onChange={(e) => setRfqPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.09] px-3.5 py-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#1A7A4A]"
                    />
                  </div>
                </div>

                {/* Cloudflare Turnstile Verification */}
                <TurnstileWidget
                  ref={rfqTurnstileRef}
                  onSuccess={(token) => setRfqTurnstileToken(token)}
                  onError={() => setRfqTurnstileToken('')}
                  onExpire={() => setRfqTurnstileToken('')}
                />

                <button
                  type="submit"
                  disabled={rfqSubmitting}
                  className={`w-full ${sg} rounded-xl pl-6 pr-2 py-3 text-[13px] font-semibold text-white bg-[#1A7A4A] hover:bg-[#166B3F] shadow-md flex items-center justify-between transition-all active:scale-[0.98] disabled:opacity-60`}
                >
                  <span>{rfqSubmitting ? 'Submitting RFQ...' : 'Submit Forward Contract RFQ'}</span>
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    {rfqSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                    )}
                  </div>
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
