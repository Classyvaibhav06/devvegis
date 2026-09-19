'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Leaf, Phone, ArrowUpRight, ShieldCheck, Truck, FileText, Building2, Store } from 'lucide-react';
import WholesaleTopTicker from '@/components/wholesale/WholesaleTopTicker';
import WholesaleHeader from '@/components/wholesale/WholesaleHeader';
import WholesaleSubNav from '@/components/wholesale/WholesaleSubNav';

export default function WholesaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#F8FAFC] dark:bg-[#070B12] text-slate-900 dark:text-[#E8EEF8] selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300 relative overflow-x-clip transition-colors">
      {/* ─── Sticky Header & Sliding Bar Suite ─── */}
      <header className="sticky top-0 z-50 shadow-sm bg-white dark:bg-[#0B0F17] transition-all">
        {/* 1. Top Black Sliding Announcement Bar (Ticker Slider) */}
        <WholesaleTopTicker />

        {/* 2. Dedicated Wholesale Header (Logo, Search, Login, Wishlist, Cart) */}
        <Suspense fallback={<div className="h-16 bg-white dark:bg-[#0B0F17] border-b border-slate-200 dark:border-white/10" />}>
          <WholesaleHeader />
        </Suspense>

        {/* 3. Sub-Navigation Category Menu */}
        <Suspense fallback={<div className="h-10 bg-slate-50 dark:bg-[#080C14] border-b border-slate-200 dark:border-white/10" />}>
          <WholesaleSubNav />
        </Suspense>
      </header>

      {/* ─── 4. Main Wholesale Content Area ─── */}
      <main className="flex-1 relative z-10">
        <Suspense fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          {children}
        </Suspense>
      </main>

      {/* ─── 5. Institutional B2B Footer ─── */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B0F17] pt-12 pb-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { Icon: Building2, title: 'APMC Mandi Direct', desc: 'Direct farm arrivals, transparent daily open auctions with zero middlemen.' },
              { Icon: Truck, title: '04:30 AM Reefer Fleet', desc: 'Temperature-controlled 4°C cold-chain fleet straight to kitchen dock.' },
              { Icon: FileText, title: 'GSTR-2B Ready', desc: 'Full GST ITC reconciliation with e-way bills and compliant invoices.' },
              { Icon: ShieldCheck, title: 'Zero Spoilage SLA', desc: '100% replacement or instant credit note for any quality discrepancies.' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-[2px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#10B981] shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-slate-100">{title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-white/[0.06] pt-8">
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-slate-900 dark:text-white">DevVegis Institutional</span>
              <span>·</span>
              <span>B2B Agri-Commodity Wholesale Trading Floor</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span>APMC LIC #DL-MND-4492</span>
              <span className="opacity-40">·</span>
              <span>FSSAI #10019022009841</span>
              <span className="opacity-40">·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">NET-30 CREDIT AVAILABLE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
