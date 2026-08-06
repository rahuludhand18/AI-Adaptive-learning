'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  Activity,
  Shield,
  Lock,
  User,
  Settings,
  LogOut,
  Sparkles,
  Lightbulb,
  Bell,
  Layers
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased flex flex-col">
      {/* Top Main Navbar */}
      <header className="bg-white border-b border-slate-200/80 px-8 h-16 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/parent/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl text-indigo-600 tracking-tight">
              FocusPath
            </span>
          </Link>
        </div>

        {/* Right User Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/parent/restrictions')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Parent Settings"
          >
            <Settings className="h-5 w-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 focus:outline-none cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-sm ring-2 ring-indigo-600/20 hover:ring-indigo-600 transition-all">
                {userInitial}
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.username || 'Parent Account'}
                  </p>
                  <p className="text-[10px] font-semibold text-indigo-600">Parent Role</p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push('/parent/account');
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  Account & Profiles
                </button>
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

      {/* Main Body Layout (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-slate-50/90 border-r border-slate-200/80 flex flex-col justify-between p-6 shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-20 overflow-y-auto">
          <div className="space-y-6">
            {/* Sidebar Section Sub-header */}
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
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
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white text-indigo-600'
                            : 'bg-indigo-100 text-indigo-700'
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
          <div className="space-y-4 pt-4 border-t border-slate-200/60">
            {/* Focus Tip Card */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-indigo-700">
                <Lightbulb className="h-4 w-4 shrink-0 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-900">Focus Tip</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Regular eye breaks every 20 minutes can improve focus endurance by up to 30%.
              </p>
            </div>

            {/* Bottom Gear Settings */}
            <button
              onClick={() => router.push('/parent/restrictions')}
              className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <Settings className="h-4.5 w-4.5 text-slate-400" />
              <span>Settings</span>
            </button>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

