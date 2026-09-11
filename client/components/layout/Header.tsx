'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, Heart, Bell, User, Menu, X, MapPin,
  ChevronDown, Package, LogOut, Settings, Headphones,
  Sparkles, Leaf, History, Zap, Store, ShieldCheck,
  Sun, Moon
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/providers/themeProvider';
import { cn, getInitials, formatCurrency } from '@/lib/utils';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [location, setLocation] = useState('Indiranagar, Bengaluru');
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount, total } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme, isDark } = useTheme();
  const searchRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut ⌘K or Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    logout();
    setIsProfileOpen(false);
    router.push('/');
  };

  const isWholesale = pathname?.startsWith('/wholesale');

  return (
    <header className={cn(
      'sticky top-0 z-40 transition-all duration-200 border-b border-slate-200/80 dark:border-white/[0.07]',
      isScrolled
        ? 'bg-white/95 dark:bg-[#0F1520]/95 backdrop-blur-md shadow-md dark:shadow-2xl'
        : 'bg-white dark:bg-[#0F1520]'
    )}>
      {/* ─── Top Utility Micro-Bar ──────────────────────────────── */}
      <div className="bg-slate-100/90 dark:bg-[#080C14] border-b border-slate-200/60 dark:border-white/[0.05] text-xs py-1.5 px-4 hidden sm:block">
        <div className="container-main flex items-center justify-between">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-[#161E2E] p-0.5 rounded-full border border-slate-300/60 dark:border-white/[0.07]">
            <Link
              href="/"
              className={cn(
                "px-3 py-0.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1",
                !isWholesale
                  ? "bg-[#10B981] text-white shadow-sm shadow-[#10B981]/30"
                  : "text-slate-600 dark:text-[#8B96A8] hover:text-slate-900 dark:hover:text-[#E8EEF8]"
              )}
            >
              <Zap className="w-3 h-3 fill-white" />
              <span>⚡ Retail (10-15 Min)</span>
            </Link>
            <Link
              href="/wholesale"
              className={cn(
                "px-3 py-0.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1",
                isWholesale
                  ? "bg-[#F59E0B] text-[#080C14] font-extrabold shadow-sm"
                  : "text-slate-600 dark:text-[#8B96A8] hover:text-slate-900 dark:hover:text-[#E8EEF8]"
              )}
            >
              <Store className="w-3 h-3" />
              <span>🏪 Wholesale (Bulk Mandi)</span>
            </Link>
          </div>

          {/* Quick links & guarantees */}
          <div className="flex items-center gap-5 text-slate-600 dark:text-[#8B96A8] text-[11px] font-medium">
            <Link href="/orders" className="hover:text-[#10B981] transition-colors flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="font-semibold text-slate-900 dark:text-[#E8EEF8]">🔁 Buy Again</span>
            </Link>
            <span className="text-slate-300 dark:text-white/10">|</span>
            <span className="flex items-center gap-1 text-slate-600 dark:text-[#8B96A8]">
              <Zap className="w-3 h-3 text-[#10B981] fill-[#10B981]" />
              <span>⚡ 12-Min Delivery Dispatch</span>
            </span>
            <span className="text-slate-300 dark:text-white/10">|</span>
            <span className="text-emerald-600 dark:text-[#34D399] font-bold flex items-center gap-1">
              <span>🎉 Free Delivery Above ₹199</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── Main Header Bar ───────────────────────────────────── */}
      <div className="container-main">
        <div className="flex items-center justify-between gap-3 md:gap-6 h-18 py-2">
          {/* Brand Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl flex items-center justify-center shadow-lg shadow-[#10B981]/25 group-hover:scale-105 transition-transform duration-200">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline leading-none">
                  <span className="font-display font-extrabold text-2xl tracking-tight text-slate-900 dark:text-[#E8EEF8]">Dev</span>
                  <span className="font-display font-extrabold text-2xl tracking-tight text-[#10B981]">Vegis</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-[#4E5A6B] uppercase tracking-wider">
                  Farm Fresh in 12 Mins
                </span>
              </div>
            </Link>

            {/* Delivery Location Dropdown */}
            <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-white/[0.07] text-left">
              <div className="bg-emerald-500/15 text-emerald-600 dark:text-[#34D399] border border-emerald-500/30 text-[10px] font-extrabold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Zap className="w-2.5 h-2.5 fill-current" />
                <span>12 MINS</span>
              </div>
              <div className="cursor-pointer group">
                <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-[#4E5A6B] tracking-wider">Delivery To</div>
                <div className="text-xs font-bold text-slate-800 dark:text-[#E8EEF8] flex items-center gap-1 group-hover:text-[#10B981] transition-colors">
                  <span className="max-w-[130px] truncate">{location}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 dark:text-[#4E5A6B] group-hover:text-[#10B981]" />
                </div>
              </div>
            </div>
          </div>

          {/* Omni Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-[#4E5A6B] group-focus-within:text-[#10B981] transition-colors" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search vegetables, fruits, organic herbs..."
                className="w-full pl-10 pr-16 py-2.5 bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/[0.07] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-[#E8EEF8] placeholder-slate-400 dark:placeholder-[#4E5A6B] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/40 transition-all shadow-inner"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-white dark:bg-[#0F1520] border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-400 dark:text-[#4E5A6B] shadow-xs">
                    ⌘K
                  </span>
                )}
              </div>
            </div>
          </form>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle Button (Light ☀️ / Dark 🌙) */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-[#8B96A8] hover:text-slate-900 dark:hover:text-[#E8EEF8] bg-slate-100 dark:bg-[#161E2E] hover:bg-slate-200 dark:hover:bg-[#1C2637] transition-all border border-slate-200/80 dark:border-white/10"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle light/dark theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="w-9 h-9 rounded-xl hidden lg:flex items-center justify-center text-slate-600 dark:text-[#8B96A8] hover:text-slate-900 dark:hover:text-[#E8EEF8] hover:bg-slate-100 dark:hover:bg-[#161E2E] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/[0.07]"
              title="Wishlist"
            >
              <Heart className="w-4.5 h-4.5" />
            </Link>

            {/* Order History */}
            <Link
              href="/orders"
              className="w-9 h-9 rounded-xl hidden lg:flex items-center justify-center text-slate-600 dark:text-[#8B96A8] hover:text-slate-900 dark:hover:text-[#E8EEF8] hover:bg-slate-100 dark:hover:bg-[#161E2E] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/[0.07]"
              title="Order History"
            >
              <History className="w-4.5 h-4.5" />
            </Link>

            {/* Notifications */}
            {isAuthenticated && (
              <Link
                href="/notifications"
                className="w-9 h-9 rounded-xl hidden sm:flex items-center justify-center text-slate-600 dark:text-[#8B96A8] hover:text-slate-900 dark:hover:text-[#E8EEF8] hover:bg-slate-100 dark:hover:bg-[#161E2E] transition-colors relative border border-transparent hover:border-slate-200 dark:hover:border-white/[0.07]"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white dark:ring-[#0F1520]" />
              </Link>
            )}

            {/* Cart Button with Neon Emerald Gradient */}
            <Link
              href="/cart"
              className="flex items-center gap-2 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white transition-all duration-150 px-4 py-2 rounded-xl font-bold shadow-lg shadow-[#10B981]/25 active:scale-95 group shrink-0"
            >
              <ShoppingCart className="w-4.5 h-4.5 group-hover:rotate-6 transition-transform" />
              <span className="font-display text-xs sm:text-sm font-bold tracking-tight">
                {itemCount > 0 ? (
                  <>{itemCount} • {formatCurrency(total)}</>
                ) : (
                  <>Cart</>
                )}
              </span>
            </Link>

            {/* User Profile / Login */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-[#161E2E] transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/[0.07]"
                >
                  <div className="w-8 h-8 bg-gradient-to-tr from-[#10B981] to-[#34D399] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs">
                    {getInitials(user?.name || 'U')}
                  </div>
                  <ChevronDown className={cn('w-3 h-3 text-slate-500 dark:text-[#8B96A8] hidden md:block transition-transform', isProfileOpen && 'rotate-180')} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0F1520] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.07]">
                        <p className="font-semibold text-slate-900 dark:text-[#E8EEF8] text-sm">{user?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-[#8B96A8] truncate">{user?.email}</p>
                        {user?.wallet && (
                          <span className="inline-flex items-center gap-1 mt-1.5 text-xs bg-emerald-500/15 text-emerald-600 dark:text-[#34D399] border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                            💰 ₹{user.wallet.balance} Wallet
                          </span>
                        )}
                      </div>

                      {[
                        { href: '/profile', icon: User, label: 'My Profile' },
                        { href: '/orders', icon: Package, label: 'My Orders' },
                        ...(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? [{ href: '/admin', icon: Settings, label: 'Admin Panel' }] : []),
                        ...(user?.role === 'RIDER' ? [{ href: '/rider', icon: Package, label: 'Rider Dashboard' }] : []),
                        { href: '/help', icon: Headphones, label: 'Help Center' },
                      ].map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-[#8B96A8] hover:bg-slate-100 dark:hover:bg-[#161E2E] hover:text-[#10B981] transition-colors"
                        >
                          <item.icon className="w-4 h-4 text-slate-400 dark:text-[#4E5A6B]" />
                          {item.label}
                        </Link>
                      ))}

                      <div className="border-t border-slate-100 dark:border-white/[0.07] mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs sm:text-sm font-bold bg-slate-100 dark:bg-[#161E2E] hover:bg-slate-200 dark:hover:bg-[#1C2637] border border-slate-200 dark:border-white/[0.07] hover:border-[#10B981]/40 text-slate-900 dark:text-[#E8EEF8] px-4 py-2 rounded-xl transition-all"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-[#8B96A8] hover:bg-slate-100 dark:hover:bg-[#161E2E] md:hidden"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Fast-Nav Secondary Category Rail ─────────────────────── */}
      <div className="border-t border-slate-200/60 dark:border-white/[0.05] bg-slate-50 dark:bg-[#0B1019] px-4 transition-colors">
        <div className="container-main flex items-center justify-between overflow-x-auto scrollbar-hide py-2 text-xs font-semibold">
          <div className="flex items-center gap-6 shrink-0">
            <Link
              href="/categories/vegetables"
              className={cn(
                "pb-1 transition-colors flex items-center gap-1.5",
                pathname === '/categories/vegetables'
                  ? "text-emerald-600 dark:text-[#34D399] border-b-2 border-[#10B981] font-bold"
                  : "text-slate-600 dark:text-[#8B96A8] hover:text-slate-900 dark:hover:text-[#E8EEF8]"
              )}
            >
              <span>🥦 Daily Produce</span>
            </Link>
            <Link
              href="/categories/fruits"
              className={cn(
                "pb-1 transition-colors flex items-center gap-1.5",
                pathname === '/categories/fruits'
                  ? "text-emerald-600 dark:text-[#34D399] border-b-2 border-[#10B981] font-bold"
                  : "text-slate-600 dark:text-[#8B96A8] hover:text-slate-900 dark:hover:text-[#E8EEF8]"
              )}
            >
              <span>🍎 Sweet Fruits</span>
            </Link>
            <Link
              href="/categories/organic"
              className={cn(
                "pb-1 transition-colors flex items-center gap-1.5",
                pathname === '/categories/organic'
                  ? "text-emerald-600 dark:text-[#34D399] border-b-2 border-[#10B981] font-bold"
                  : "text-slate-600 dark:text-[#8B96A8] hover:text-slate-900 dark:hover:text-[#E8EEF8]"
              )}
            >
              <span>🌿 100% Organic</span>
            </Link>
            <Link
              href="/categories/exotic-vegetables"
              className={cn(
                "pb-1 transition-colors flex items-center gap-1.5",
                pathname === '/categories/exotic-vegetables'
                  ? "text-emerald-600 dark:text-[#34D399] border-b-2 border-[#10B981] font-bold"
                  : "text-slate-600 dark:text-[#8B96A8] hover:text-slate-900 dark:hover:text-[#E8EEF8]"
              )}
            >
              <span>✨ Gourmet & Exotic</span>
            </Link>
            <Link
              href="/wholesale"
              className={cn(
                "pb-1 transition-colors flex items-center gap-1.5",
                isWholesale
                  ? "text-[#F59E0B] border-b-2 border-[#F59E0B] font-bold"
                  : "text-[#F59E0B] hover:text-amber-600 font-semibold"
              )}
            >
              <span>🏪 Mandi Wholesale</span>
            </Link>
            <Link
              href="/ai/recipe"
              className="pb-1 transition-colors flex items-center gap-1 text-purple-600 dark:text-[#8B5CF6] hover:text-purple-700 dark:hover:text-purple-300 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Recipe Chef</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-slate-500 dark:text-[#8B96A8] shrink-0">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Zero Chemical Tested</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── Mobile Drawer ───────────────────────────────────────── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#0F1520] px-4 py-4 space-y-4"
          >
            {/* Delivery to badge on mobile */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/[0.07]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#10B981]" />
                <span className="text-xs font-bold text-slate-800 dark:text-[#E8EEF8] truncate max-w-[200px]">{location}</span>
              </div>
              <div className="bg-emerald-500/15 text-emerald-600 dark:text-[#34D399] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                12 MINS
              </div>
            </div>

            {/* Theme Toggle row */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-[#161E2E] border border-slate-200 dark:border-white/[0.07]">
              <span className="text-xs font-bold text-slate-800 dark:text-[#E8EEF8]">Appearance</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-white dark:bg-[#080C14] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-[#E8EEF8]"
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-700" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Navigation links */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link
                href="/categories/vegetables"
                onClick={() => setIsMenuOpen(false)}
                className="p-3 bg-slate-100 dark:bg-[#161E2E] rounded-xl text-slate-800 dark:text-[#E8EEF8] border border-slate-200 dark:border-white/[0.05]"
              >
                🥦 Vegetables
              </Link>
              <Link
                href="/categories/fruits"
                onClick={() => setIsMenuOpen(false)}
                className="p-3 bg-slate-100 dark:bg-[#161E2E] rounded-xl text-slate-800 dark:text-[#E8EEF8] border border-slate-200 dark:border-white/[0.05]"
              >
                🍎 Fruits
              </Link>
              <Link
                href="/categories/organic"
                onClick={() => setIsMenuOpen(false)}
                className="p-3 bg-slate-100 dark:bg-[#161E2E] rounded-xl text-slate-800 dark:text-[#E8EEF8] border border-slate-200 dark:border-white/[0.05]"
              >
                🌿 100% Organic
              </Link>
              <Link
                href="/wholesale"
                onClick={() => setIsMenuOpen(false)}
                className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20"
              >
                🏪 Wholesale Mandi
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
