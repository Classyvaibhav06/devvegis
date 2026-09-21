'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from './themeProvider';
import AuthModal from '@/components/auth/AuthModal';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 15, // 15 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <AuthModal />
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              fontFamily: 'Inter, sans-serif',
              borderRadius: '12px',
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
