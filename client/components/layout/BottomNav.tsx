'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/cart', icon: ShoppingCart, label: 'Cart', showBadge: true },
  { href: '/wishlist', icon: Heart, label: 'Wishlist' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCartStore();

  return (
    <nav className="bottom-nav pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-1 rounded-[4px] transition-all relative',
                isActive ? 'text-emerald-600 dark:text-[#34D399]' : 'text-slate-500 dark:text-[#8B96A8]'
              )}
            >
              <div className="relative">
                <item.icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
                {item.showBadge && itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-[2px] flex items-center justify-center"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-emerald-600 dark:bg-[#10B981] rounded-[1px]"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
