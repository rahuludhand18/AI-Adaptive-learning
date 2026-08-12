'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  Activity,
  Shield,
  Lock,
  User,
  Settings,
  LogOut,
  Lightbulb
} from 'lucide-react';

interface ParentLayoutProps {
  children: ReactNode;
  pendingRequestsCount?: number;
}

export default function ParentLayout({ children, pendingRequestsCount = 1 }: ParentLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'PARENT') {
      router.push('/auth/login?role=PARENT&notice=parent_required');
    }
  }, [user, router]);

  const navItems = [
    {
      name: 'Monitoring',
      href: '/parent/dashboard',
      icon: Activity,
    },
    {
      name: 'Restrictions',
      href: '/parent/restrictions',
      icon: Shield,
    },
    {
      name: 'Access Requests',
      href: '/parent/requests',
      icon: Lock,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
    },
    {
      name: 'Account',
      href: '/parent/account',
      icon: User,
    },
  ];

  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : 'P';

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f17] text-slate-800 dark:text-slate-100 font-sans antialiased flex flex-col transition-colors">
      {/* Top Main Navbar */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-6 sm:px-8 h-16 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <Link href="/parent/dashboard" className="flex items-center group">
            <img
              src="/focuspath_logo.png"
              alt="FocusPath"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Right User Controls */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          <button
            onClick={() => router.push('/parent/restrictions')}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200/70 dark:hover:border-slate-700 transition-colors cursor-pointer"
            title="Parent Settings"
          >
            <Settings className="h-4.5 w-4.5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 focus:outline-none cursor-pointer"
              title="Parent Account"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-sm ring-2 ring-indigo-600/20 dark:ring-indigo-500/30 hover:ring-indigo-600 transition-all">
                {userInitial}
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user?.username || 'Parent Account'}
                  </p>
                  <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">Parent Role</p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push('/parent/account');
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer text-left"
                >
                  <User className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  Account & Profiles
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

      {/* Main Body Layout (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-slate-50/90 dark:bg-slate-900/90 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between p-6 shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-20 overflow-y-auto transition-colors">
          <div className="space-y-6">
            {/* Sidebar Section Sub-header */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                MANAGEMENT
              </span>
            </div>

            {/* Nav Menu Items */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center justify-between py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white text-indigo-600'
                            : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Widgets */}
          <div className="space-y-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
            {/* Focus Tip Card */}
            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-4 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Lightbulb className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Focus Tip</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                Regular eye breaks every 20 minutes can improve focus endurance by up to 30%.
              </p>
            </div>

            {/* Bottom Gear Settings */}
            <button
              onClick={() => router.push('/parent/restrictions')}
              className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <Settings className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
              <span>Settings</span>
            </button>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
