'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Eye, EyeOff, Loader2, Mail, Lock, User, Leaf, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useAuthModalStore } from '@/store/authModalStore';
import api from '@/lib/api';
import GoogleOAuthButton from '@/components/auth/GoogleOAuthButton';
import TurnstileWidget, { TurnstileWidgetRef } from '@/components/common/TurnstileWidget';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginInputs = z.infer<typeof loginSchema>;
type SignupInputs = z.infer<typeof signupSchema>;

export default function AuthModal() {
  const { isOpen, mode, closeModal, setMode, onSuccessCallback, redirectUrl } = useAuthModalStore();
  const { setAuth } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const loginForm = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
  });

  const signupForm = useForm<SignupInputs>({
    resolver: zodResolver(signupSchema),
  });

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeModal]);

  // Reset form state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      loginForm.reset();
      signupForm.reset();
      setShowPassword(false);
      setTurnstileToken('');
    }
  }, [isOpen, loginForm, signupForm]);

  const onLoginSubmit = async (data: LoginInputs) => {
    try {
      const res = await api.post('/auth/login', {
        ...data,
        turnstileToken,
      });
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.name || 'friend'}! 🎉`);

      closeModal();
      if (onSuccessCallback) {
        onSuccessCallback();
      } else if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      turnstileRef.current?.reset();
      setTurnstileToken('');
      const message = err.response?.data?.message || err.response?.data?.error || 'Login failed. Please try again.';
      toast.error(message);
    }
  };

  const onSignupSubmit = async (data: SignupInputs) => {
    try {
      const res = await api.post('/auth/register', {
        ...data,
        phone: '9876543210', // Default fallback for instant modal signup
        role: 'CUSTOMER',
        turnstileToken,
      });

      // If server logs user in or sends verification
      if (res.data?.data?.accessToken) {
        const { user, accessToken } = res.data.data;
        setAuth(user, accessToken);
        toast.success(`Welcome to DevVegis, ${user.name}! 🥬`);
        closeModal();
        if (onSuccessCallback) onSuccessCallback();
      } else {
        const msg = res.data?.message || 'Account created! Please check your email for the verification code.';
        toast.success(msg);
        closeModal();
        window.location.href = `/verify-email?email=${encodeURIComponent(data.email)}`;
      }
    } catch (err: any) {
      turnstileRef.current?.reset();
      setTurnstileToken('');
      const message = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container: Bottom sheet on mobile, Centered dialog on desktop */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full sm:max-w-md bg-white dark:bg-[#0F1520] rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
          >
            {/* Mobile swipe pull bar */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pt-4 pb-3 flex items-start justify-between border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8EEF8]">
                    {mode === 'signin' ? 'Sign In to DevVegis' : 'Create an Account'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#8B96A8]">
                    {mode === 'signin' ? 'Farm-fresh produce in 12 minutes' : 'Unlock exclusive farm-gate savings'}
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors"
                aria-label="Close auth dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Google OAuth One-Tap */}
              <div>
                <GoogleOAuthButton mode={mode === 'signin' ? 'signin' : 'signup'} />
              </div>

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                  <span className="bg-white dark:bg-[#0F1520] px-3 text-slate-400">or with email</span>
                </div>
              </div>

              {/* Sign In Form */}
              {mode === 'signin' ? (
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        {...loginForm.register('email')}
                        placeholder="you@example.com"
                        className="input pl-9 text-xs py-2.5"
                        autoComplete="email"
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-[11px] text-rose-500 mt-1">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      <a
                        href="/forgot-password"
                        onClick={closeModal}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...loginForm.register('password')}
                        placeholder="••••••••"
                        className="input pl-9 pr-9 text-xs py-2.5 font-mono"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-[11px] text-rose-500 mt-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  {/* Silent Cloudflare Turnstile */}
                  <div className="flex justify-center">
                    <TurnstileWidget
                      ref={turnstileRef}
                      onSuccess={(token) => setTurnstileToken(token)}
                      onError={() => setTurnstileToken('')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loginForm.formState.isSubmitting}
                    className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 mt-2"
                  >
                    {loginForm.formState.isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Sign In</span>
                  </button>
                </form>
              ) : (
                /* Sign Up Form */
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        {...signupForm.register('name')}
                        placeholder="John Doe"
                        className="input pl-9 text-xs py-2.5"
                        autoComplete="name"
                      />
                    </div>
                    {signupForm.formState.errors.name && (
                      <p className="text-[11px] text-rose-500 mt-1">{signupForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        {...signupForm.register('email')}
                        placeholder="you@example.com"
                        className="input pl-9 text-xs py-2.5"
                        autoComplete="email"
                      />
                    </div>
                    {signupForm.formState.errors.email && (
                      <p className="text-[11px] text-rose-500 mt-1">{signupForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Create Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...signupForm.register('password')}
                        placeholder="At least 6 characters"
                        className="input pl-9 pr-9 text-xs py-2.5 font-mono"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {signupForm.formState.errors.password && (
                      <p className="text-[11px] text-rose-500 mt-1">{signupForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  {/* Silent Cloudflare Turnstile */}
                  <div className="flex justify-center">
                    <TurnstileWidget
                      ref={turnstileRef}
                      onSuccess={(token) => setTurnstileToken(token)}
                      onError={() => setTurnstileToken('')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={signupForm.formState.isSubmitting}
                    className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 mt-2"
                  >
                    {signupForm.formState.isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Create Account</span>
                  </button>
                </form>
              )}

              {/* Bottom Toggle */}
              <div className="pt-2 text-center text-xs text-slate-500 dark:text-[#8B96A8]">
                {mode === 'signin' ? (
                  <p>
                    New to DevVegis?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                    >
                      Create an account
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                    >
                      Sign in here
                    </button>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
