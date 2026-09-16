import type { Metadata } from 'next';
import { ShieldCheck, CheckCircle2, FileText, AlertCircle, Award } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FSSAI License & Food Safety Standards | DevVegis Compliance',
  description: 'DevVegis adheres to strict FSSAI food safety regulations, zero-pesticide grading, and ISO-certified cold-chain hygiene protocols.',
};

export default function FoodSafetyPage() {
  return (
    <div className="container-main py-10 max-w-4xl space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>FSSAI Certified Protocols</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8]">
          Food Safety & Quality Compliance
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#8B96A8]">
          Your health is our first priority. Read our FSSAI licensing information, quality control stages, and hygiene audits.
        </p>
      </div>

      <div className="card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-emerald-700 dark:text-emerald-400 block">
              Central Regulatory License
            </span>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              FSSAI License No: 11226999000142
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#8B96A8] mt-0.5">
              Registered under Food Safety and Standards Act, 2006 (Government of India)
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active & Verified</span>
          </span>
        </div>

        <div className="space-y-4">
          <h2 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">
            Our 4-Stage Freshness & Safety Verification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 space-y-1.5">
              <span className="font-bold text-emerald-600">Stage 1: Farm-Gate Sorting</span>
              <p className="text-slate-600 dark:text-[#8B96A8] leading-relaxed">
                Initial grading at morning harvest centers. Damaged, punctured, or pest-affected produce is discarded immediately at the farm gate.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 space-y-1.5">
              <span className="font-bold text-emerald-600">Stage 2: Rapid Ozone Wash</span>
              <p className="text-slate-600 dark:text-[#8B96A8] leading-relaxed">
                Leafy greens and vegetables receive chemical-free ozonated micro-bubble wash to eliminate 99.8% of surface dust, spores, and microbes.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 space-y-1.5">
              <span className="font-bold text-emerald-600">Stage 3: Spectral AI Inspection</span>
              <p className="text-slate-600 dark:text-[#8B96A8] leading-relaxed">
                Automated optical sorting benches measure color uniformity, skin elasticity, and ripeness grading before crates are stocked.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 space-y-1.5">
              <span className="font-bold text-emerald-600">Stage 4: Sealed Food-Grade Packaging</span>
              <p className="text-slate-600 dark:text-[#8B96A8] leading-relaxed">
                Produce is packed in breathable, 100% biodegradable cornstarch bags or recyclable corrugated crates to avoid cross-contamination.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
