import Link from 'next/link';
import { Bike, Shield, PhoneCall } from 'lucide-react';

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080C14] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Rider Header */}
      <header className="bg-white/95 dark:bg-[#0F1520]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/[0.08] sticky top-0 z-40 px-4 py-3 shadow-xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-500/20">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-sm tracking-wide text-slate-900 dark:text-white">
                DevVegis Rider
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block -mt-0.5 font-semibold">Quick Commerce Fleet</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#161E2E] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-white/[0.08]"
            >
              Exit to Store
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4">
        {children}
      </main>
    </div>
  );
}
