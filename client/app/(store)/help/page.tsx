import type { Metadata } from 'next';
import { HelpCircle, ChevronDown, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Help Center & Frequently Asked Questions (FAQ) | DevVegis',
  description: 'Find answers to common questions about DevVegis express grocery delivery, payment options, order tracking, and refund policies.',
};

const FAQS = [
  {
    q: 'How fast does DevVegis deliver groceries in Bengaluru?',
    a: 'DevVegis delivers farm-fresh groceries rapidly across major Bengaluru hubs including Indiranagar, Koramangala, HSR Layout, Whitefield, and Bellandur through our hyper-local network of temperature-controlled dark stores.',
  },
  {
    q: 'Are DevVegis vegetables and fruits 100% organic?',
    a: 'DevVegis offers both Certified Organic produce (grown without synthetic fertilizers or chemical pesticides, certified by accredited Indian organic agencies) and Hydroponic & Farm-Direct fresh staples harvested daily at dawn.',
  },
  {
    q: 'What is the minimum order value for free delivery?',
    a: 'Free delivery is automatically applied to all orders of ₹100 and above. Orders below ₹100 carry a nominal delivery partner fee of ₹40 (or as configured in platform rules).',
  },
  {
    q: 'How does the instant refund guarantee work?',
    a: 'If any produce item arrives damaged or below your freshness standards, simply navigate to your Orders page and select "Request Refund". The full item value is refunded directly within 60 seconds without return pickups.',
  },
  {
    q: 'How does B2B wholesale Mandi purchasing work on DevVegis?',
    a: 'Restaurants, hotels, and caterers can visit our Wholesale portal to purchase 25kg to 50kg crates at primary Mandi benchmark auction rates, with automated GST invoicing and Net-15/30 credit financing.',
  },
];

export default function HelpPage() {
  return (
    <div className="container-main py-10 max-w-4xl space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-[#E8EEF8]">
          Help Center & FAQs
        </h1>
        <p className="text-sm text-slate-600 dark:text-[#8B96A8]">
          Frequently asked questions about orders, payments, delivery zones, and produce quality.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, i) => (
          <div key={i} className="card p-6 space-y-2">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">
              {faq.q}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#8B96A8] leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>

      <div className="card p-6 text-center space-y-3 bg-slate-50 dark:bg-[#0c1017]">
        <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Still have questions?</h3>
        <p className="text-xs text-slate-500">Our customer care champions are active from 05:00 AM to 11:30 PM daily.</p>
        <div className="flex justify-center gap-4 pt-1 text-xs">
          <Link href="/contact" className="btn-primary py-2 px-5">Contact Support</Link>
          <a href="tel:180033883447" className="btn-secondary py-2 px-5">Call 1800-DEV-VEGIS</a>
        </div>
      </div>
    </div>
  );
}
