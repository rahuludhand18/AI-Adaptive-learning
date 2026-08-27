'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTabTracker } from '@/hooks/useTabTracker';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AiAssistant } from '@/components/AiAssistant';
import { apiRequest } from '@/lib/api';
import {
  Home,
  BookOpen,
  Trophy,
  LogOut,
  GraduationCap,
  Puzzle,
  Users,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface KidLayoutProps {
  children: ReactNode;
  starsCount?: number;
}

export default function KidLayout({ children, starsCount }: KidLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetchedStars, setFetchedStars] = useState<number>(0);

  useEffect(() => {
    if (starsCount === undefined) {
      apiRequest<{ balance: number }>('/api/rewards/wallet/')
        .then((w) => setFetchedStars(w.balance ?? 0))
        .catch(() => setFetchedStars(0));
    }
  }, [starsCount]);

  const displayStars = starsCount !== undefined ? starsCount : fetchedStars;

  // Enable Tab tracking for kids mode and get UI states
  const { showWarning, setShowWarning, isLockedOut, tabSwitchCount } = useTabTracker();

  const topNavItems = [
    { name: 'Home', href: '/kid/dashboard', icon: Home, color: 'text-kid-orange', activeBg: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25' },
    { name: 'Schedule', href: '/kid/planner', icon: Calendar, color: 'text-kid-sky', activeBg: 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md shadow-sky-500/25' },
    { name: 'Learn', href: '/kid/learn', icon: GraduationCap, color: 'text-kid-grass', activeBg: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/25' },
    { name: 'Quests', href: '/kid/quests', icon: Puzzle, color: 'text-amber-500', activeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/25' },
    { name: 'Story', href: '/kid/stories', icon: BookOpen, color: 'text-kid-violet', activeBg: 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-purple-500/25' },
    { name: 'Rewards', href: '/kid/rewards', icon: Trophy, color: 'text-kid-coral', activeBg: 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md shadow-rose-500/25' },
  ];

  const userInitial = user?.username ? user.username.slice(0, 2).toUpperCase() : 'KD';

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 font-sans antialiased flex flex-col transition-colors relative z-10">
      
      {/* Top Navbar — Soft gradient fill instead of flat white */}
      <header className="bg-gradient-to-r from-white via-orange-50/40 to-amber-50/30 dark:from-[#0b0f17] dark:via-[#161220] dark:to-[#0b0f17] backdrop-blur-xl border-b-2 border-orange-100/60 dark:border-slate-800/80 px-4 sm:px-8 h-18 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-xs transition-colors">
        {/* Left: Brand Logo & Mascot Wink */}
        <div className="flex items-center gap-3">
          <Link href="/kid/dashboard" className="flex items-center gap-2.5 group">
            <img
              src="/focuspath_logo.png"
              alt="FocusPath"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-2xl animate-kid-bob">🦉</span>
          </Link>
        </div>

        {/* Center Nav Links with Icons & Bouncy Pills */}
        <nav className="hidden sm:flex items-center gap-1.5 md:gap-2.5 h-full py-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-3 rounded-full border border-orange-100/40 dark:border-slate-800/60">
          {topNavItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComp = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`py-2 px-3.5 rounded-full flex items-center gap-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? item.activeBg + ' scale-105'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:scale-102'
                }`}
              >
                <IconComp className={`h-4 w-4 ${isActive ? 'text-white animate-kid-wiggle' : item.color}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Right User Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Star Balance Pill */}
          <button
            onClick={() => router.push('/kid/rewards')}
            className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 border-2 border-amber-300/90 text-amber-950 text-xs font-extrabold py-2 px-3.5 sm:px-4 rounded-full flex items-center gap-2 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Star Balance"
          >
            <span className="text-amber-950 text-base font-extrabold animate-kid-bounce-subtle">⭐</span>
            <span className="tracking-tight animate-kid-count-up">{displayStars} Stars</span>
          </button>

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              suppressHydrationWarning
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 text-white font-extrabold text-xs flex items-center justify-center shadow-md ring-4 ring-orange-400/30 hover:ring-orange-400/60 hover:scale-105 transition-all cursor-pointer"
              title="Kid Profile"
            >
              {userInitial}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-orange-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user?.username || 'Kid Explorer'}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Kid Mode Active
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    document.cookie = 'activeRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    router.push('/select-profile');
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer text-left"
                >
                  <Users className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  Switch Profile
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                    router.push('/auth/login');
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="flex-1 flex flex-col overflow-y-auto relative z-10">
        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* WARNING MODAL (Tab Switch Focus Loss) */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] max-w-md w-full p-8 border-4 border-orange-300 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-950/60 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-kid-bob">
              <span className="text-4xl">🦉</span>
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-orange-200 dark:border-orange-800">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                <span>Focus Warning</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Focus Lost! ⚠️</h2>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                You left the FocusPath tab! (Strike {tabSwitchCount} of 3)
              </p>
              <p className="text-xs text-rose-500 dark:text-rose-400 font-bold">
                If you reach 3 strikes, your session will automatically lock.
              </p>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              I understand, let me back in!
            </button>
          </div>
        </div>
      )}

      {/* LOCKOUT SCREEN (3 Strikes Tab Switch) */}
      {isLockedOut && (
        <div className="fixed inset-0 z-[200] bg-gradient-to-br from-rose-950 via-rose-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-xl space-y-8 animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-rose-900/60 border-4 border-rose-500/40 rounded-full flex items-center justify-center mx-auto text-6xl shadow-2xl animate-kid-float">
              🚫
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">Session Terminated</h2>
              <p className="text-lg text-rose-200/80 font-medium max-w-md mx-auto">
                You switched tabs 3 times. Your parent has been notified.
              </p>
              <p className="text-sm text-rose-300/60 font-medium max-w-md mx-auto animate-pulse">
                Logging you out automatically...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Assistant Chatbot */}
      <AiAssistant />

    </div>
  );
}
