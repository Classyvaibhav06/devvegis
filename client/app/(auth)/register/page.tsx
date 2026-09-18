'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone, ShoppingCart, Store, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import api from '@/lib/api';
import GoogleOAuthButton from '@/components/auth/GoogleOAuthButton';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Enter a valid phone number').max(15),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['CUSTOMER', 'WHOLESALE_BUYER']),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CUSTOMER' },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const { confirmPassword, ...payload } = data;
      const res = await api.post('/auth/register', payload);
      const resData = res.data?.data || {};
      toast.success('Account created! Please enter the 6-digit verification code sent to your email.', {
        duration: 6000,
      });
      const params = new URLSearchParams({ email: data.email });
      if (resData.devOtp) {
        params.set('devOtp', resData.devOtp);
      }
      router.push(`/verify-email?${params.toString()}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="card p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">Create Account</h1>
          <p className="text-gray-500 mt-1">Join DevVegis for fresh groceries</p>
        </div>

        {/* Google OAuth Button */}
        <div className="mb-5">
          <GoogleOAuthButton mode="signup" role={watch('role')} />
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white dark:bg-gray-900 text-xs text-gray-400">
                or sign up with email
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Account Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'CUSTOMER', label: 'Customer', desc: 'For personal use', Icon: ShoppingCart },
                { value: 'WHOLESALE_BUYER', label: 'Wholesale', desc: 'For businesses', Icon: Store },
              ].map(opt => (
                <label key={opt.value} className="cursor-pointer">
                  <input type="radio" {...register('role')} value={opt.value} className="sr-only" />
                  <div className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1 ${watch('role') === opt.value ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'}`}>
                    <div className="flex items-center gap-1.5">
                      <opt.Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <p className="font-semibold text-sm">{opt.label}</p>
                    </div>
                    <p className="text-xs text-gray-400">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input {...register('name')} type="text" className="input pl-10" autoComplete="name" />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input {...register('email')} type="email" className="input pl-10" autoComplete="email" />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input {...register('phone')} type="tel" className="input pl-10" autoComplete="tel" />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input {...register('password')} type={showPass ? 'text' : 'password'} className="input pl-10 pr-10" autoComplete="new-password" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input {...register('confirmPassword')} type="password" className="input pl-10" autoComplete="new-password" />
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <p className="text-xs text-gray-400">
            By creating an account you agree to our{' '}
            <Link href="/terms" className="text-green-600 hover:underline">Terms of Service</Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-green-600 hover:underline">Privacy Policy</Link>
          </p>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-green-600 font-semibold hover:text-green-700">Sign in →</Link>
        </p>
      </div>
    </motion.div>
  );
}
