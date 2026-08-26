'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { apiRequest } from '@/lib/api';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  Lock,
  ShieldAlert,
  KeyRound,
  User as UserIcon,
  GraduationCap,
  BookOpen,
  ArrowLeft,
  Pin,
  Eye,
  EyeOff
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  // Go straight to the credentials form; the real role comes from the account after login.
  // (URL params below may still switch the header to 'kid' for locked accounts.)
  const [loginMode, setLoginMode] = useState<'adult' | 'kid' | null>('adult');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize lockout & role redirect parameters
  useEffect(() => {
    const lockedParam = searchParams.get('locked');
    const roleParam = searchParams.get('role');
    const noticeParam = searchParams.get('notice');

    if (lockedParam === 'true') {
      setLocked(true);
      setLoginMode('kid');
      setError('Your account is locked due to excessive tab switching (3). Parent approval is required.');
    } else if (roleParam === 'PARENT') {
      setLoginMode('adult');
      if (noticeParam === 'parent_required') {
        setError('Parental credentials required. Please sign in with your Parent account to access the Parent Portal.');
      }
    } else if (roleParam === 'ADULT') {
      setLoginMode('adult');
    } else if (roleParam === 'KID') {
      setLoginMode('kid');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLocked(false);
    setLoading(true);

    try {
      const res = await apiRequest('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      // Save to Zustand
      setAuth(res.user, res.access, res.refresh);

      // Redirect depending on user role
      if (res.user.role === 'PARENT') {
        router.push('/select-profile');
      } else if (res.user.role === 'KID') {
        router.push('/kid/dashboard');
      } else {
        router.push('/adult/dashboard');
      }
    } catch (err: any) {
      if (err.status === 403 && err.code === 'account_locked') {
        setLocked(true);
        setError('This Kid account is locked due to 3 browser tab switches. A parent must approve this login request.');
      } else {
        setError(err.message || 'Incorrect credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // If no mode is selected, show the selector screen
  if (loginMode === null) {
    return (
      <div className="min-h-screen bg-slate-50/60 dark:bg-[#0b0f17] flex flex-col justify-between p-6 sm:p-8 font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors relative">
        {/* Top Right Floating Theme Toggle */}
        <div className="absolute top-6 right-6 z-20">
          <ThemeToggle variant="icon" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-10">
          
          {/* Logo and Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <Link href="/" className="flex items-center justify-center transition-transform hover:scale-105">
              <img
                src="/focuspath_logo.png"
                alt="FocusPath"
                className="h-20 sm:h-24 w-auto object-contain"
              />
            </Link>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Plans that rebuild themselves.
            </p>
          </div>

          {/* Mode Cards Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            
            {/* Adult Mode Card */}
            <button
              onClick={() => {
                setError(null);
                setLoginMode('adult');
              }}
              className="rounded-[32px] border border-slate-200 dark:border-slate-800 bg-indigo-50/20 dark:bg-indigo-950/20 p-8 shadow-sm flex flex-col justify-between items-start text-left min-h-[220px] hover:border-indigo-600/40 transition-all group cursor-pointer"
            >
              <div className="bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <GraduationCap className="h-6 w-6" />
              </div>
              
              <div className="space-y-1 pt-6">
                <h3 className="text-base font-bold text-indigo-600 dark:text-indigo-400">Adult Mode</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400 font-semibold leading-relaxed">
                  Plan, track focus, and study smarter.
                </p>
              </div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide pt-4 block">
                Adult & Parent authentication workspace.
              </span>
            </button>

            {/* Kid Mode Card */}
            <button
              onClick={() => {
                setError(null);
                setLoginMode('kid');
              }}
              className="rounded-[32px] border border-slate-200 dark:border-slate-800 bg-emerald-50/10 dark:bg-emerald-950/20 p-8 shadow-sm flex flex-col justify-between items-start text-left min-h-[220px] hover:border-emerald-600/40 transition-all group cursor-pointer relative overflow-hidden"
            >
              <span className="absolute top-4 right-4 bg-orange-500 text-white text-[8px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase">
                FUN
              </span>
              
              <div className="bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <BookOpen className="h-6 w-6" />
              </div>

              <div className="space-y-1 pt-6">
                <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400">Kid's Mode</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400 font-semibold leading-relaxed">
                  Fun, guided study time.
                </p>
              </div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide pt-4 block">
                Guided interactive student portal.
              </span>
            </button>

          </div>

          {/* Parental PIN disclaimer */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            <Pin className="h-3.5 w-3.5" />
            Parents can enable Kid's Mode with a PIN
          </div>
        </div>

        {/* Bottom Signup Link */}
        <div className="text-center pt-6">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Need an account?{' '}
            <Link href="/auth/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">
              Sign Up
            </Link>
          </span>
        </div>
      </div>
    );
  }

  // Credentials Entry Form Screen (displayed after selecting a mode)
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#0b0f17] flex items-center justify-center p-6 font-sans text-slate-800 dark:text-slate-100 transition-colors relative">
      {/* Top Right Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle variant="icon" />
      </div>

      <div className="w-full max-w-[460px] rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => {
            setError(null);
            router.push('/');
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center justify-center transition-transform hover:scale-105">
            <img
              src="/focuspath_logo.png"
              alt="FocusPath"
              className="h-16 w-auto object-contain"
            />
          </Link>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Sign In – {loginMode === 'kid' ? "Kid's Mode" : 'Adult/Parent'}
          </h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {loginMode === 'kid' ? 'Fun Guided Study Space' : 'Adaptive Workspace'}
          </p>
        </div>

        {/* Error States */}
        {error && (
          <div className={`p-4 rounded-2xl flex gap-3 items-start border text-sm ${
            locked 
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' 
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
          }`}>
            {locked ? <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" /> : <Lock className="h-5 w-5 shrink-0 mt-0.5" />}
            <div className="space-y-1">
              <p className="font-semibold">{locked ? 'Account Locked' : 'Authentication Error'}</p>
              <p className="text-xs leading-relaxed font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Username or Email
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username or email"
                className={`w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none transition-all font-medium bg-slate-50/20 dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${
                  loginMode === 'kid'
                    ? 'border-slate-200 dark:border-slate-700 focus:border-emerald-500/60 focus:ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600/60 focus:ring-indigo-600/20'
                }`}
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
                name="current-password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-2xl border py-3 pl-10 pr-12 text-sm outline-none transition-all font-medium bg-slate-50/20 dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${
                  loginMode === 'kid'
                    ? 'border-slate-200 dark:border-slate-700 focus:border-emerald-500/60 focus:ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-indigo-600/60 focus:ring-indigo-600/20'
                }`}
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
            className={`w-full text-white font-semibold text-sm py-3 px-5 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 ${
              loginMode === 'kid'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Footer info */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Need an account?{' '}
            <Link href="/auth/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">
              Sign Up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50/60 dark:bg-[#0b0f17] flex items-center justify-center font-sans">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
