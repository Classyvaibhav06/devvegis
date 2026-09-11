import Link from 'next/link';
import { Leaf, Building2, Phone, Mail, FileText, ArrowRight } from 'lucide-react';

export default function WholesaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Wholesale Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="container-main flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center text-white">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-lg text-gray-900 dark:text-gray-100">
                DevVegis
              </span>
            </Link>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              B2B Wholesale
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="tel:+918001234567"
              className="hidden sm:flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-green-600"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>B2B Desk: 1800-123-4567</span>
            </a>
            <Link href="/" className="btn-secondary text-xs py-1.5 px-3">
              Retail Store
            </Link>
          </div>
        </div>
      </header>

      {/* Main B2B Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Wholesale Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 text-center text-xs text-gray-500">
        <div className="container-main">
          DevVegis B2B Wholesale Supply Chain • Certified Mandi Direct • GST Invoicing Ready
        </div>
      </footer>
    </div>
  );
}
