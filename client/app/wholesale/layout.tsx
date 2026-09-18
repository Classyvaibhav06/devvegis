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

  // If not authenticated, redirect to login with return URL
  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace('/login?redirect=/wholesale');
    }
  }, [isAuthenticated, router]);

  // ── CUSTOMER / RIDER: Access Denied screen ──────────────────────────
  if (isAuthenticated && user && !ALLOWED_ROLES.includes(user.role)) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#FDFBF7]/60 dark:bg-[#080C14] text-[#0F172A] dark:text-[#E8EEF8] px-4">
        <div className="w-full max-w-md text-center space-y-6">
          {/* Lock Icon */}
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
            <Lock className="w-9 h-9 text-rose-500" strokeWidth={1.5} />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h1 className="font-heading font-bold text-2xl text-gray-900 dark:text-white tracking-tight">
              B2B Access Only
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
              The wholesale marketplace is exclusively for registered{' '}
              <strong className="text-gray-800 dark:text-gray-200">business buyers</strong> — hotels, restaurants, and institutional caterers.
            </p>
          </div>

          {/* Info box */}
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-4 text-left space-y-1">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
              Logged in as: {user.name}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Your account type (<span className="font-mono font-semibold">{user.role}</span>) does not have wholesale access.
              To apply as a wholesale buyer, contact our B2B team.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Store className="w-4 h-4" strokeWidth={1.5} />
              <span>Go to Retail Store</span>
            </Link>
            <Link
              href="/contact"
              className="w-full py-3 px-4 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.08] dark:border-white/10 text-gray-700 dark:text-gray-200 font-semibold text-sm flex items-center justify-center transition-all"
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
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#FDFBF7]/60 dark:bg-[#080C14]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Authorised layout ───────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#FDFBF7]/60 dark:bg-[#080C14] text-[#0F172A] dark:text-[#E8EEF8] selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300 relative overflow-x-hidden">
      {/* Ambient background mesh glow */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[1000px] h-[650px] rounded-full bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-[140px]" />
        <div className="absolute top-[45%] -left-[200px] w-[500px] h-[500px] rounded-full bg-emerald-600/[0.04] blur-[120px]" />
        <div className="absolute top-[60%] -right-[200px] w-[500px] h-[500px] rounded-full bg-teal-600/[0.04] blur-[120px]" />
      </div>

      {/* Floating Island Navigation */}
      <header className="fixed top-4 sm:top-6 inset-x-0 mx-auto z-50 max-w-5xl px-4 pointer-events-none">
        <div className="pointer-events-auto rounded-full bg-white/80 dark:bg-[#0c1017]/85 backdrop-blur-xl border border-black/[0.06] dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between transition-all duration-500">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/wholesale" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 dark:bg-emerald-400/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-transform duration-500 group-hover:scale-105">
                <Leaf className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm sm:text-base tracking-tight text-gray-950 dark:text-white">
                  DevVegis
                </span>
                <span className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  B2B Wholesale
                </span>
              </div>
            </Link>
          </div>

          {/* Center beacon */}
          <div className="hidden md:flex items-center gap-2.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 border-x border-black/[0.06] dark:border-white/10 px-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="tracking-wide">
              Mandi Floor: <strong className="text-gray-900 dark:text-gray-200 font-semibold">Live</strong>
            </span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">04:30 AM Dispatches</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="tel:+918001234567"
              className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-2 py-1"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
              <span className="font-mono text-[11px]">1800-123-4567</span>
            </a>
            <Link
              href="/"
              className="group flex items-center gap-2 rounded-full pl-3.5 pr-1.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/10 transition-all duration-300 active:scale-[0.98]"
            >
              <span>Retail Store</span>
              <div className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative z-10">{children}</main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-black/[0.06] dark:border-white/[0.06] bg-white/60 dark:bg-[#0a0d14]/70 backdrop-blur-md pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="p-1 sm:p-1.5 rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
            <div className="rounded-[calc(2rem-0.25rem)] bg-white/80 dark:bg-[#0d121c]/80 border border-black/[0.04] dark:border-white/[0.08] p-6 sm:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { Icon: Building2, title: 'APMC Mandi Direct', desc: 'Direct farm arrivals bypassing middle brokers with transparent daily open auctions.' },
                { Icon: Truck, title: '04:30 AM Reefer Fleet', desc: 'Temperature-controlled 4°C cold-chain fleet ensuring morning kitchen readiness.' },
                { Icon: FileText, title: 'GSTR-2B Ready Invoicing', desc: 'Full GST input tax credit (ITC) reconciliation with instant digital e-way bills.' },
                { Icon: ShieldCheck, title: 'Zero Spoilage SLA', desc: '100% on-spot replacement or instant credit note for any crate failing quality specs.' },
              ].map(({ Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-xs tracking-tight text-gray-900 dark:text-gray-100">{title}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500 dark:text-gray-400 border-t border-black/[0.04] dark:border-white/[0.06] pt-8">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-gray-900 dark:text-gray-200">DevVegis Institutional</span>
              <span>•</span>
              <span>B2B Agri-Commodity Trading Platform</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider font-mono">
              <span>APMC LIC #DL-MND-4492</span>
              <span>•</span>
              <span>FSSAI #10019022009841</span>
              <span>•</span>
              <span>NET-30 CREDIT AVAILABLE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
