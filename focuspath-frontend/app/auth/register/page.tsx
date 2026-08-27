'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserPlus, Mail, KeyRound, User as UserIcon, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'ADULT' | 'PARENT'>('ADULT');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiRequest('/api/auth/register/', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, role }),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#0b0f17] flex items-center justify-center p-6 font-sans text-slate-800 dark:text-slate-100 transition-colors relative">
      {/* Top Right Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle variant="icon" />
      </div>

      <div className="w-full max-w-[460px] rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center justify-center transition-transform hover:scale-105">
            <img
              src="/focuspath_logo.png"
              alt="FocusPath"
              className="h-16 w-auto object-contain"
            />
          </Link>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Create Your Account</h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Choose FocusPath Role
          </p>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-medium leading-relaxed">
            Registration successful! Redirecting to login...
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Choice */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('ADULT')}
              className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                role === 'ADULT'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              ADULT MODE
            </button>
            <button
              type="button"
              onClick={() => setRole('PARENT')}
              className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                role === 'PARENT'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              PARENT MODE
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Username
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose username"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all font-medium bg-slate-50/20 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all font-medium bg-slate-50/20 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                name="new-password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 py-3 pl-10 pr-12 text-sm outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all font-medium bg-slate-50/20 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/95 text-white font-semibold text-sm py-3 px-5 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
          >
            <UserPlus className="h-4 w-4" />
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-bold">
              Sign In
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
