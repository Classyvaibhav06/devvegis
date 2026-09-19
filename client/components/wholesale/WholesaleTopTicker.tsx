'use client';

import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

const TICKER_ITEMS = [
  'COD OPTION AVAILABLE ON ORDERS ABOVE RS. 399/-',
  'EASY RETURN & ZERO-SPOILAGE SLA',
  'WHOLESALE CRATES STARTING @ JUST RS. 18/KG',
  'FREE MORNING REEFER DELIVERY ON ORDERS ABOVE RS. 1,999/-',
  '100% GST TAX INVOICE WITH FULL ITC RECONCILIATION',
  'DIRECT APMC MANDI CLEARING (04:30 AM DISPATCH)',
  'DEDICATED B2B PROCUREMENT DESK: 1800-123-4567',
];

export default function WholesaleTopTicker() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-black text-white text-[11px] font-semibold tracking-wider uppercase border-b border-white/[0.12] z-50 overflow-hidden py-2 sm:py-2.5">
      <div className="flex items-center overflow-hidden">
        {/* Continuous sliding marquee */}
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 pl-4">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
            <div key={idx} className="flex items-center gap-8 shrink-0">
              <span className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shrink-0 animate-pulse" />
                {item}
              </span>
              <span className="text-slate-500 select-none font-normal">—</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/80 hover:bg-neutral-800 text-slate-400 hover:text-white p-1 rounded-[2px] transition-colors border border-white/10 z-10"
        title="Dismiss announcement"
        aria-label="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
