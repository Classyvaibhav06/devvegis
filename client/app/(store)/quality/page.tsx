import type { Metadata } from 'next';
import { Award, ShieldCheck, Zap, Thermometer, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Produce Quality Guarantee — 100% Farm Fresh | DevVegis',
  description: 'DevVegis 100% Quality Assurance Guarantee. Instant refund or replacement with zero questions asked if produce is less than pristine.',
};

export default function QualityPage() {
  return (
    <div className="container-main py-10 max-w-4xl space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>The DevVegis Promise</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8]">
          Our Quality Guarantee
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#8B96A8]">
          We stand by the crispness, taste, and safety of every single vegetable and fruit we deliver.
        </p>
      </div>

      <div className="card p-6 sm:p-8 space-y-6">
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-start gap-4">
          <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">
              No-Questions-Asked Instant Refund
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#8B96A8] leading-relaxed">
              If an apple is bruised, spinach has wilted leaves, or produce arrives below your expectations, tap "Request Refund" in your Order History. Your refund will be credited directly to your original payment method — no courier returns required.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 space-y-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Harvested at 4:30 AM</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Produce reaches your kitchen within 6–8 hours of being clipped from the soil.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 space-y-2">
            <Thermometer className="w-5 h-5 text-emerald-500" />
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Cold-Chain Reefer</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Temperature never rises above 5°C during transport, avoiding moisture breakdown.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/10 space-y-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Daily Fresh Clearance</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Any unsold fresh leafy greens at midnight are donated or composted, never sold next day.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
