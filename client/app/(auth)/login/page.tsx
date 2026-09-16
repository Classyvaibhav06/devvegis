'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Mail, Lock, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import GoogleOAuthButton from '@/components/auth/GoogleOAuthButton';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await api.post('/auth/login', data);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.name}! 👋`);

      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else if (user.role === 'RIDER') {
        router.push('/rider');
      } else if (user.role === 'WHOLESALE_BUYER') {
        router.push('/wholesale');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const demoAccounts = [
    { label: '👑 Super Admin', email: 'superadmin@devvegis.com', password: 'Password@123' },
    { label: '🛠️ Admin', email: 'admin@devvegis.com', password: 'Password@123' },
    { label: '👤 Customer', email: 'priya@example.com', password: 'Password@123' },
    { label: '🏢 Wholesale', email: 'wholesale@agarwal.com', password: 'Password@123' },
    { label: '🛵 Rider', email: 'vijay.rider@devvegis.com', password: 'Password@123' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="card p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">Welcome Back!</h1>
          <p className="text-gray-500 mt-1">Sign in to your DevVegis account</p>
        </div>

        {/* Google OAuth Button */}
        <div className="mb-5">
          <GoogleOAuthButton mode="signin" />
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white dark:bg-gray-900 text-xs text-gray-400">
                or continue with email
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="input pl-10"
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <Link href="/forgot-password" className="text-xs text-green-600 hover:text-green-700">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="input pl-10 pr-10"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700" /></div>
          <div className="relative flex justify-center"><span className="px-3 bg-white dark:bg-gray-800 text-xs text-gray-500">Demo Accounts</span></div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {demoAccounts.map(demo => (
            <button
              key={demo.label}
              type="button"
              disabled={isSubmitting}
              onClick={() => { onSubmit({ email: demo.email, password: demo.password }); }}
              className="btn-secondary text-xs py-2 px-3 hover:border-green-500 hover:text-green-600 transition-colors"
            >
              {demo.label}
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-green-600 font-semibold hover:text-green-700">
            Create one →
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
