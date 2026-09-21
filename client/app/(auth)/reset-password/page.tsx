'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import api from '@/lib/api';
import TurnstileWidget, { TurnstileWidgetRef } from '@/components/common/TurnstileWidget';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Password must include at least one letter')
      .regex(/[0-9]/, 'Password must include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenEmail, setTokenEmail] = useState('');
  const [tokenError, setTokenError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      setTokenError('No password reset token was provided.');
      return;
    }

    const checkToken = async () => {
      try {
        const res = await api.get(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
        if (res.data?.success) {
          setTokenValid(true);
          setTokenEmail(res.data?.data?.email || '');
        } else {
          setTokenValid(false);
          setTokenError('This password reset link is invalid or has expired.');
        }
      } catch (err: any) {
        setTokenValid(false);
        const msg = err.response?.data?.message || err.response?.data?.error || 'This reset link has expired or is invalid.';
        setTokenError(msg);
      } finally {
        setVerifying(false);
      }
    };

    checkToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return;

    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
        turnstileToken,
      });

      setResetSuccess(true);
      toast.success('Your password has been reset successfully!');

      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      turnstileRef.current?.reset();
      setTurnstileToken('');
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to reset password. Please try again.';
      toast.error(message);
    }
  };

  if (verifying) {
    return (
      <div className="card p-8 text-center space-y-3 max-w-md w-full">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
        <h2 className="font-heading font-bold text-base text-gray-900 dark:text-gray-100">
          Verifying security link...
        </h2>
        <p className="text-xs text-gray-500">Please wait while we validate your reset token.</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-xl text-gray-900 dark:text-gray-100">
            Reset Link Expired
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
            {tokenError || 'This password reset link is invalid or has expired for security reasons.'}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/forgot-password"
              className="btn-primary w-full py-2.5 text-xs font-semibold"
            >
              Request a New Reset Link
            </Link>
            <Link
              href="/login"
              className="btn-outline w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  if (resetSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="card p-8 text-center space-y-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-xl text-gray-900 dark:text-gray-100">
            Password Updated!
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 max-w-xs mx-auto leading-relaxed">
            Your new password has been saved and all previous sessions have been securely closed. Redirecting you to sign in...
          </p>
          <div className="pt-2">
            <Link href="/login" className="btn-primary w-full py-2.5 text-xs font-semibold">
              Go to Sign In Now
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="card p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">
            Create New Password
          </h1>
          {tokenEmail && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Resetting password for <strong className="text-slate-800 dark:text-slate-200">{tokenEmail}</strong>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters (letters & numbers)"
                className="input pl-10 pr-10 text-xs w-full"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                {...register('confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your new password"
                className="input pl-10 pr-10 text-xs w-full"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Cloudflare Turnstile */}
          <TurnstileWidget
            ref={turnstileRef}
            onSuccess={(t) => setTurnstileToken(t)}
            onError={() => setTurnstileToken('')}
            onExpire={() => setTurnstileToken('')}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving New Password...</span>
              </>
            ) : (
              <span>Reset Password & Log In</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-xs text-slate-500 hover:text-emerald-600 inline-flex items-center gap-1 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="card p-8 text-center space-y-3 max-w-md w-full">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <h2 className="font-heading font-bold text-base text-gray-900 dark:text-gray-100">
            Loading...
          </h2>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
