'use client';

import { ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTabTracker } from '@/hooks/useTabTracker';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AiAssistant } from '@/components/AiAssistant';
import {
  Home,
  BookOpen,
  Trophy,
  LogOut,
  GraduationCap,
  Puzzle,
  Users,
  MessageSquare,
  Calendar
} from 'lucide-react';

interface KidLayoutProps {
  children: ReactNode;
  starsCount?: number;
}

export default function KidLayout({ children, starsCount = 250 }: KidLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  // Enable Tab tracking for kids mode and get UI states
  const { showWarning, setShowWarning, isLockedOut, tabSwitchCount } = useTabTracker();

  const topNavItems = [
    { name: 'Home', href: '/kid/dashboard', icon: Home },
    { name: 'Schedule', href: '/kid/planner', icon: Calendar },
    { name: 'Learn', href: '/kid/learn', icon: GraduationCap },
    { name: 'Quests', href: '/kid/quests', icon: Puzzle },
    { name: 'Story', href: '/kid/stories', icon: BookOpen },
    { name: 'Rewards', href: '/kid/rewards', icon: Trophy },
  ];

  const userInitial = user?.username ? user.username.slice(0, 2).toUpperCase() : 'KD';

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f17] text-slate-800 dark:text-slate-100 font-sans antialiased flex flex-col transition-colors">
      
      {/* Top Navbar */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-xs transition-colors">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/kid/dashboard" className="flex items-center group">
            <img
              src="/focuspath_logo.png"
              alt="FocusPath"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Center Nav Links with Icons */}
        <nav className="hidden sm:flex items-center gap-6 md:gap-8 h-full">
          {topNavItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComp = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`h-16 flex items-center gap-2 text-sm transition-colors cursor-pointer relative font-bold ${
                  isActive
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
                }`}
              >
                <IconComp className={`h-4.5 w-4.5 ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Right User Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Stars Points Badge */}
          <button
            onClick={() => router.push('/kid/rewards')}
            className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-xs font-extrabold py-2 px-3.5 sm:px-4 rounded-full flex items-center gap-1.5 shadow-2xs hover:bg-amber-100/80 dark:hover:bg-amber-900/60 transition-all cursor-pointer"
            title="Star Balance"
          >
            <span className="text-amber-500 text-sm">★</span>
            <span>{starsCount}</span>
          </button>

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              suppressHydrationWarning
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-9 h-9 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shadow-sm ring-2 ring-primary/20 dark:ring-primary/40 hover:ring-primary transition-all cursor-pointer"
              title="Kid Profile"
            >
              {userInitial}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user?.username || 'Kid Explorer'}
                  </p>
                  <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Kid Mode Active</p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    document.cookie = 'activeRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    router.push('/select-profile');
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer text-left"
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

      {/* Main Body Layout (Full Width Canvas) */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* WARNING MODAL */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-8 md:p-12 border border-amber-200 dark:border-amber-900 shadow-2xl space-y-6">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <span className="text-4xl">⚠️</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">Focus Lost!</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                You left the FocusPath tab! (Warning {tabSwitchCount} of 3)
              </p>
              <p className="text-xs text-rose-500 font-bold mt-2">
                If you reach 3 strikes, your account will be locked.
              </p>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="w-full py-3.5 px-6 bg-amber-500 text-white font-bold text-sm rounded-xl hover:bg-amber-600 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              I understand, let me back in
            </button>
          </div>
        </div>
      )}

      {/* LOCKOUT SCREEN */}
      {isLockedOut && (
        <div className="fixed inset-0 z-[200] bg-rose-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-xl space-y-8 animate-in zoom-in duration-300">
            <div className="text-7xl">🚫</div>
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
