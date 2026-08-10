'use client';

import { ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  Home,
  BookOpen,
  Trophy,
  User,
  Sparkles,
  BarChart2,
  HelpCircle,
  LogOut,
  Layers,
  Shield
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

  const topNavItems = [
    { name: 'Home', href: '/kid/dashboard', icon: Home },
    { name: 'Story', href: '/kid/stories', icon: BookOpen },
    { name: 'Rewards', href: '/kid/rewards', icon: Trophy },
  ];

  const sideNavItems = [
    { name: 'Adult Mode', href: '/adult/dashboard', icon: User },
    { name: 'Kid Mode', href: '/kid/dashboard', icon: Sparkles, active: true },
    { name: 'Parent Mode', href: '/parent/dashboard', icon: Shield },
    { name: 'Analytics', href: '/adult/analytics', icon: BarChart2 },
  ];

  const userInitial = user?.username ? user.username.slice(0, 2).toUpperCase() : 'JD';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased flex flex-col">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 px-8 h-16 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-xs">
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
        <nav className="flex items-center gap-8 h-full">
          {topNavItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComp = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`h-16 flex items-center gap-2 text-sm transition-colors cursor-pointer relative font-bold ${
                  isActive
                    ? 'text-indigo-600 font-bold border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <IconComp className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Right User Controls */}
        <div className="flex items-center gap-3">
          {/* Stars Points Badge */}
          <button
            onClick={() => router.push('/kid/rewards')}
            className="bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-extrabold py-2 px-4 rounded-full flex items-center gap-1.5 shadow-2xs hover:bg-teal-200/80 transition-all cursor-pointer"
          >
            <span className="text-amber-500 text-sm">★</span>
            <span>{starsCount}</span>
          </button>

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm ring-2 ring-indigo-600/20 hover:ring-indigo-600 transition-all cursor-pointer"
            >
              {userInitial}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.username || 'Kid Explorer'}
                  </p>
                  <p className="text-[10px] font-semibold text-teal-600">Kid Mode Active</p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                    router.push('/auth/login');
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="h-4 w-4 text-rose-600" />
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
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

    </div>
  );
}
