'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ShieldAlert, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">Admin Access Restricted</h2>
          <p className="text-sm text-gray-500">
            You must be signed in with an authorized Administrator account to access the DevVegis Command Center.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login?redirect=/admin"
              className="btn-primary py-2.5 text-center text-sm font-semibold shadow-lime"
            >
              Sign In as Admin
            </Link>
            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-green-600 transition-colors py-1"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
