import type { Metadata } from 'next';
import { Newspaper, Mail, Download, ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Press & Media Kit | DevVegis Technologies Pvt. Ltd.',
  description: 'Official press releases, media assets, founder interviews, and company milestones for DevVegis quick agri-commerce platform.',
};

export default function PressPage() {
  const news = [
    {
      date: 'August 2026',
      outlet: 'AgriTech India Weekly',
      title: 'DevVegis Achieves 12-Minute Cold-Chain Delivery Milestone Across Bengaluru Dark Stores',
      desc: 'How proprietary reefer fleet telemetry and morning APMC Mandi linkages enable zero-wilt grocery delivery.',
    },
    {
      date: 'June 2026',
      outlet: 'Retail Tech Review',
      title: 'AI Freshness Scanner Brings Spectral Produce Grading Directly to Consumer Kitchens',
      desc: 'Computer vision integration guarantees over 95% cellular integrity before packing.',
    },
  ];

  return (
    <div className="container-main py-10 max-w-4xl space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
          <Newspaper className="w-3.5 h-3.5" />
          <span>Press Room</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8]">
          News, Milestones & Media Kit
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#8B96A8]">
          Read our latest company announcements or reach out to our media relations desk.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-[#E8EEF8]">Featured Coverage</h2>
        {news.map((item, i) => (
          <div key={i} className="card p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-600">
              <span>{item.date}</span>
              <span>•</span>
              <span className="font-bold">{item.outlet}</span>
            </div>
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">{item.title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#8B96A8] leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-[#0c1017]">
        <div>
          <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">Media Inquiries & Press Kit</h3>
          <p className="text-xs text-slate-500 mt-0.5">High-resolution logo assets, product imagery, and executive bios.</p>
        </div>
        <a href="mailto:press@devvegis.com" className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2 shrink-0">
          <Mail className="w-4 h-4" />
          <span>press@devvegis.com</span>
        </a>
      </div>
    </div>
  );
}
