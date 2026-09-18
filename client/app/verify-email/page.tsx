'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  ShieldCheck,
  Edit3,
  Check,
  KeyRound,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const tokenParam = searchParams.get('token');
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState<string>(emailParam);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedEmail, setEditedEmail] = useState(emailParam);

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);

  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If token is provided in URL (legacy verification link)
  useEffect(() => {
    if (!tokenParam) return;

    let isMounted = true;
    const verifyToken = async () => {
      setStatus('LOADING');
      try {
        const res = await api.get(`/auth/verify-email?token=${encodeURIComponent(tokenParam)}`);
        if (!isMounted) return;
        setStatus('SUCCESS');
        const user = res.data?.data?.user;
        const accessToken = res.data?.data?.accessToken;
        if (user && accessToken) {
          setAuth(user, accessToken);
        }
        setMessage(res.data.message || 'Email verified successfully! Your account is now active.');
        toast.success('Email verified successfully!');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (err: any) {
        if (!isMounted) return;
        setStatus('ERROR');
        setMessage(err.response?.data?.message || 'This verification link is invalid or has expired.');
      }
    };

    verifyToken();
    return () => {
      isMounted = false;
    };
  }, [tokenParam, router, setAuth]);

  // Check verification status
  useEffect(() => {
    if (!email || tokenParam) return;
    let isMounted = true;
    api
      .get(`/auth/verification-status?email=${encodeURIComponent(email)}`)
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.data?.isEmailVerified) {
          setStatus('SUCCESS');
          setMessage('Your email is already verified! Redirecting to login...');
          setTimeout(() => router.push('/login'), 1500);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [email, tokenParam, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first input on mount if not verifying via token
  useEffect(() => {
    if (!tokenParam && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [tokenParam]);

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric characters
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned && value !== '') return;

    const newOtp = [...otp];

    if (cleaned.length > 1) {
      // Pasting into an individual input
      handlePasteValue(cleaned);
      return;
    }

    newOtp[index] = cleaned;
    setOtp(newOtp);

    // Auto-advance to next box
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits are entered
    if (cleaned && index === 5 && newOtp.every((d) => d !== '')) {
      submitOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteValue = (pastedText: string) => {
    const digits = pastedText.replace(/\D/g, '').slice(0, 6).split('');
    if (digits.length === 0) return;

    const newOtp = [...otp];
    digits.forEach((d, i) => {
      if (i < 6) newOtp[i] = d;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (digits.length === 6) {
      submitOtp(digits.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    handlePasteValue(pasted);
  };

  // Submit OTP for verification
  const submitOtp = async (otpCode?: string) => {
    const codeToVerify = otpCode || otp.join('');
    if (codeToVerify.length !== 6) {
      toast.error('Please enter all 6 digits of your verification code.');
      return;
    }

    if (!email.trim()) {
      toast.error('Please specify your registered email address.');
      setIsEditingEmail(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/verify-email', {
        email: email.trim(),
        otp: codeToVerify,
      });

      setStatus('SUCCESS');
      const user = res.data?.data?.user;
      const accessToken = res.data?.data?.accessToken;
      if (user && accessToken) {
        setAuth(user, accessToken);
      }
      setMessage(res.data?.message || 'Email verified successfully! Your account is active.');
      toast.success('Account verified successfully! Redirecting...');

      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || 'Invalid or expired verification code. Please try again.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      setIsEditingEmail(true);
      return;
    }

    setIsResending(true);
    try {
      const res = await api.post('/auth/resend-verification', { email: email.trim() });
      toast.success(res.data.message || 'Verification code resent! Please check your inbox.');
      setResendCooldown(30);

      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Save edited email
  const handleSaveEmail = () => {
    if (!editedEmail.trim() || !editedEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setEmail(editedEmail.trim());
    setIsEditingEmail(false);
    toast.success('Email updated. Requesting new code...');
    // trigger resend for new email
    setTimeout(() => {
      api.post('/auth/resend-verification', { email: editedEmail.trim() })
        .then(() => {
          toast.success('New verification code sent!');
          setResendCooldown(30);
        })
        .catch(() => {});
    }, 200);
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

        {/* 1. LOADING TOKEN STATE */}
        {status === 'LOADING' && (
          <div className="py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-heading">
              Verifying Your Account...
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Please wait a moment while we activate your account.
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
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Email Verified
            </span>

            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 font-heading">
              Account Activated!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {message}
            </p>

            <div className="space-y-2.5">
              <Link
                href="/"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
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

        {/* 3. ERROR ON LINK STATE */}
        {status === 'ERROR' && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-4"
          >
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-rose-500" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-heading">
              Verification Failed
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              {message}
            </p>

            <button
              type="button"
              onClick={() => setStatus('IDLE')}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              <span>Enter 6-Digit OTP Manually</span>
            </button>
          </motion.div>
        )}

        {/* 4. MAIN 6-DIGIT OTP INPUT FLOW */}
        {status === 'IDLE' && (
          <div className="py-2">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
              <Mail className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1.5 font-heading tracking-tight">
              Verify Your Email
            </h2>

            {/* Email display and edit option */}
            <div className="mb-6">
              {isEditingEmail ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    placeholder="Enter registered email"
                    className="flex-1 text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveEmail}
                    className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                    title="Save email"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <span>Code sent to</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 break-all">
                    {email || 'your email'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditedEmail(email);
                      setIsEditingEmail(true);
                    }}
                    className="p-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ml-0.5"
                    title="Change email"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* 6-Digit OTP Inputs */}
            <div className="flex justify-center gap-2.5 sm:gap-3 mb-6" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold font-mono rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm"
                />
              ))}
            </div>

            {/* Action Button */}
            <button
              type="button"
              disabled={isSubmitting || otp.some((d) => d === '')}
              onClick={() => submitOtp()}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 transition-all mb-4"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Verifying Code...' : 'Verify & Activate Account'}</span>
            </button>

            {/* Spam / Junk Notice Banner */}
            <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-2.5 text-left">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                <span className="font-semibold">Can't find the email in your inbox?</span>
                <p className="mt-0.5 text-amber-800/90 dark:text-amber-300/90">
                  Please check your <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions</strong> folder. Automated verification emails are often routed there.
                </p>
              </div>
            </div>

            {/* Resend Code Section */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Didn't receive the code?
              </span>
              <button
                type="button"
                disabled={isResending || resendCooldown > 0}
                onClick={handleResend}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 disabled:opacity-50 disabled:no-underline"
              >
                {isResending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </span>
              </button>
            </div>

            {/* Back to Login */}
            <div className="mt-5 text-xs text-slate-400 dark:text-slate-500">
              <Link
                href="/login"
                className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Back to Sign In
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
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
