'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GoogleOAuthButtonProps {
  mode?: 'signin' | 'signup';
  role?: 'CUSTOMER' | 'WHOLESALE_BUYER';
  className?: string;
}

export default function GoogleOAuthButton({
  mode = 'signin',
  role = 'CUSTOMER',
  className = '',
}: GoogleOAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const authBase =
        process.env.NEXT_PUBLIC_NEON_AUTH_URL ||
        'https://ep-dark-smoke-a5bia8cy.neonauth.us-east-2.aws.neon.tech/neondb/auth';

      const callbackURL = `${window.location.origin}/oauth-callback?role=${role}`;

      // Call Neon Auth social sign-in to get the official Google OAuth consent URL
      const res = await fetch(`${authBase}/sign-in/social`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'google',
          callbackURL,
        }),
      });

      const data = await res.json();

      if (data.url) {
        // Store intended role in localStorage for safety
        if (typeof window !== 'undefined') {
          localStorage.setItem('devvegis_oauth_role', role);
        }

        // Open real Google Account chooser / login screen
        window.location.href = data.url;
      } else {
        toast.error(data.message || 'Failed to initialize Google OAuth session.');
        setLoading(false);
      }
    } catch (err: any) {
      toast.error('Network error initiating Google login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleGoogleAuth}
      className={`w-full relative group flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700/80 text-gray-800 dark:text-gray-200 text-sm font-medium transition-all duration-300 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-300" />
      ) : (
        /* Official Google 'G' multicolored SVG */
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
      )}
      <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
    </button>
  );
}
