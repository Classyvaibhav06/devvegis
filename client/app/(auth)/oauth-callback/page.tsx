'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [statusText, setStatusText] = useState('Connecting to Google...');
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const errorParam =
      searchParams.get('oauth_error') ||
      searchParams.get('error') ||
      searchParams.get('error_description');
    if (errorParam) {
      toast.error(`Google Login failed: ${decodeURIComponent(errorParam)}`);
      router.push('/login');
      return;
    }

    const processOAuth = async () => {
      try {
        setStatusText('Retrieving your verified Google profile...');
        const role =
          searchParams.get('role') ||
          (typeof window !== 'undefined' ? localStorage.getItem('devvegis_oauth_role') : null) ||
          'CUSTOMER';

        const authBase =
          process.env.NEXT_PUBLIC_NEON_AUTH_URL ||
          'https://ep-dark-smoke-a5bia8cy.neonauth.us-east-2.aws.neon.tech/neondb/auth';

        let googleUser: { email: string; name: string; avatar?: string } | null = null;

        // 1. Attempt to fetch active session from Neon Auth
        try {
          const sessionRes = await fetch(`${authBase}/get-session`, {
            credentials: 'include',
          });
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            if (sessionData?.user?.email) {
              googleUser = {
                email: sessionData.user.email,
                name: sessionData.user.name || 'Google User',
                avatar: sessionData.user.image,
              };
            }
          }
        } catch (sessionErr) {
          console.warn('Direct Neon get-session check:', sessionErr);
        }

        const sessionToken =
          searchParams.get('token') ||
          searchParams.get('session_token') ||
          searchParams.get('sessionToken') ||
          undefined;

        // 2. Synchronize with DevVegis backend
        setStatusText('Securing your account and generating session...');
        let backendRes: any;

        if (googleUser) {
          backendRes = await api.post('/auth/google', {
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.avatar,
            role,
          });
        } else {
          // Sync from the database neon_auth schema using sessionToken or IP/user-agent session
          backendRes = await api.post('/auth/neon-sync', {
            sessionToken,
            role,
            clientUserAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          });
        }

        const { user, accessToken } = backendRes.data.data;
        setAuth(user, accessToken);
        toast.success(`Welcome, ${user.name}! Signed in as ${user.email} 🎉`);

        if (typeof window !== 'undefined') {
          localStorage.removeItem('devvegis_oauth_role');
        }

        // Full document navigation so Edge middleware immediately sees the new cookie
        const destination =
          user.role === 'ADMIN'
            ? '/admin'
            : user.role === 'RIDER'
            ? '/rider'
            : user.role === 'WHOLESALE_BUYER'
            ? '/wholesale'
            : '/';
        window.location.href = destination;
      } catch (err: any) {
        console.error('OAuth sync error:', err);
        toast.error(err.response?.data?.message || 'Failed to complete Google Sign-in. Please try again.');
        window.location.href = '/login';
      }
    };

    processOAuth();
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-6">
      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-gray-100">
          Authenticating with Google
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {statusText}
        </p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
