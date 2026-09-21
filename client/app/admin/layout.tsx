'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Users, ShoppingBag, Tag, Image as ImageIcon,
  TruckIcon, BarChart3, Settings, ChevronRight, Warehouse, Layers,
  Menu, X, ArrowLeft, ExternalLink, ShieldCheck
} from 'lucide-react';
import AdminGuard from '@/components/admin/AdminGuard';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/categories', icon: Layers, label: 'Categories' },
  { href: '/admin/inventory', icon: BarChart3, label: 'Inventory' },
  { href: '/admin/wholesale', icon: Warehouse, label: 'Wholesale' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/riders', icon: TruckIcon, label: 'Riders' },
  { href: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { href: '/admin/banners', icon: ImageIcon, label: 'Banners' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Automatically close mobile menu whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col md:flex-row">
        {/* Mobile Top Navigation Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 z-30 px-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-1 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/admin" className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-emerald-500/30 shrink-0 bg-white">
                <Image src="/logo.png" alt="DevVegis Logo" fill sizes="32px" className="object-cover" priority />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-sm leading-none">
                  <span className="text-emerald-600">Dev</span>
                  <span className="text-gray-900 dark:text-gray-100">Vegis</span>
                </span>
                <span className="text-[10px] text-gray-500 font-medium">Admin Console</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-500/20"
            >
              <span>Store</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Mobile Slide-out Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
                aria-hidden="true"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                className="fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-gray-900 z-50 flex flex-col border-r border-gray-200 dark:border-gray-800 shadow-2xl md:hidden"
              >
                {/* Drawer Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-emerald-500/30 shrink-0 bg-white">
                      <Image src="/logo.png" alt="DevVegis Logo" fill sizes="36px" className="object-cover" />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-sm leading-none">
                        <span className="text-emerald-600">Dev</span>
                        <span className="text-gray-900 dark:text-gray-100">Vegis</span>
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">Admin Management</p>
                    </div>
                  </Link>

                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Navigation Links */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                  {navItems.map((item) => {
                    const isActive = item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs border border-emerald-500/20'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                      >
                        <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                        <span>{item.label}</span>
                        {isActive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-300 dark:text-gray-600 opacity-60" />
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* Drawer Footer */}
                <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-2 bg-gray-50/50 dark:bg-gray-900/50">
                  <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Admin Authenticated</span>
                  </div>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Customer Store</span>
                  </Link>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar (Permanent) */}
        <aside className="w-60 bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800 fixed top-0 left-0 h-full z-30 hidden md:flex flex-col shadow-xs">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-emerald-500/30 shadow-xs shrink-0 bg-white">
                <Image src="/logo.png" alt="DevVegis Logo" fill sizes="36px" className="object-cover" priority />
              </div>
              <div>
                <p className="font-heading font-bold text-sm leading-none">
                  <span className="text-emerald-600">Dev</span>
                  <span className="text-gray-800 dark:text-gray-100">Vegis</span>
                </p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">Admin • JK &amp; DK Mart</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = item.href === '/admin'
                ? pathname === '/admin'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20 shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 group-hover:text-emerald-600'}`} />
                  <span>{item.label}</span>
                  {isActive ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto" />
                  ) : (
                    <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-emerald-600 transition-colors p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 pt-20 p-4 sm:p-6 md:ml-60 md:pt-6 md:p-8 min-h-screen overflow-x-hidden">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
