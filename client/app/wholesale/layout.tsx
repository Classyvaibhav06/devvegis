import Link from 'next/link';
import { Leaf, Phone, ArrowUpRight, ShieldCheck, Truck, FileText, CheckCircle2, Clock, Building2 } from 'lucide-react';

export default function WholesaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#FDFBF7]/60 dark:bg-[#080C14] text-[#0F172A] dark:text-[#E8EEF8] selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300 relative overflow-x-hidden">
      {/* Ambient background mesh glow (fixed, GPU-safe) */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[1000px] h-[650px] rounded-full bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-[140px]" />
        <div className="absolute top-[45%] -left-[200px] w-[500px] h-[500px] rounded-full bg-emerald-600/[0.04] blur-[120px]" />
        <div className="absolute top-[60%] -right-[200px] w-[500px] h-[500px] rounded-full bg-teal-600/[0.04] blur-[120px]" />
      </div>

      {/* Floating Island Detached Navigation */}
      <header className="fixed top-4 sm:top-6 inset-x-0 mx-auto z-50 max-w-5xl px-4 pointer-events-none">
        <div className="pointer-events-auto rounded-full bg-white/80 dark:bg-[#0c1017]/85 backdrop-blur-xl border border-black/[0.06] dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <Link href="/wholesale" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 dark:bg-emerald-400/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-transform duration-500 group-hover:scale-105 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <Leaf className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-sm sm:text-base tracking-tight text-gray-950 dark:text-white">
                    DevVegis
                  </span>
                  <span className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    B2B Wholesale
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Center: Live Floor Beacon */}
          <div className="hidden md:flex items-center gap-2.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 border-x border-black/[0.06] dark:border-white/10 px-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="tracking-wide">Mandi Auction Floor: <strong className="text-gray-900 dark:text-gray-200 font-semibold">Live</strong></span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">04:30 AM Dispatches</span>
          </div>

          {/* Right: Hotline & Store Switch */}
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
              className="group flex items-center gap-2 rounded-full pl-3.5 pr-1.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/10 transition-all duration-300 active:scale-[0.98] ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              <span>Retail Store</span>
              <div className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area with generous vertical space */}
      <main className="flex-1 relative z-10">
        {children}
      </main>

      {/* Institutional B2B Wholesale Ledger Footer */}
      <footer className="relative z-10 border-t border-black/[0.06] dark:border-white/[0.06] bg-white/60 dark:bg-[#0a0d14]/70 backdrop-blur-md pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Top Credentials Bar with Double-Bezel Inner Enclosure */}
          <div className="p-1 sm:p-1.5 rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.02] ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
            <div className="rounded-[calc(2rem-0.25rem)] bg-white/80 dark:bg-[#0d121c]/80 border border-black/[0.04] dark:border-white/[0.08] p-6 sm:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Building2 className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-xs tracking-tight text-gray-900 dark:text-gray-100">APMC Mandi Direct</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Direct farm arrivals bypassing middle brokers with transparent daily open auctions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Truck className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-xs tracking-tight text-gray-900 dark:text-gray-100">04:30 AM Reefer Fleet</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Temperature-controlled 4°C cold-chain fleet ensuring morning kitchen readiness.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <FileText className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-xs tracking-tight text-gray-900 dark:text-gray-100">GSTR-2B Ready Invoicing</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Full GST input tax credit (ITC) reconciliation with instant digital e-way bills.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-xs tracking-tight text-gray-900 dark:text-gray-100">Zero Spoilage SLA</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">100% on-spot replacement or instant credit note for any crate failing quality specs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
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
