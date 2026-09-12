'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Building2, Truck, ShieldCheck, Download, ShoppingCart,
  Percent, FileSpreadsheet, Check, ArrowRight, ArrowUpRight,
  Plus, Minus, TrendingUp, TrendingDown, Clock, Sparkles,
  FileText, CheckCircle2, ChevronDown, Filter, HelpCircle,
  PhoneCall, RefreshCw, X, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Live APMC Mandi Commodity Feeds
const MANDI_TICKER = [
  { item: 'Nashik Red Onion', modalPrice: 28.0, change: '+1.8%', up: true, arrivals: '4,200 Qtl' },
  { item: 'Indore Jyoti Potato', modalPrice: 24.0, change: '-0.9%', up: false, arrivals: '6,800 Qtl' },
  { item: 'Kolar Hybrid Tomato', modalPrice: 31.0, change: '+3.2%', up: true, arrivals: '2,100 Crates' },
  { item: 'Shimla Capsicum Green', modalPrice: 44.0, change: '-1.4%', up: false, arrivals: '850 Bags' },
  { item: 'Ooty Table Carrots', modalPrice: 36.0, change: '0.0%', up: true, arrivals: '1,200 Crates' },
  { item: 'Assam Ginger Coarse', modalPrice: 68.0, change: '+2.1%', up: true, arrivals: '400 Bags' },
];

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

const WHOLESALE_CATALOG: WholesaleProduct[] = [
  {
    id: 'w1',
    name: 'Grade-A Nashik Red Onions',
    botanicalOrigin: 'Lasalgaon Mandi, Nashik • Export Sizing 55mm+',
    category: 'roots',
    packaging: '50 Kg Heavy Jute Gunny Bag',
    kgPerCrate: 50,
    retailPrice: 44,
    baseWholesalePrice: 28,
    tierDiscounts: [
      { minCrates: 2, price: 28, label: 'Base Wholesale' },
      { minCrates: 10, price: 25.5, label: 'HoReCa Tier (-9%)' },
      { minCrates: 30, price: 23.5, label: 'Institutional (-16%)' },
    ],
    minCrates: 2,
    stockStatus: 'Fresh Arrival',
    hsnCode: '0703.10.10',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'w2',
    name: 'Cold-Storage Jyoti Potatoes',
    botanicalOrigin: 'Indore Malwa Belt • Sugar-Free Cured 45mm+',
    category: 'roots',
    packaging: '50 Kg Perforated Poly Bag',
    kgPerCrate: 50,
    retailPrice: 38,
    baseWholesalePrice: 24,
    tierDiscounts: [
      { minCrates: 2, price: 24, label: 'Base Wholesale' },
      { minCrates: 10, price: 21.8, label: 'HoReCa Tier (-9%)' },
      { minCrates: 30, price: 19.5, label: 'Institutional (-19%)' },
    ],
    minCrates: 2,
    stockStatus: 'High Volume',
    hsnCode: '0701.90.00',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'w3',
    name: 'Hydroponic Firm Salad Tomatoes',
    botanicalOrigin: 'Kolar Polyhouse Clustered • 90% Red Firm Turn',
    category: 'vine',
    packaging: '25 Kg Food-Grade Stackable Crate',
    kgPerCrate: 25,
    retailPrice: 52,
    baseWholesalePrice: 32,
    tierDiscounts: [
      { minCrates: 4, price: 32, label: 'Base Wholesale' },
      { minCrates: 15, price: 29.0, label: 'HoReCa Tier (-9%)' },
      { minCrates: 40, price: 26.5, label: 'Institutional (-17%)' },
    ],
    minCrates: 4,
    stockStatus: 'Fresh Arrival',
    hsnCode: '0702.00.00',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'w4',
    name: 'Export-Grade Green Field Cabbage',
    botanicalOrigin: 'Pune Agricultural Belt • Compact Solid Heads 1.2kg',
    category: 'greens',
    packaging: '30 Kg Ventilated Mesh Bag',
    kgPerCrate: 30,
    retailPrice: 34,
    baseWholesalePrice: 19,
    tierDiscounts: [
      { minCrates: 3, price: 19, label: 'Base Wholesale' },
      { minCrates: 12, price: 17.2, label: 'HoReCa Tier (-9%)' },
      { minCrates: 35, price: 15.0, label: 'Institutional (-21%)' },
    ],
    minCrates: 3,
    stockStatus: 'High Volume',
    hsnCode: '0704.90.10',
    image: 'https://images.unsplash.com/photo-1550950158-d0d960dff51b?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'w5',
    name: 'Green Bell Capsicum (Shimla Cut)',
    botanicalOrigin: 'Solan Valley Farms • Thick Wall 3-4 Lobe Sort',
    category: 'vine',
    packaging: '20 Kg Corrugated Cold Box',
    kgPerCrate: 20,
    retailPrice: 65,
    baseWholesalePrice: 42,
    tierDiscounts: [
      { minCrates: 3, price: 42, label: 'Base Wholesale' },
      { minCrates: 10, price: 38.0, label: 'HoReCa Tier (-10%)' },
      { minCrates: 25, price: 34.5, label: 'Institutional (-18%)' },
    ],
    minCrates: 3,
    stockStatus: 'Limited Harvest',
    hsnCode: '0709.60.10',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'w6',
    name: 'Washed Red Ooty Table Carrots',
    botanicalOrigin: 'Nilgiris High-Altitude Sourced • Sweet Crisp Core',
    category: 'roots',
    packaging: '25 Kg Perforated Hydro Crate',
    kgPerCrate: 25,
    retailPrice: 58,
    baseWholesalePrice: 36,
    tierDiscounts: [
      { minCrates: 3, price: 36, label: 'Base Wholesale' },
      { minCrates: 12, price: 32.5, label: 'HoReCa Tier (-10%)' },
      { minCrates: 30, price: 29.0, label: 'Institutional (-19%)' },
    ],
    minCrates: 3,
    stockStatus: 'Fresh Arrival',
    hsnCode: '0706.10.00',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=600&auto=format&fit=crop&q=80',
  },
];

export default function WholesalePage() {
  // State for item crate counts
  const [quantities, setQuantities] = useState<Record<string, number>>({
    w1: 4,
    w2: 4,
    w3: 6,
    w4: 0,
    w5: 0,
    w6: 0,
  });

  const [activeCategory, setActiveCategory] = useState<'all' | 'roots' | 'vine' | 'greens'>('all');
  const [paymentTerms, setPaymentTerms] = useState<'rtgs' | 'net15' | 'cod'>('net15');

  // Business & GSTIN registration state
  const [businessName, setBusinessName] = useState('Spice Route Luxury Hospitality Ltd');
  const [gstin, setGstin] = useState('27AAACS1429B1Z8');
  const [businessType, setBusinessType] = useState('Hotel & Fine Dining Chain');
  const [isVerified, setIsVerified] = useState(true);

  // Modals & Drawers
  const [showPOModal, setShowPOModal] = useState(false);
  const [poReference, setPoReference] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('04:30 AM - 06:00 AM (Priority Morning Kitchen Dock)');
  const [showRFQModal, setShowRFQModal] = useState(false);

  // Quantity updates
  const updateQty = (id: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const setDirectQty = (id: string, qty: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, qty),
    }));
  };

  // Pricing math based on volume tiers
  const getItemPricing = (item: WholesaleProduct, crates: number) => {
    if (crates === 0) return { activePrice: item.baseWholesalePrice, tierLabel: 'Base Wholesale' };
    let activePrice = item.baseWholesalePrice;
    let tierLabel = 'Standard Wholesale';

    for (const tier of [...item.tierDiscounts].sort((a, b) => b.minCrates - a.minCrates)) {
      if (crates >= tier.minCrates) {
        activePrice = tier.price;
        tierLabel = tier.label;
        break;
      }
    }
    return { activePrice, tierLabel };
  };

  // Aggregated totals
  const orderAnalytics = useMemo(() => {
    let totalWeightKg = 0;
    let totalCrates = 0;
    let subtotalWholesale = 0;
    let subtotalRetail = 0;

    WHOLESALE_CATALOG.forEach(item => {
      const crates = quantities[item.id] || 0;
      if (crates > 0) {
        const weight = crates * item.kgPerCrate;
        const { activePrice } = getItemPricing(item, crates);
        totalWeightKg += weight;
        totalCrates += crates;
        subtotalWholesale += weight * activePrice;
        subtotalRetail += weight * item.retailPrice;
      }
    });

    // Cash discount for RTGS upfront
    const termsDiscount = paymentTerms === 'rtgs' ? subtotalWholesale * 0.015 : 0;
    const finalPayable = Math.max(0, subtotalWholesale - termsDiscount);
    const totalSavings = subtotalRetail - finalPayable;

    return {
      totalWeightKg,
      totalWeightTons: (totalWeightKg / 1000).toFixed(2),
      totalCrates,
      subtotalWholesale,
      subtotalRetail,
      termsDiscount,
      finalPayable,
      totalSavings,
      savingsPercentage: subtotalRetail > 0 ? Math.round((totalSavings / subtotalRetail) * 100) : 0,
    };
  }, [quantities, paymentTerms]);

  // GSTIN verification handler
  const handleVerifyGstin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !gstin.trim()) {
      toast.error('Please specify both registered business name and 15-digit GSTIN.');
      return;
    }
    setIsVerified(true);
    toast.success('GSTIN Verified Successfully: Pre-approved for ₹5,00,000 Net-15 Credit!');
  };

  // Submit Purchase Order handler
  const handleGeneratePO = () => {
    if (orderAnalytics.totalCrates === 0) {
      toast.error('Your B2B manifest is empty. Please add at least 1 crate.');
      return;
    }
    const randomPO = `PO-MANDI-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    setPoReference(randomPO);
    setShowPOModal(true);
  };

  // Export Rate Sheet Simulator
  const handleExportRateSheet = (format: 'pdf' | 'csv') => {
    toast.success(`Daily Wholesale Rate Sheet (${format.toUpperCase()}) compiled for ${new Date().toLocaleDateString('en-IN')}. Initiating instant download.`);
  };

  // Filter items
  const filteredCatalog = useMemo(() => {
    if (activeCategory === 'all') return WHOLESALE_CATALOG;
    return WHOLESALE_CATALOG.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="pt-24 sm:pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* ─── SECTION 1: HERO & LIVE APMC MARKET TICKER ──────────────────── */}
      <section className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl space-y-5">
            {/* Micro-Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[10px] uppercase tracking-[0.22em] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
              <span>Institutional Agri-Commodity Floor</span>
            </div>

            {/* Massive Wide Grotesk Headline */}
            <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-950 dark:text-white leading-[1.06]">
              Farm-Gate Bulk Produce. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200">
                Mandi Direct to Kitchen.
              </span>
            </h1>

            {/* Calibrated Editorial Subtext */}
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed font-normal">
              Direct primary harvest allocations for Michelin-rated kitchens, 5-star hotel chains, cloud kitchens, and institutional caterers. 04:30 AM dock dispatches, transparent daily APMC auction settlement, and Net-15/30 credit financing.
            </p>
          </div>

          {/* Primary Action Button-in-Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => handleExportRateSheet('pdf')}
              className="group rounded-full pl-6 pr-2 py-2.5 font-heading text-xs font-semibold text-gray-900 dark:text-white bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.08] dark:border-white/10 flex items-center justify-between gap-4 transition-all duration-500 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              <span>Export Today's Rate Sheet</span>
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <Download className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </button>

            <button
              onClick={() => setShowRFQModal(true)}
              className="group rounded-full pl-6 pr-2 py-2.5 font-heading text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.3)] flex items-center justify-between gap-4 transition-all duration-500 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              <span>Request 30-Day Contract (500kg+)</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </button>
          </div>
        </div>

        {/* Live APMC Commodity Ticker Bar with Double-Bezel Enclosure */}
        <div className="p-1 sm:p-1.5 rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] ring-1 ring-black/[0.05] dark:ring-white/10">
          <div className="rounded-[calc(2rem-0.25rem)] bg-white/90 dark:bg-[#0c1017]/90 border border-black/[0.04] dark:border-white/[0.06] p-4 sm:p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between gap-4 mb-3 pb-2.5 border-b border-black/[0.04] dark:border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs font-heading font-semibold text-gray-900 dark:text-gray-100">
                <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                <span>APMC Spot Benchmarks</span>
                <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 font-normal">
                  (Updated Today 04:00 AM IST)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="hidden sm:inline">Index Settlement: <strong>Vashi & Azadpur Central</strong></span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] uppercase tracking-wider font-semibold">● Live Clearing</span>
              </div>
            </div>

            {/* Commodity Badges Scroll Container */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {MANDI_TICKER.map((ticker, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/[0.05] p-3 flex flex-col justify-between hover:border-emerald-500/30 transition-colors"
                >
                  <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300 truncate">
                    {ticker.item}
                  </span>
                  <div className="flex items-baseline justify-between gap-2 mt-1.5">
                    <span className="font-heading font-bold text-sm text-gray-950 dark:text-white">
                      ₹{ticker.modalPrice.toFixed(1)}<span className="text-[10px] text-gray-500 font-normal">/kg</span>
                    </span>
                    <span className={`text-[10px] font-mono font-semibold flex items-center gap-0.5 ${ticker.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {ticker.up ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      {ticker.change}
                    </span>
                  </div>
                  <span className="text-[9px] text-gray-500 dark:text-gray-400 mt-1 font-mono">
                    {ticker.arrivals}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: ASYMMETRIC BENTO GRID (TRADING DESK & SUMMARY CONSOLE) ─ */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT 8-COLUMNS: Bulk Crate Order Desk */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header & Filter Pill Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-gray-950 dark:text-white">
                Daily Harvest Crate Allotments
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Bulk standardized packaging with automated dynamic volume discount tiers.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.08] overflow-x-auto">
              {[
                { id: 'all', label: 'All Crates' },
                { id: 'roots', label: 'Staples & Roots' },
                { id: 'vine', label: 'Vine & Solanaceae' },
                { id: 'greens', label: 'Brassica & Greens' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`rounded-full px-3.5 py-1 text-[11px] font-heading font-medium tracking-tight transition-all duration-300 ${
                    activeCategory === tab.id
                      ? 'bg-white dark:bg-[#121824] text-gray-950 dark:text-white shadow-sm border border-black/[0.06] dark:border-white/10'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items List (Double-Bezel Architecture) */}
          <div className="space-y-4">
            {filteredCatalog.map((item) => {
              const currentCrates = quantities[item.id] || 0;
              const { activePrice, tierLabel } = getItemPricing(item, currentCrates);
              const currentKg = currentCrates * item.kgPerCrate;
              const lineTotal = currentKg * activePrice;
              const lineRetailTotal = currentKg * item.retailPrice;
              const lineSavings = lineRetailTotal - lineTotal;

              return (
                <div
                  key={item.id}
                  className="p-1 sm:p-1.5 rounded-[2.25rem] bg-black/[0.02] dark:bg-white/[0.02] ring-1 ring-black/[0.05] dark:ring-white/10 transition-all duration-500 hover:ring-emerald-500/30 dark:hover:ring-emerald-500/30"
                >
                  <div className="rounded-[calc(2.25rem-0.25rem)] bg-white dark:bg-[#0c1018] border border-black/[0.04] dark:border-white/[0.06] p-5 sm:p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-6">
                    
                    {/* Item Image & Botanical Specs */}
                    <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden relative bg-black/[0.04] dark:bg-white/[0.04] shrink-0 border border-black/[0.06] dark:border-white/10">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 80px, 96px"
                          className="object-cover transition-transform duration-700 hover:scale-105 ease-[cubic-bezier(0.32,0.72,0,1)]"
                        />
                      </div>

                      <div className="space-y-1.5 max-w-md">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-heading font-bold text-base sm:text-lg text-gray-950 dark:text-white tracking-tight">
                            {item.name}
                          </h3>
                          <span className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider font-mono font-semibold bg-black/[0.04] dark:bg-white/[0.08] text-gray-600 dark:text-gray-300">
                            HSN {item.hsnCode}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                          {item.botanicalOrigin}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300 pt-1">
                          <span className="font-medium text-gray-900 dark:text-gray-200">
                            Unit: {item.packaging}
                          </span>
                          <span>•</span>
                          <span className="text-[11px] text-gray-500 font-mono">
                            Min MOQ: {item.minCrates} Crates ({item.minCrates * item.kgPerCrate} Kg)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Tiers & Volume Controls */}
                    <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center justify-between gap-5 border-t sm:border-t-0 md:border-t lg:border-t-0 border-black/[0.04] dark:border-white/[0.06] pt-4 sm:pt-0 md:pt-4 lg:pt-0">
                      
                      {/* Price Matrix Display */}
                      <div className="space-y-1 text-left sm:text-right md:text-left lg:text-right">
                        <div className="flex items-baseline gap-2 justify-start sm:justify-end md:justify-start lg:justify-end">
                          <span className="font-heading font-bold text-xl sm:text-2xl text-emerald-600 dark:text-emerald-400">
                            ₹{activePrice.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                            ₹{item.retailPrice}
                          </span>
                          <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">/Kg</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 justify-start sm:justify-end md:justify-start lg:justify-end">
                          <span className="rounded-full px-2 py-0.5 text-[9px] uppercase font-semibold font-mono tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            {tierLabel}
                          </span>
                        </div>
                      </div>

                      {/* Stepper & Live Weight Indicator */}
                      <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-2 p-1 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/10">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            disabled={currentCrates === 0}
                            className="w-8 h-8 rounded-full bg-white dark:bg-[#151c28] text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 active:scale-95"
                            aria-label="Decrease crate quantity"
                          >
                            <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>

                          <div className="px-3 min-w-[3.5rem] text-center">
                            <span className="font-heading font-bold text-sm text-gray-900 dark:text-white">
                              {currentCrates}
                            </span>
                            <span className="block text-[9px] uppercase font-mono text-gray-400">
                              Crates
                            </span>
                          </div>

                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="w-8 h-8 rounded-full bg-white dark:bg-[#151c28] text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-all duration-300 active:scale-95"
                            aria-label="Increase crate quantity"
                          >
                            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </button>
                        </div>

                        {/* Calculated Live Metric */}
                        <div className="text-right text-[11px] font-mono">
                          {currentCrates > 0 ? (
                            <div className="space-y-0.5">
                              <span className="text-gray-900 dark:text-gray-100 font-semibold">
                                {currentKg.toLocaleString()} Kg • ₹{lineTotal.toLocaleString('en-IN')}
                              </span>
                              {lineSavings > 0 && (
                                <span className="block text-emerald-600 dark:text-emerald-400 text-[10px]">
                                  Saves ₹{lineSavings.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-[10px]">
                              0 Kg Selected
                            </span>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Sourcing Guarantee & Telemetry Card (Double-Bezel Bento) */}
          <div className="p-1 sm:p-1.5 rounded-[2.25rem] bg-black/[0.02] dark:bg-white/[0.02] ring-1 ring-black/[0.05] dark:ring-white/10">
            <div className="rounded-[calc(2.25rem-0.25rem)] bg-gradient-to-r from-emerald-950/80 via-[#0a1218] to-[#0c161d] text-white p-6 sm:p-8 border border-emerald-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2 max-w-lg">
                  <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Truck className="w-3 h-3" strokeWidth={1.5} />
                    <span>Active Telemetry Fleet</span>
                  </div>
                  <h4 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Guaranteed 04:30 AM Kitchen Dock Arrival
                  </h4>
                  <p className="text-xs text-emerald-100/80 leading-relaxed">
                    Pre-cooled in refrigerated reefer containers holding an unbroken 4°C chain. If our truck arrives past 06:00 AM, logistics handling is 100% reimbursed on that invoice.
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 border-emerald-500/20 pt-4 sm:pt-0">
                  <span className="text-xs font-mono text-emerald-300">Fleet Reefer Temp:</span>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <span className="font-heading font-bold text-2xl text-white font-mono">3.8°C</span>
                  </div>
                  <span className="text-[10px] text-emerald-300/70 font-mono uppercase">Live GPS Sensor</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 4-COLUMNS: Interactive B2B Quotation Desk & Onboarding */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          {/* Bento Module 1: Sticky Purchase Order Quotation Console */}
          <div className="p-1 sm:p-1.5 rounded-[2.25rem] bg-black/[0.02] dark:bg-white/[0.02] ring-1 ring-black/[0.05] dark:ring-white/10">
            <div className="rounded-[calc(2.25rem-0.25rem)] bg-white dark:bg-[#0c1017] border border-black/[0.04] dark:border-white/[0.06] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.04] dark:border-white/[0.06]">
                <div>
                  <h3 className="font-heading font-bold text-lg text-gray-950 dark:text-white tracking-tight">
                    Order Manifest
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Live Mandi Clearing Rate
                  </p>
                </div>
                <span className="rounded-full px-2.5 py-1 text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {orderAnalytics.totalCrates} Crates
                </span>
              </div>

              {/* Metric Breakdown Table */}
              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                  <span>Gross Net Weight</span>
                  <span className="font-semibold text-gray-950 dark:text-white">
                    {orderAnalytics.totalWeightKg.toLocaleString()} Kg ({orderAnalytics.totalWeightTons} MT)
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                  <span>Standard Retail Benchmark</span>
                  <span className="line-through text-gray-400">
                    ₹{orderAnalytics.subtotalRetail.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                  <span>Mandi Bulk Subtotal</span>
                  <span className="font-semibold text-gray-950 dark:text-white">
                    ₹{orderAnalytics.subtotalWholesale.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Terms Selection */}
                <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                  <label className="block text-[11px] font-heading font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Settlement & Credit Terms
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06]">
                    {[
                      { id: 'net15', label: 'Net-15', sub: 'GST Credit' },
                      { id: 'rtgs', label: 'RTGS', sub: '1.5% Off' },
                      { id: 'cod', label: 'Dock COD', sub: 'Verified' },
                    ].map((term) => (
                      <button
                        key={term.id}
                        onClick={() => setPaymentTerms(term.id as any)}
                        className={`rounded-xl p-2 text-center transition-all duration-300 ${
                          paymentTerms === term.id
                            ? 'bg-white dark:bg-[#151c28] shadow-sm text-emerald-600 dark:text-emerald-400 border border-black/[0.06] dark:border-white/10'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        <span className="block text-xs font-heading font-bold">{term.label}</span>
                        <span className="block text-[9px] font-mono text-gray-400">{term.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {paymentTerms === 'rtgs' && orderAnalytics.termsDiscount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 pt-1">
                    <span>1.5% Instant Wire Discount</span>
                    <span>-₹{Math.round(orderAnalytics.termsDiscount).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                  <span>04:30 AM Refrigerated Dispatch</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase text-[10px]">
                    {orderAnalytics.totalWeightKg >= 100 ? 'Complimentary' : '₹450 Flat'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                  <span>Applicable GST (HSN 0701-0709)</span>
                  <span className="text-gray-900 dark:text-gray-200 font-semibold">0% Exempt</span>
                </div>

                {/* Final Net Total */}
                <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06] flex items-baseline justify-between">
                  <div>
                    <span className="block font-heading font-bold text-sm text-gray-950 dark:text-white">
                      Net Payable
                    </span>
                    <span className="text-[10px] text-gray-500">Includes all Mandi charges</span>
                  </div>
                  <div className="text-right">
                    <span className="font-heading font-bold text-2xl text-emerald-600 dark:text-emerald-400">
                      ₹{Math.round(orderAnalytics.finalPayable).toLocaleString('en-IN')}
                    </span>
                    {orderAnalytics.totalSavings > 0 && (
                      <span className="block text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                        Total Saved: ₹{Math.round(orderAnalytics.totalSavings).toLocaleString('en-IN')} ({orderAnalytics.savingsPercentage}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Purchase Order Button (Nested Island Architecture) */}
              <button
                onClick={handleGeneratePO}
                className="w-full group rounded-full pl-6 pr-2 py-3 font-heading text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_24px_rgba(16,185,129,0.3)] flex items-center justify-between transition-all duration-500 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                <span>Submit Purchase Order (PO)</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
                </div>
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Certified Mandi Weighbridge Slip Generated with PO</span>
              </div>

            </div>
          </div>

          {/* Bento Module 2: GSTIN & Credit Line Onboarding Engine */}
          <div className="p-1 sm:p-1.5 rounded-[2.25rem] bg-black/[0.02] dark:bg-white/[0.02] ring-1 ring-black/[0.05] dark:ring-white/10">
            <div className="rounded-[calc(2.25rem-0.25rem)] bg-white dark:bg-[#0c1017] border border-black/[0.04] dark:border-white/[0.06] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                  <h4 className="font-heading font-bold text-sm text-gray-950 dark:text-white">
                    B2B Tax & Credit Profile
                  </h4>
                </div>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] uppercase font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              {!isVerified ? (
                <form onSubmit={handleVerifyGstin} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-heading font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Business Legal Name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Olive Kitchens Pvt Ltd"
                      className="w-full rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/10 px-3.5 py-2 text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-heading font-medium text-gray-600 dark:text-gray-400 mb-1">
                      15-Digit GSTIN Number
                    </label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="27AAACS1429B1Z8"
                      className="w-full rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/10 px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all uppercase"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-full py-2.5 px-4 font-heading text-xs font-semibold text-gray-900 dark:text-white bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] border border-black/[0.08] dark:border-white/10 transition-all active:scale-[0.98]"
                  >
                    Verify & Activate Net-15 Terms
                  </button>
                </form>
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] p-3.5 space-y-2">
                    <div className="text-xs">
                      <span className="text-gray-500 dark:text-gray-400 block text-[10px] uppercase font-mono">Entity</span>
                      <strong className="font-heading font-semibold text-gray-900 dark:text-gray-100">
                        {businessName}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <span className="text-[10px] uppercase font-mono text-gray-500">GSTIN</span>
                      <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{gstin}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <span className="text-[10px] uppercase font-mono text-gray-500">Approved Credit Limit</span>
                      <span className="font-heading font-bold text-emerald-600 dark:text-emerald-400">₹5,00,000</span>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <span className="text-[10px] uppercase font-mono text-gray-500">GSTR-2B ITC Match</span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">100% Automated</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsVerified(false)}
                    className="w-full text-center text-[10px] font-mono text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Edit Business Entity or Update GSTIN →
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

      </section>

      {/* ─── MODAL: OFFICIAL PURCHASE ORDER (PO) CONFIRMATION ────────────── */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity">
          <div className="p-1 sm:p-1.5 rounded-[2.5rem] bg-white dark:bg-[#0c1017] ring-1 ring-black/[0.08] dark:ring-white/10 max-w-xl w-full shadow-2xl overflow-hidden">
            <div className="rounded-[calc(2.5rem-0.25rem)] bg-white dark:bg-[#0c1017] p-6 sm:p-8 space-y-6">
              
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Purchase Order Dispatched to Mandi</span>
                  </div>
                  <h3 className="font-heading font-bold text-2xl text-gray-950 dark:text-white tracking-tight">
                    {poReference}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Allocated from primary morning harvest arrivals for {businessName}
                  </p>
                </div>

                <button
                  onClick={() => setShowPOModal(false)}
                  className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Order Manifest Summary */}
              <div className="rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.06] p-4 space-y-2.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Crates / Bags</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{orderAnalytics.totalCrates} Units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Certified Weight</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{orderAnalytics.totalWeightKg.toLocaleString()} Kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Term</span>
                  <span className="font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                    {paymentTerms === 'net15' ? 'Net-15 B2B Credit' : paymentTerms === 'rtgs' ? 'RTGS Direct Wire' : 'Cash-on-Dock'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-black/[0.04] dark:border-white/[0.06] text-sm">
                  <span className="font-bold font-heading text-gray-950 dark:text-white">Total Manifest Value</span>
                  <span className="font-bold font-heading text-emerald-600 dark:text-emerald-400">
                    ₹{Math.round(orderAnalytics.finalPayable).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Delivery Window Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-heading font-semibold text-gray-800 dark:text-gray-200">
                  Priority Reefer Dock Slot
                </label>
                <select
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                  className="w-full rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/10 px-3.5 py-2 text-xs font-sans text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="04:30 AM - 06:00 AM (Priority Morning Kitchen Dock)">04:30 AM - 06:00 AM (Priority Morning Kitchen Dock)</option>
                  <option value="06:00 AM - 08:00 AM (Standard Restaurant Prep Slot)">06:00 AM - 08:00 AM (Standard Restaurant Prep Slot)</option>
                  <option value="02:00 PM - 04:00 PM (Midday Restock Slot)">02:00 PM - 04:00 PM (Midday Restock Slot)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    toast.success('Official Signed Mandi PO Receipt generated and downloaded.');
                    setShowPOModal(false);
                  }}
                  className="w-full sm:flex-1 rounded-full pl-5 pr-2 py-2.5 font-heading text-xs font-semibold text-gray-900 dark:text-white bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.08] dark:border-white/10 flex items-center justify-between transition-all"
                >
                  <span>Download Signed PO Slip</span>
                  <div className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center">
                    <Download className="w-3.5 h-3.5" />
                  </div>
                </button>

                <button
                  onClick={() => {
                    toast.success('Procurement manager alerted via WhatsApp and Email.');
                    setShowPOModal(false);
                  }}
                  className="w-full sm:flex-1 rounded-full pl-5 pr-2 py-2.5 font-heading text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md flex items-center justify-between transition-all"
                >
                  <span>Confirm Dock Dispatch</span>
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: 30-DAY INSTITUTIONAL CONTRACT RFQ ───────────────────── */}
      {showRFQModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity">
          <div className="p-1 sm:p-1.5 rounded-[2.5rem] bg-white dark:bg-[#0c1017] ring-1 ring-black/[0.08] dark:ring-white/10 max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="rounded-[calc(2.5rem-0.25rem)] bg-white dark:bg-[#0c1017] p-6 sm:p-8 space-y-5">
              
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Fixed Mandi Forward Contract</span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-gray-950 dark:text-white tracking-tight">
                    Institutional RFQ (500kg+ Daily)
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Lock in 30-day fixed procurement pricing protected from Mandi spot volatility.
                  </p>
                </div>

                <button
                  onClick={() => setShowRFQModal(false)}
                  className="w-8 h-8 rounded-full bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Daily Produce Volume</label>
                  <select className="w-full rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/10 px-3.5 py-2 text-xs font-sans text-gray-900 dark:text-gray-100">
                    <option>500 Kg – 1,000 Kg Daily (Cloud Kitchens / Banquets)</option>
                    <option>1,000 Kg – 3,000 Kg Daily (Hotel Chains / University Hostels)</option>
                    <option>3,000 Kg+ Daily (Food Processing / Industrial Canteens)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Key Commodities Required</label>
                  <input
                    type="text"
                    defaultValue="Onions, Potatoes, Tomatoes, Capsicum, Ginger, Coriander"
                    className="w-full rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/10 px-3.5 py-2 text-xs font-sans text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Procurement Officer Contact Phone</label>
                  <input
                    type="tel"
                    defaultValue="+91 98765 43210"
                    className="w-full rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/10 px-3.5 py-2 text-xs font-sans text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    toast.success('RFQ logged. Our Senior Agri-Commodity Desk will contact you within 2 hours with forward pricing.');
                    setShowRFQModal(false);
                  }}
                  className="w-full rounded-full pl-6 pr-2 py-3 font-heading text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md flex items-center justify-between transition-all"
                >
                  <span>Submit Forward Contract RFQ</span>
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
