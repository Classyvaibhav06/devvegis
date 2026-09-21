import Link from 'next/link';
import { Leaf, Mail, Phone, MapPin, Globe, MessageCircle, Send, ShieldCheck, Zap, Truck, Store } from 'lucide-react';

const footerLinks = {
  company: [
    { label: 'Our Story & Farms', href: '/about' },
    { label: 'Dawn Harvest Quality', href: '/quality' },
    { label: 'Careers & Riders', href: '/careers' },
    { label: 'Press & Media', href: '/press' },
    { label: 'Recipe Journal', href: '/ai/recipe' },
  ],
  shop: [
    { label: 'Daily Vegetables', href: '/categories/vegetables' },
    { label: 'Orchard Fruits', href: '/categories/fruits' },
    { label: '100% Certified Organic', href: '/categories/organic' },
    { label: 'All Fresh Categories', href: '/categories' },
    { label: 'Bulk Mandi B2B', href: '/wholesale' },
  ],
  support: [
    { label: 'Help & FAQs', href: '/help' },
    { label: 'Track Order Live', href: '/orders' },
    { label: 'Refund & Quality Guarantee', href: '/refunds' },
    { label: 'Contact DevVegis Care', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'FSSAI License & Food Safety', href: '/food-safety' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-[#080C14] border-t border-slate-200 dark:border-white/[0.07] mt-20 transition-colors">
      {/* ─── Top Trust Strip ─────────────────────────────────────── */}
      <div className="border-b border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#0F1520]/50">
        <div className="container-main py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-[4px] bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-[#E8EEF8]">Express Delivery</h4>
                <p className="text-[11px] text-slate-500 dark:text-[#8B96A8]">From cold-chain dark stores</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-[4px] bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-[#E8EEF8]">Farm Handpicked</h4>
                <p className="text-[11px] text-slate-500 dark:text-[#8B96A8]">Harvested fresh at 4:30 AM</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-[4px] bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-[#E8EEF8]">Zero Pesticide Tested</h4>
                <p className="text-[11px] text-slate-500 dark:text-[#8B96A8]">100% Certified Ethical farms</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 rounded-[4px] bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-[#E8EEF8]">B2B Wholesale Mandi</h4>
                <p className="text-[11px] text-slate-500 dark:text-[#8B96A8]">Bulk 25kg+ crates with GST</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Footer Content ─────────────────────────────────── */}
      <div className="container-main py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-tr from-[#10B981] to-[#059669] rounded-[4px] flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Leaf className="w-5 h-5 text-white dark:text-[#080C14]" />
              </div>
              <div className="flex items-baseline leading-none">
                <span className="font-heading font-extrabold text-xl text-slate-900 dark:text-[#E8EEF8]">Dev</span>
                <span className="font-heading font-extrabold text-xl text-emerald-600 dark:text-emerald-400">Vegis</span>
              </div>
            </Link>

            <p className="text-xs text-slate-600 dark:text-[#8B96A8] leading-relaxed">
              India&apos;s premium quick-commerce produce market. Delivering crisp, organic, and ethically farmed fruits and vegetables directly to urban kitchens in minutes.
            </p>

            <div className="flex items-center gap-2 pt-1">
              {[
                { Icon: Globe, label: 'Visit DevVegis Website', href: 'https://devvegis.com' },
                { Icon: MessageCircle, label: 'Contact WhatsApp Support', href: 'https://wa.me/9180033883447' },
                { Icon: Send, label: 'Join DevVegis Telegram Channel', href: 'https://t.me/devvegis' },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/[0.07] rounded-[4px] flex items-center justify-center text-slate-600 dark:text-[#8B96A8] hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                  aria-label={label}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-[#E8EEF8] mb-3.5">
              Company
            </h4>
            <ul className="space-y-2 text-xs">
              {footerLinks.company.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-600 dark:text-[#8B96A8] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-[#E8EEF8] mb-3.5">
              Fresh Catalog
            </h4>
            <ul className="space-y-2 text-xs">
              {footerLinks.shop.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-600 dark:text-[#8B96A8] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-[#E8EEF8] mb-3.5">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs">
              {footerLinks.support.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-600 dark:text-[#8B96A8] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Support Hotline */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-[#E8EEF8] mb-3.5">
              Dawn Hotline
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-[#8B96A8]">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-bold text-slate-900 dark:text-[#E8EEF8]">1800-DEV-VEGIS</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>orders@devvegis.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Indiranagar Central Dark Store, Bengaluru, KA 560038</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Copyright Bar ───────────────────────────────── */}
      <div className="border-t border-slate-200 dark:border-white/[0.07] py-4 bg-slate-100 dark:bg-[#080C14]">
        <div className="container-main flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-[#8B96A8]">
          <p>&copy; {new Date().getFullYear()} DevVegis Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {footerLinks.legal.map(link => (
              <Link key={link.href} href={link.href} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
