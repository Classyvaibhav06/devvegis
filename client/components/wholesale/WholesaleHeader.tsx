'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search, User, Heart, ShoppingBag, Store, Sun, Moon,
  LogOut, ShieldCheck, ChevronDown, Phone, ArrowUpRight
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/providers/themeProvider';
import { useCartStore } from '@/store/cartStore';

export default function WholesaleHeader({
  crateCount = 0,
  onOpenPO,
}: {
  crateCount?: number;
  onOpenPO?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const { itemCount } = useCartStore();

  useEffect(() => {
    setSearchTerm(searchParams?.get('q') || '');
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim());
    } else {
      params.delete('q');
    }
    router.push(`/wholesale?${params.toString()}`);
  };

  const displayCartCount = crateCount > 0 ? crateCount : itemCount;

  return (
    <div className="bg-white dark:bg-[#0B0F17] border-b border-slate-200 dark:border-white/[0.08] transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4 lg:gap-8">
        {/* ─── 1. Brand Logo ─── */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/wholesale" className="group flex flex-col">
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-slate-900 dark:text-white">
                Dev<span className="text-[#10B981]">Vegis</span>
              </span>
              <span className="font-heading font-extrabold text-sm sm:text-base text-amber-500 tracking-wider">
                WHOLESALE<sup className="text-[10px] ml-0.5 font-bold">®</sup>
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide mt-1">
              Bachat Ka Naya Tareeka! · APMC Mandi B2B
            </span>
          </Link>
        </div>

        {/* ─── 2. Centered Wide Search Bar ─── */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-2xl hidden md:flex items-center relative"
        >
          <div className="relative w-full flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search wholesale product, crates, mandi items (e.g. Tomatoes, Onions)..."
              className="w-full pl-4 pr-12 py-2.5 bg-slate-50 dark:bg-[#131923] border border-slate-300/80 dark:border-white/10 rounded-[2px] text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-[2px] text-slate-500 hover:text-[#10B981] dark:text-slate-400 dark:hover:text-[#10B981] transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* ─── 3. Right Action Tools ─── */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0 text-xs font-semibold text-slate-700 dark:text-slate-200">
          {/* User Account / Login */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1.5 py-1 px-2 hover:text-[#10B981] dark:hover:text-[#10B981] transition-colors"
              >
                <div className="w-7 h-7 rounded-[2px] bg-emerald-500/10 border border-emerald-500/20 text-[#10B981] flex items-center justify-center font-bold text-xs">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold leading-tight line-clamp-1">{user.name}</p>
                  <p className="text-[10px] text-amber-500 font-mono uppercase">{user.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#111722] border border-slate-200 dark:border-white/10 rounded-[2px] shadow-xl py-2 z-50 animate-fade-up">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-white/5">
                    <p className="text-xs font-bold truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="block px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Buyer Dashboard
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setIsProfileOpen(false)}
                    className="block px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Purchase Orders
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin/wholesale"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-3 py-2 text-xs text-amber-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-white/5 font-bold transition-colors"
                    >
                      Admin Wholesale Desk
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setIsProfileOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login?redirect=/wholesale"
              className="flex items-center gap-1.5 py-1 px-2.5 rounded-[2px] hover:text-[#10B981] dark:hover:text-[#10B981] transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </Link>
          )}

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="hidden sm:flex items-center gap-1.5 py-1 px-2 hover:text-rose-500 transition-colors"
            title="Wholesale Wishlist"
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist</span>
          </Link>

          {/* PO Cart with Red Badge */}
          <button
            onClick={onOpenPO}
            className="flex items-center gap-1.5 py-1 px-2 relative hover:text-[#10B981] transition-colors cursor-pointer"
            title="Purchase Order Crates"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {displayCartCount}
              </span>
            </div>
            <span className="hidden sm:inline">PO Cart</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-[2px] bg-slate-100 dark:bg-[#131923] border border-slate-200 dark:border-white/10 hover:border-slate-300 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Mobile search input */}
      <div className="px-4 pb-3 md:hidden">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search wholesale products, crates..."
            className="w-full pl-3.5 pr-10 py-2 bg-slate-50 dark:bg-[#131923] border border-slate-300/80 dark:border-white/10 rounded-[2px] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
