'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Phone, ArrowUpRight, ShieldCheck, Truck, FileText, Building2, Lock, Store } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const ALLOWED_ROLES = ['ADMIN', 'WHOLESALE_BUYER'];

export default function WholesaleLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace('/login?redirect=/wholesale');
    }
  }, [isAuthenticated, router]);

  // ── CUSTOMER / RIDER: Access Denied screen ──────────────────────────
  if (isAuthenticated && user && !ALLOWED_ROLES.includes(user.role)) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#F7F8F5] dark:bg-[#0A0C09] text-[#0F1710] dark:text-[#E8F0E8] px-4">
        <div className="w-full max-w-sm text-center space-y-8">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/8 border border-rose-500/15 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7 text-rose-500" strokeWidth={1.5} />
          </div>

          <div className="space-y-2">
            <h1 className="font-[family-name:var(--font-space-grotesk)] font-bold text-2xl text-gray-900 dark:text-white tracking-tight">
              B2B Access Only
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
              The wholesale marketplace is for registered business buyers — hotels, restaurants, and institutional caterers.
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 p-4 text-left space-y-1">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              Logged in as: {user.name}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Your account type (<span className="font-mono font-semibold">{user.role}</span>) does not have wholesale access.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full py-3 px-5 rounded-full bg-[#1A7A4A] hover:bg-[#166B3F] text-white font-[family-name:var(--font-space-grotesk)] font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Store className="w-4 h-4" strokeWidth={1.5} />
              Go to Retail Store
            </Link>
            <Link
              href="/contact"
              className="w-full py-3 px-5 rounded-full bg-transparent border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 font-[family-name:var(--font-space-grotesk)] font-medium text-sm flex items-center justify-center transition-all hover:bg-black/3 dark:hover:bg-white/5"
            >
              Contact B2B Sales Team
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading spinner while auth initialises ──────────────────────────
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#F7F8F5] dark:bg-[#0A0C09]">
        <div className="w-6 h-6 border-2 border-[#1A7A4A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Authorised layout ───────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#F7F8F5] dark:bg-[#0A0C09] text-[#0F1710] dark:text-[#E8F0E8] selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300 relative overflow-x-hidden">

      {/* Floating Island Navigation */}
      <header className="fixed top-5 sm:top-6 inset-x-0 mx-auto z-50 max-w-5xl px-4 pointer-events-none">
        <nav className="pointer-events-auto rounded-2xl bg-white/90 dark:bg-[#0E110D]/90 backdrop-blur-xl border border-black/[0.07] dark:border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] px-4 sm:px-5 py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/wholesale" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#1A7A4A]/10 border border-[#1A7A4A]/20 flex items-center justify-center text-[#1A7A4A] dark:text-emerald-400">
              <Leaf className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
            <span className="font-[family-name:var(--font-space-grotesk)] font-bold text-[13px] text-gray-950 dark:text-white tracking-tight">
              DevVegis
            </span>
            <span className="hidden sm:inline rounded-md px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] font-semibold bg-[#1A7A4A]/8 text-[#1A7A4A] dark:text-emerald-400 border border-[#1A7A4A]/15">
              B2B
            </span>
          </Link>

          {/* Center status */}
          <div className="hidden md:flex items-center gap-2 text-[11px] font-medium text-gray-400 dark:text-gray-500">
            <span className="inline-flex rounded-full h-1.5 w-1.5 bg-[#1A7A4A]" />
            <span>Mandi Direct: <strong className="text-gray-700 dark:text-gray-300 font-semibold">Live</strong></span>
            <span className="opacity-30">·</span>
            <span className="text-[#1A7A4A] dark:text-emerald-400">04:30 AM Dispatches</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="tel:+918001234567"
              className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-[#1A7A4A] dark:hover:text-emerald-400 transition-colors px-2 py-1"
            >
              <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="font-mono">1800-123-4567</span>
            </a>
            <Link
              href="/"
              className="group flex items-center gap-1.5 rounded-lg pl-3 pr-2 py-1.5 text-[11px] font-semibold text-gray-700 dark:text-gray-200 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.09] border border-black/[0.07] dark:border-white/[0.08] transition-all duration-200 active:scale-[0.98]"
            >
              <span>Retail Store</span>
              <div className="w-5 h-5 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center group-hover:translate-x-px group-hover:-translate-y-px transition-transform duration-200">
                <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
              </div>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 relative z-10">{children}</main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-black/[0.06] dark:border-white/[0.06] bg-white/60 dark:bg-[#0E110D]/70 backdrop-blur-md pt-12 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { Icon: Building2, title: 'APMC Mandi Direct', desc: 'Direct farm arrivals, transparent daily open auctions.' },
              { Icon: Truck, title: '04:30 AM Reefer Fleet', desc: 'Temperature-controlled 4°C cold-chain fleet.' },
              { Icon: FileText, title: 'GSTR-2B Ready', desc: 'Full GST ITC reconciliation with e-way bills.' },
              { Icon: ShieldCheck, title: 'Zero Spoilage SLA', desc: '100% replacement or instant credit for quality failures.' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1A7A4A]/8 border border-[#1A7A4A]/15 flex items-center justify-center text-[#1A7A4A] dark:text-emerald-400 shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-[family-name:var(--font-space-grotesk)] font-semibold text-[11px] tracking-tight text-gray-900 dark:text-gray-100">{title}</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-gray-400 dark:text-gray-500 border-t border-black/[0.04] dark:border-white/[0.06] pt-8">
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-space-grotesk)] font-bold text-gray-800 dark:text-gray-300">DevVegis Institutional</span>
              <span>·</span>
              <span>B2B Agri-Commodity Trading Platform</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider">
              <span>APMC LIC #DL-MND-4492</span>
              <span className="opacity-30">·</span>
              <span>FSSAI #10019022009841</span>
              <span className="opacity-30">·</span>
              <span>NET-30 CREDIT AVAILABLE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
