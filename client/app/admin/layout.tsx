import Link from 'next/link';
import { Leaf, LayoutDashboard, Package, Users, ShoppingBag, Tag, Image as ImageIcon, TruckIcon, BarChart3, Settings, ChevronRight } from 'lucide-react';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/inventory', icon: BarChart3, label: 'Inventory' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/riders', icon: TruckIcon, label: 'Riders' },
  { href: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { href: '/admin/banners', icon: ImageIcon, label: 'Banners' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 fixed top-0 left-0 h-full z-30 hidden md:flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-green rounded-xl flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-heading font-bold text-sm leading-none">
                <span className="text-green-600">Dev</span><span className="text-gray-800 dark:text-gray-100">Vegis</span>
              </p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 transition-all group"
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
              <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-green-600 transition-colors">
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-56 p-6 min-h-screen">
        {children}
      </main>
    </div>
  );
}
