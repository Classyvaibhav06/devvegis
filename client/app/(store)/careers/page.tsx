import type { Metadata } from 'next';
import { Briefcase, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Careers at DevVegis — Building the Future of Quick Agri-Commerce',
  description: 'Join the DevVegis team in Bengaluru. Explore open roles across software engineering, cold-chain operations, agricultural sourcing, and rider logistics.',
};

export default function CareersPage() {
  const roles = [
    { title: 'Senior Full Stack Engineer (Next.js & Node)', dept: 'Engineering', loc: 'Bengaluru / Hybrid' },
    { title: 'Cold-Chain Logistics Operations Lead', dept: 'Supply Chain', loc: 'Indiranagar Hub, Bengaluru' },
    { title: 'Agricultural Procurement Specialist', dept: 'Farm Sourcing', loc: 'Kolar & Nashik Clusters' },
    { title: 'Dark Store Fulfillment Supervisor', dept: 'Operations', loc: 'Koramangala, Bengaluru' },
  ];

  return (
    <div className="container-main py-10 max-w-4xl space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Join DevVegis</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8]">
          Work With Purpose. Build Fast.
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#8B96A8]">
          We are redesigning India's agricultural supply chain from farm gate to dining table.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-[#E8EEF8]">Open Positions</h2>
        {roles.map((r, i) => (
          <div key={i} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-500/40 transition-colors">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">{r.title}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>{r.dept}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-600" />{r.loc}</span>
              </div>
            </div>
            <a href="mailto:careers@devvegis.com?subject=Application for role" className="btn-secondary text-xs px-4 py-2 inline-flex items-center gap-1.5 self-start sm:self-auto">
              <span>Apply Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
