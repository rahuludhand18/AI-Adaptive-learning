'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { apiRequest } from '@/lib/api';
import {
  Brain,
  Lock,
  ShieldAlert,
  KeyRound,
  User as UserIcon,
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowLeft,
  Pin
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  // Mode state: null = show selection cards, 'adult' = adult form, 'kid' = kid form
  const [loginMode, setLoginMode] = useState<'adult' | 'kid' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize lockout parameters
  useEffect(() => {
    const lockedParam = searchParams.get('locked');
    if (lockedParam === 'true') {
      setLocked(true);
      setLoginMode('kid');
      setError('Your account is locked due to excessive tab switching (3). Parent approval is required.');
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
      if (res.user.role === 'ADULT') {
        router.push('/adult/dashboard');
      } else if (res.user.role === 'PARENT') {
        router.push('/parent/dashboard');
      } else if (res.user.role === 'KID') {
        router.push('/kid/dashboard');
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

  // If no mode is selected, show the selector screen (exactly matching the user image)
  if (loginMode === null) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex flex-col justify-between p-8 font-sans antialiased text-slate-800">
        <div className="flex-1 flex flex-col items-center justify-center space-y-10">
          
          {/* Logo and Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex items-center justify-center">
              <img
                src="/focuspath_logo.png"
                alt="FocusPath Logo"
                className="h-28 w-auto object-contain"
              />
            </div>
            
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">FocusPath</h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
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
              className="rounded-[32px] border border-slate-200 bg-indigo-50/20 p-8 shadow-sm flex flex-col justify-between items-start text-left min-h-[220px] hover:border-indigo-600/30 transition-all group cursor-pointer"
            >
              <div className="bg-white text-indigo-600 p-4 rounded-2xl shadow-sm border border-slate-100">
                <GraduationCap className="h-6 w-6" />
              </div>
              
              <div className="space-y-1 pt-6">
                <h3 className="text-base font-bold text-indigo-600">Adult Mode</h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Plan, track focus, and study smarter.
                </p>
              </div>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wide pt-4 block">
                Tapping navigates to Adult Login (Indigo theme).
              </span>
            </button>

            {/* Kid Mode Card */}
            <button
              onClick={() => {
                setError(null);
                setLoginMode('kid');
              }}
              className="rounded-[32px] border border-slate-200 bg-emerald-50/10 p-8 shadow-sm flex flex-col justify-between items-start text-left min-h-[220px] hover:border-emerald-600/30 transition-all group cursor-pointer relative overflow-hidden"
            >
              <span className="absolute top-4 right-4 bg-orange-500 text-white text-[8px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase">
                FUN
              </span>
              
              {/* Soft watermark illustration of a robot in bottom right */}
              <div className="absolute right-4 bottom-4 w-12 h-12 text-slate-100 opacity-20 pointer-events-none">
                <svg viewBox="0 0 100 100" fill="currentColor">
                  <rect x="20" y="30" width="60" height="45" rx="10" />
                  <circle cx="35" cy="50" r="5" fill="#000" />
                  <circle cx="65" cy="50" r="5" fill="#000" />
                  <rect x="40" y="65" width="20" height="5" />
                  <line x1="50" y1="30" x2="50" y2="15" stroke="currentColor" strokeWidth="6" />
                  <circle cx="50" cy="15" r="5" />
                </svg>
              </div>

              <div className="bg-white text-emerald-600 p-4 rounded-2xl shadow-sm border border-slate-100">
                <BookOpen className="h-6 w-6" />
              </div>

              <div className="space-y-1 pt-6">
                <h3 className="text-base font-bold text-emerald-600">Kid's Mode</h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Fun, guided study time.
                </p>
              </div>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wide pt-4 block">
                Tapping navigates to Parent Login (Indigo theme) for authentication.
              </span>
            </button>

          </div>

          {/* Parental PIN disclaimer */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <Pin className="h-3.5 w-3.5" />
            Parents can enable Kid's Mode with a PIN
          </div>
        </div>

        {/* Bottom Signup Link */}
        <div className="text-center pt-6">
          <span className="text-xs text-slate-400 font-semibold">
            Need an account?{' '}
            <Link href="/auth/register" className="text-indigo-600 hover:underline font-bold">
              Sign Up
            </Link>
          </span>
        </div>
      </div>
    );
  }

  // Credentials Entry Form Screen (displayed after selecting a mode)
  return (
    <div className="min-h-screen bg-slate-50/60 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[460px] rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => {
            setError(null);
            setLoginMode(null);
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center justify-center">
            <img
              src="/focuspath_logo.png"
              alt="FocusPath Logo"
              className="h-20 w-auto object-contain"
            />
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            Sign In – {loginMode === 'kid' ? "Kid's Mode" : 'Adult/Parent'}
          </h2>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            {loginMode === 'kid' ? 'Fun Guided Study Space' : 'Adaptive Workspace Logs'}
          </p>
        </div>

        {/* Error States */}
        {error && (
          <div className={`p-4 rounded-2xl flex gap-3 items-start border text-sm ${
            locked 
              ? 'bg-amber-50 text-amber-700 border-amber-200' 
              : 'bg-rose-50 text-rose-700 border-rose-200'
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Username
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className={`w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none transition-all font-medium bg-slate-50/20 ${
                  loginMode === 'kid'
                    ? 'border-slate-200 focus:border-emerald-500/40 focus:ring-emerald-500/20'
                    : 'border-slate-200 focus:border-indigo-600/40 focus:ring-indigo-600/20'
                }`}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-2xl border py-3 pl-10 pr-4 text-sm outline-none transition-all font-medium bg-slate-50/20 ${
                  loginMode === 'kid'
                    ? 'border-slate-200 focus:border-emerald-500/40 focus:ring-emerald-500/20'
                    : 'border-slate-200 focus:border-indigo-600/40 focus:ring-indigo-600/20'
                }`}
                required
              />
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
        <div className="border-t border-slate-100 pt-4 text-center">
          <span className="text-xs text-slate-400 font-semibold">
            Need an account?{' '}
            <Link href="/auth/register" className="text-indigo-600 hover:underline font-bold">
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-sans">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
