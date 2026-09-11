import Link from 'next/link';
import { Bike, Shield, PhoneCall } from 'lucide-react';

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Rider Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-green-500 text-black flex items-center justify-center font-bold">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-sm tracking-wide text-white">
                DevVegis Rider
              </span>
              <span className="text-[10px] text-green-400 block -mt-0.5">Quick Commerce Fleet</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
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
