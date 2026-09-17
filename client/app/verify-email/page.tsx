'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight, Sparkles, RefreshCw, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR' | 'IDLE'>('IDLE');
  const [message, setMessage] = useState<string>('');
  const [resendEmail, setResendEmail] = useState<string>('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('IDLE');
      return;
    }

    let isMounted = true;
    const verify = async () => {
      setStatus('LOADING');
      try {
        const res = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        if (!isMounted) return;
        setStatus('SUCCESS');
        setMessage(res.data.message || 'Email verified successfully! ₹50 welcome bonus credited.');
        toast.success('🎉 Email verified! Welcome bonus added to your wallet.');
      } catch (err: any) {
        if (!isMounted) return;
        setStatus('ERROR');
        setMessage(err.response?.data?.message || 'This verification link is invalid or has expired.');
      }
    };

    verify();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsResending(true);
    try {
      const res = await api.post('/auth/resend-verification', { email: resendEmail.trim() });
      toast.success(res.data.message || 'Verification email sent! Please check your inbox.');
      setResendEmail('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center"
      >
        {/* LOGO */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-3xl">🥦</span>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-heading">
            DevVegis
          </span>
        </div>

        {/* 1. LOADING STATE */}
        {status === 'LOADING' && (
          <div className="py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/60 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-green-600 dark:text-green-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Verifying your email...
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Please wait a moment while we activate your account and set up your wallet.
            </p>
          </div>
        )}

        {/* 2. SUCCESS STATE */}
        {status === 'SUCCESS' && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-4"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/20">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50 px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Email Verified
            </span>

            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 font-heading">
              Account Activated!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {message}
            </p>

            {/* Wallet Bonus Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-100/60 dark:from-emerald-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800/60 rounded-2xl p-4 mb-6 text-left">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎁</span>
                <div>
                  <p className="text-xs font-bold text-green-800 dark:text-green-300">
                    Welcome Bonus Applied
                  </p>
                  <p className="text-sm font-extrabold text-green-900 dark:text-green-100">
                    ₹50 has been added to your DevVegis Wallet
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <Link
                href="/"
                className="w-full py-3.5 px-4 rounded-xl bg-green-500 hover:bg-green-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-green-500/20 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Start Shopping Fresh Produce</span>
              </Link>
              <Link
                href="/login"
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Go to Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* 3. ERROR OR EXPIRED LINK STATE */}
        {status === 'ERROR' && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-4"
          >
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-rose-500" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Verification Failed
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              {message}
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-left mb-6">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Need a new verification link?
              </p>
              <form onSubmit={handleResend} className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-green-500"
                />
                <button
                  type="submit"
                  disabled={isResending}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isResending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>Resend Verification Email</span>
                </button>
              </form>
            </div>

            <Link
              href="/login"
              className="text-xs text-green-600 dark:text-green-400 font-bold hover:underline"
            >
              Back to Login
            </Link>
          </motion.div>
        )}

        {/* 4. IDLE STATE (No token in URL) */}
        {status === 'IDLE' && (
          <div className="py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/60 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Verify Your Email
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Enter your email address below and we will send you a verification link with your ₹50 wallet welcome bonus.
            </p>

            <form onSubmit={handleResend} className="space-y-3">
              <input
                type="email"
                placeholder="Enter your registered email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full text-sm px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-green-500"
              />
              <button
                type="submit"
                disabled={isResending}
                className="w-full py-3 px-4 rounded-xl bg-green-500 hover:bg-green-400 text-slate-950 text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors shadow-md shadow-green-500/20"
              >
                {isResending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                <span>Send Verification Link</span>
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <Link href="/login" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                Already verified? <span className="font-bold text-green-600 dark:text-green-400">Log In</span>
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
