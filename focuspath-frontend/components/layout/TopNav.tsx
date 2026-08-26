'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Settings, UploadCloud, LogOut, User as UserIcon, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const TopNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'U';

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    router.push('/auth/login');
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Dashboard', href: '/adult/dashboard' },
    { name: 'Schedule', href: '/adult/planner' },
    { name: 'Progress', href: '/adult/progress' },
    { name: 'Insights', href: '/adult/analytics' },
    { name: 'Community', href: '/adult/reports' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left: Logo & Nav Links */}
        <div className="flex items-center space-x-10">
          <Link href="/adult/dashboard" className="flex items-center group">
            <img
              src="/focuspath_logo.png"
              alt="FocusPath"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/adult/dashboard' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors relative py-5 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Quick Action Button, Icons, Theme Toggle & Avatar Dropdown */}
        <div className="flex items-center space-x-3 sm:space-x-3.5">
          
          {/* Add Subject Global Option */}
          <Link
            href="/adult/onboarding"
            className="py-2 px-3.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl border border-indigo-100 dark:border-indigo-800/40 transition-colors flex items-center space-x-1.5"
            title="Add a new subject to track"
          >
            <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Add Subject</span>
          </Link>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Bell Icon with badge */}
          <button className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200/70 dark:hover:border-slate-700 transition-colors cursor-pointer" title="Notifications">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* Settings Icon */}
          <Link
            href="/adult/settings"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200/70 dark:hover:border-slate-700 transition-colors cursor-pointer"
            title="Adult Settings"
          >
            <Settings className="w-4.5 h-4.5" />
          </Link>

          {/* Avatar Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-9 h-9 rounded-full ring-2 ring-indigo-500/20 dark:ring-indigo-400/30 overflow-hidden cursor-pointer hover:ring-indigo-500 transition-all focus:outline-none flex items-center justify-center"
              title="User profile"
            >
              <span className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-xs font-bold">
                {mounted ? initials : 'U'}
              </span>
            </button>

            {/* Roll-out Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2.5 space-y-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Header Info */}
                <div className="flex items-center space-x-3 p-2 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center bg-indigo-600 text-white text-xs font-bold">
                    {mounted ? initials : 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{mounted && user?.username ? user.username : 'User'}</h4>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900 inline-block mt-0.5">
                      Adult Mode
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                {/* Profile Link */}
                <Link
                  href="/adult/analytics"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center space-x-2.5 p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors text-xs font-semibold"
                >
                  <UserIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>My Profile & Stats</span>
                </Link>

                {/* Settings Link */}
                <Link
                  href="/adult/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center space-x-2.5 p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors text-xs font-semibold"
                >
                  <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>Workspace Settings</span>
                </Link>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                {/* Logout Action Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-xs font-bold cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
