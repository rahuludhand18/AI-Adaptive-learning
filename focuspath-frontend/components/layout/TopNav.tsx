'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Settings, Layers, UploadCloud, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useFocusStore } from '@/store/useFocusStore';
import { useAuthStore } from '@/store/authStore';

export const TopNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useFocusStore();
  const { logout } = useAuthStore();

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
    { name: 'Insights', href: '/adult/analytics' },
    { name: 'Community', href: '/adult/reports' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-sm">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left: Logo & Nav Links */}
        <div className="flex items-center space-x-10">
          <Link href="/adult/dashboard" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-indigo flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-indigo tracking-tight">FocusPath</span>
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
                    isActive ? 'text-indigo font-bold' : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Quick Action Button, Icons & Avatar Dropdown */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Upload Syllabus Global Option */}
          <Link
            href="/adult/onboarding"
            className="py-2 px-3.5 bg-indigo-light hover:bg-indigo/10 text-indigo font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
            title="Upload new course syllabus to generate schedule"
          >
            <UploadCloud className="w-4 h-4 text-indigo" />
            <span className="hidden sm:inline">Upload Syllabus</span>
          </Link>

          {/* Bell Icon with badge */}
          <button className="relative p-2 rounded-xl text-textPrimary hover:bg-indigo-light/50 transition-colors cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full ring-2 ring-white" />
          </button>

          {/* Settings Icon */}
          <Link href="/parent/restrictions" className="p-2 rounded-xl text-textPrimary hover:bg-indigo-light/50 transition-colors cursor-pointer">
            <Settings className="w-5 h-5" />
          </Link>

          {/* Avatar Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-9 h-9 rounded-full ring-2 ring-indigo/20 overflow-hidden cursor-pointer hover:ring-indigo transition-all focus:outline-none flex items-center justify-center"
              title="User profile"
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </button>

            {/* Roll-out Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-white border border-border shadow-xl p-2.5 space-y-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Header Info */}
                <div className="flex items-center space-x-3 p-2 bg-indigo-light/40 rounded-xl border border-indigo/10">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-indigo/20">
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-textPrimary truncate">{user.name}</h4>
                    <span className="text-[10px] font-semibold text-indigo bg-white px-2 py-0.5 rounded-full border border-indigo/10 inline-block mt-0.5">
                      Adult Mode
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/60 my-1" />

                {/* Profile Link */}
                <Link
                  href="/adult/analytics"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center space-x-2.5 p-2 rounded-xl text-textPrimary hover:bg-slate-50 transition-colors text-xs font-semibold"
                >
                  <UserIcon className="w-4 h-4 text-textSecondary" />
                  <span>My Profile & Stats</span>
                </Link>

                {/* Parent Controls Link */}
                <Link
                  href="/parent/restrictions"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center space-x-2.5 p-2 rounded-xl text-textPrimary hover:bg-slate-50 transition-colors text-xs font-semibold"
                >
                  <Shield className="w-4 h-4 text-textSecondary" />
                  <span>Parental Controls</span>
                </Link>

                <div className="border-t border-border/60 my-1" />

                {/* Logout Action Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-xs font-bold cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
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
