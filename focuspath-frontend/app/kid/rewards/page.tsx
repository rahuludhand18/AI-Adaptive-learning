'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  Home,
  BookOpen,
  Trophy,
  Sun,
  FlaskConical,
  Palette,
  Calendar,
  User,
  LogOut,
  Flame
} from 'lucide-react';

export default function KidRewardsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const userInitial = user?.username ? user.username.slice(0, 2).toUpperCase() : 'A';

  const dailyStreakDays = [
    { day: 'M', active: true },
    { name: 'T', active: true },
    { name: 'W', active: true },
    { name: 'T', active: true },
    { name: 'F', active: true, hasNotification: true },
    { name: 'S', active: false },
    { name: 'S', active: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F4FF] via-[#F8FAFC] to-[#F0F4FF] text-slate-800 font-sans antialiased flex flex-col">
      
      {/* Top Navbar Header */}
      <header className="bg-white/90 backdrop-blur-xs border-b border-slate-200/80 px-8 h-16 flex items-center justify-between sticky top-0 z-40 shrink-0 shadow-2xs">
        {/* Left Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/kid/dashboard" className="flex items-center group">
            <img
              src="/focuspath_logo.png"
              alt="FocusPath"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>
        </div>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-8 h-full">
          <button
            onClick={() => router.push('/kid/dashboard')}
            className="h-16 flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Home
          </button>

          <button
            onClick={() => router.push('/kid/stories')}
            className="h-16 flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Story
          </button>

          <button
            onClick={() => router.push('/kid/rewards')}
            className="h-16 flex items-center text-sm font-extrabold text-indigo-600 border-b-2 border-indigo-600 cursor-pointer"
          >
            Rewards
          </button>
        </nav>

        {/* Right User Avatar Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-all"
            >
              <User className="h-5 w-5 text-slate-600" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.username || 'Alex'}
                  </p>
                  <p className="text-[10px] font-semibold text-indigo-600">Kid Rewards</p>
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-8 space-y-10">
        
        {/* 1. Mascot & Welcome Hero Section */}
        <div className="flex flex-col items-center text-center space-y-5 pt-4">
          
          {/* Owl Mascot Card Frame */}
          <div className="w-36 h-36 bg-white rounded-3xl p-3 shadow-md border border-slate-100 flex flex-col items-center justify-center space-y-1">
            <img
              src="/kid_owl_mascot.png"
              alt="Buddy"
              className="w-24 h-24 object-contain"
            />
            <span className="text-xs font-extrabold text-[#75C460]">Buddy</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-extrabold text-[#4F46E5] tracking-tight">
            You're doing great!
          </h1>

          {/* 125 Stars Pill Card */}
          <div className="bg-white rounded-full py-3.5 px-10 shadow-md border border-slate-200/80 flex items-center gap-3">
            <span className="text-2xl text-amber-400 font-extrabold">⭐</span>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">125 Stars</span>
          </div>

          {/* Daily Streak Box */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-3xl p-4 w-full max-w-sm shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-500 block">Daily Streak</span>
            <div className="flex items-center justify-around">
              {[
                { day: 'M', active: true },
                { day: 'T', active: true },
                { day: 'W', active: true },
                { day: 'T', active: true },
                { day: 'F', active: true, notif: true },
                { day: 'S', active: false },
                { day: 'S', active: false },
              ].map((d, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 relative">
                  {d.notif && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 absolute -top-1 right-0 shadow-2xs" />
                  )}
                  <Flame
                    className={`h-5 w-5 ${
                      d.active ? 'text-orange-500 fill-orange-500' : 'text-slate-300'
                    }`}
                  />
                  <span className="text-[10px] font-bold text-slate-400">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 2. Your Badges Section */}
        <div className="space-y-6 pt-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Badges</h2>
              <p className="text-xs text-slate-400 font-semibold">Keep learning to unlock them all!</p>
            </div>

            <button
              onClick={() => router.push('/kid/dashboard')}
              className="bg-[#FF6F59] hover:bg-[#FF583E] text-white font-extrabold text-xs py-2.5 px-6 rounded-full shadow-md cursor-pointer transition-all hover:scale-105"
            >
              Store
            </button>
          </div>

          {/* 3x2 Grid of Badges */}
          <div className="grid grid-cols-12 gap-6">
            
            {/* Badge 1: Early Bird (Earned) */}
            <div className="col-span-12 md:col-span-4 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col items-center justify-center text-center gap-3 border-b-4 border-b-amber-400">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center border border-amber-200">
                <Sun className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900">Early Bird</h3>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-0.5">
                  EARNED
                </span>
              </div>
            </div>

            {/* Badge 2: Math Master (Earned) */}
            <div className="col-span-12 md:col-span-4 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col items-center justify-center text-center gap-3 border-b-4 border-b-indigo-600">
              <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border border-indigo-200">
                <div className="grid grid-cols-2 gap-0.5 text-indigo-600 font-extrabold text-[10px]">
                  <span>−</span><span>×</span>
                  <span>+</span><span>=</span>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900">Math Master</h3>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-0.5">
                  EARNED
                </span>
              </div>
            </div>

            {/* Badge 3: Story Explorer (Earned) */}
            <div className="col-span-12 md:col-span-4 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-2xs flex flex-col items-center justify-center text-center gap-3 border-b-4 border-b-teal-500">
              <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center border border-teal-200">
                <BookOpen className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900">Story Explorer</h3>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-0.5">
                  EARNED
                </span>
              </div>
            </div>

            {/* Badge 4: Science Star (Locked) */}
            <div className="col-span-12 md:col-span-4 rounded-[28px] border border-slate-200/80 bg-white/60 p-6 shadow-2xs flex flex-col items-center justify-center text-center gap-3 opacity-40">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
                <FlaskConical className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-700">Science Star</h3>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-0.5">
                  LOCKED
                </span>
              </div>
            </div>

            {/* Badge 5: Artistic Owl (Locked) */}
            <div className="col-span-12 md:col-span-4 rounded-[28px] border border-slate-200/80 bg-white/60 p-6 shadow-2xs flex flex-col items-center justify-center text-center gap-3 opacity-40">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
                <Palette className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-700">Artistic Owl</h3>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-0.5">
                  LOCKED
                </span>
              </div>
            </div>

            {/* Badge 6: Perfect Week (Locked) */}
            <div className="col-span-12 md:col-span-4 rounded-[28px] border border-slate-200/80 bg-white/60 p-6 shadow-2xs flex flex-col items-center justify-center text-center gap-3 opacity-40">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
                <Calendar className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-700">Perfect Week</h3>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-0.5">
                  LOCKED
                </span>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
