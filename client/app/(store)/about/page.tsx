import type { Metadata } from 'next';
import Link from 'next/link';
import { Leaf, Truck, ShieldCheck, Award, HeartHandshake, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About DevVegis — Farm to Kitchen in 12 Minutes | Our Mission & Sourcing',
  description: 'Learn how DevVegis connects certified Indian organic farm clusters to urban kitchens in under 12 minutes through hyper-local cold-chain dark stores.',
};

export default function AboutPage() {
  return (
    <div className="container-main py-10 space-y-14">
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5" />
          <span>Our Agriculture Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8] tracking-tight">
          Pioneering Freshness. <br />
          <span className="text-emerald-600 dark:text-emerald-400">Farm Direct in 12 Minutes.</span>
        </h1>
        <p className="text-slate-600 dark:text-[#8B96A8] text-sm sm:text-base leading-relaxed">
          DevVegis was founded on a simple conviction: produce eaten the same morning it was harvested has 4x higher vitamin retention, peak crispness, and zero chemical preservatives. By bridging rural farming belts with Bengaluru dark stores via temperature-controlled logistics, we deliver dawn harvests right to your doorstep.
        </p>
      </section>

      {/* 3 Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 sm:p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-[#E8EEF8]">
            Unbroken 4°C Cold Chain
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#8B96A8] leading-relaxed">
            From our pre-cooling farm centers in Kolar and Nashik to our Indiranagar Dark Store, produce is kept in climate-regulated reefers at an unbroken 3.8°C–4.2°C to prevent wilt and preserve cellular hydration.
          </p>
        </div>

        <div className="card p-6 sm:p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-[#E8EEF8]">
            100% Zero Synthetic Pesticides
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#8B96A8] leading-relaxed">
            Every incoming batch undergoes rapid chemical residue testing and spectral computer vision inspection. Only produce that passes certified FSSAI standards reaches our fulfillment racks.
          </p>
        </div>

        <div className="card p-6 sm:p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-[#E8EEF8]">
            Direct Mandi Farm-Gate Pricing
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#8B96A8] leading-relaxed">
            By eliminating 4–5 intermediaries between the APMC auction yard and consumers, our partner farmers earn 30% higher remuneration while families save on weekly kitchen staples.
          </p>
        </div>
      </section>

      {/* Sourcing Provenance Table */}
      <section className="card p-6 sm:p-8 space-y-4">
        <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-[#E8EEF8]">
          Certified Sourcing Provenance
        </h2>
        <p className="text-xs text-slate-500 dark:text-[#8B96A8]">
          We openly disclose the geographic origin of our agricultural clusters:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 space-y-1">
            <span className="text-xs font-bold text-emerald-600">Lasalgaon, Nashik</span>
            <p className="text-sm font-heading font-bold text-slate-900 dark:text-white">Export Red Onions</p>
            <p className="text-[11px] text-slate-500">Graded 55mm+ cured heavy skins</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 space-y-1">
            <span className="text-xs font-bold text-emerald-600">Kolar Cluster, Karnataka</span>
            <p className="text-sm font-heading font-bold text-slate-900 dark:text-white">Polyhouse Tomatoes</p>
            <p className="text-[11px] text-slate-500">Naturally ripened firm salad turn</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 space-y-1">
            <span className="text-xs font-bold text-emerald-600">Malwa Belt, Indore</span>
            <p className="text-sm font-heading font-bold text-slate-900 dark:text-white">Jyoti Table Potatoes</p>
            <p className="text-[11px] text-slate-500">Low-sugar cured sorting</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 space-y-1">
            <span className="text-xs font-bold text-emerald-600">Nilgiris, Ooty</span>
            <p className="text-sm font-heading font-bold text-slate-900 dark:text-white">Table Carrots & Greens</p>
            <p className="text-[11px] text-slate-500">High-altitude sweet core harvest</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-6">
        <Link href="/categories" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm">
          <span>Explore Fresh Harvest Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
