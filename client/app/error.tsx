'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root application error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-16 bg-[#F8FAFC] dark:bg-[#080C14]">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-6 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-[#E8EEF8] mb-2">
        DevVegis encountered a glitch
      </h2>
      <p className="text-sm text-slate-500 dark:text-[#8B96A8] max-w-md mb-8">
        We ran into an unexpected problem while loading this page. Please try refreshing or return to the storefront.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="btn-primary inline-flex items-center gap-2 text-xs py-2.5 px-5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Page</span>
        </button>
        <Link
          href="/"
          className="btn-secondary inline-flex items-center gap-2 text-xs py-2.5 px-5"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to Store</span>
        </Link>
      </div>
    </div>
  );
}
