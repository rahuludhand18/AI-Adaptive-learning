'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useTabTracker } from '@/hooks/useTabTracker';
import { apiRequest } from '@/lib/api';
import {
  Brain,
  Bell,
  BookOpen,
  Trophy,
  Timer,
  Plus,
  LogOut,
  Play
} from 'lucide-react';

export default function KidDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  // Enforce tab visibility tracking lockout rules
  useTabTracker();

  const [activeTab, setActiveTab] = useState('Dashboard');

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans antialiased text-slate-800">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/focuspath_logo.png"
              alt="FocusPath Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="font-bold text-base text-slate-800 tracking-tight">FocusPath</span>
          </div>

          <nav className="flex items-center gap-8 h-full">
            {['Dashboard', 'Planner', 'Reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'Planner') router.push('/kid/stories');
                  if (tab === 'Reports') router.push('/kid/rewards');
                }}
                className={`h-16 flex items-center text-sm font-semibold border-b-2 px-1 transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {/* Stars Count Badge */}
            <button
              onClick={() => router.push('/kid/rewards')}
              className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold py-1.5 px-4 rounded-full flex items-center gap-1.5 shadow-sm cursor-pointer hover:bg-emerald-100/50 transition-all"
            >
              <Trophy className="h-4 w-4 text-emerald-500 fill-emerald-100" />
              124
            </button>
            <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <Bell className="h-5 w-5" />
            </button>
            <button 
              onClick={() => { logout(); router.push('/auth/login'); }}
              className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 cursor-pointer"
            >
              {user.username.slice(0,2).toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl space-y-6 p-6">
        
        {/* Tab switch warning badge */}
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-xs font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Careful, Explorer! 3 tab switches will lock your account. Current switches: {user.tab_switch_count}/3</span>
        </div>

        {/* Hero Section (Col 8) & Mascot Card (Col 4) */}
        <div className="grid grid-cols-12 gap-5">
          
          {/* Welcome Adventure Panel */}
          <div className="col-span-12 lg:col-span-8 rounded-[32px] border border-slate-200 bg-white p-8 md:p-10 shadow-sm flex flex-col justify-between min-h-[300px]">
            <div className="space-y-4">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-teal-600 bg-teal-50 border border-teal-100 py-1.5 px-3.5 rounded-full w-fit block">
                MISSION OF THE DAY
              </span>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">
                Hi there, Little Explorer!
              </h2>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-md">
                Ready to earn some more stars? Buddy the Owl is here to help you finish your reading adventure today!
              </p>
            </div>

            <div className="space-y-4 pt-6">
              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Reading Explorer</span>
                  <span>75% Done</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <button
                onClick={() => router.push('/kid/stories')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 px-6 rounded-2xl transition-all shadow-sm flex items-center gap-2 cursor-pointer w-fit"
              >
                CONTINUE ADVENTURE
                <Play className="h-4 w-4 fill-white" />
              </button>
            </div>
          </div>

          {/* Mascot Display Card */}
          <div className="col-span-12 lg:col-span-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden bg-gradient-to-br from-indigo-50/50 to-transparent">
            {/* Owl SVG Mascot */}
            <div className="w-36 h-36 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Body */}
                <ellipse cx="50" cy="55" rx="30" ry="34" fill="#a7f3d0" />
                <ellipse cx="50" cy="55" rx="22" ry="25" fill="#ffffff" />
                {/* Ears */}
                <path d="M 28 32 C 20 22, 38 18, 38 28 Z" fill="#6ee7b7" />
                <path d="M 72 32 C 80 22, 62 18, 62 28 Z" fill="#6ee7b7" />
                {/* Eyes */}
                <circle cx="40" cy="42" r="7" fill="#1e293b" />
                <circle cx="40" cy="40" r="2.5" fill="#ffffff" />
                <circle cx="60" cy="42" r="7" fill="#1e293b" />
                <circle cx="60" cy="40" r="2.5" fill="#ffffff" />
                {/* Beak */}
                <polygon points="46,48 54,48 50,56" fill="#fb923c" />
                {/* Wings */}
                <path d="M 20 50 C 10 50, 15 65, 23 60" stroke="#6ee7b7" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M 80 50 C 90 40, 85 30, 75 42" stroke="#6ee7b7" strokeWidth="4" fill="none" strokeLinecap="round" />
                {/* Chest feathers pattern */}
                <path d="M 44 65 L 50 60 L 56 65" stroke="#93c5fd" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 42 72 L 50 67 L 58 72" stroke="#93c5fd" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mt-4">Buddy</h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mt-1">
              Active Companion
            </span>
          </div>

          {/* Three Bento Cards */}
          {/* Card 1: My Stories */}
          <div className="col-span-12 md:col-span-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between min-h-[220px]">
            <div className="space-y-4">
              <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-2xl w-fit">
                <BookOpen className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-base font-bold text-slate-800">My Stories</h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Read your favorite adventures and unlock new chapters.
              </p>
            </div>
            <button onClick={() => router.push('/kid/stories')} className="text-xs font-bold text-indigo-600 hover:underline text-left cursor-pointer pt-4">
              Open Book →
            </button>
          </div>

          {/* Card 2: Prizes (dashed teal border) */}
          <div className="col-span-12 md:col-span-4 rounded-[32px] border-2 border-dashed border-teal-300 bg-white p-8 shadow-sm flex flex-col justify-between min-h-[220px]">
            <div className="space-y-4">
              <div className="bg-teal-50 text-teal-600 p-2.5 rounded-2xl w-fit">
                <Trophy className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Prizes</h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Trade your 124 stars for cool new hats for Buddy!
              </p>
            </div>
            <button onClick={() => router.push('/kid/rewards')} className="text-xs font-bold text-teal-600 hover:underline text-left cursor-pointer pt-4">
              See Rewards 🛍
            </button>
          </div>

          {/* Card 3: Focus Time (solid purple) */}
          <div className="col-span-12 md:col-span-4 rounded-[32px] border border-transparent bg-indigo-600 text-white p-8 shadow-sm flex flex-col justify-between min-h-[220px]">
            <div className="space-y-4">
              <div className="bg-white/10 p-2.5 rounded-2xl w-fit">
                <Timer className="h-5.5 w-5.5 text-white" />
              </div>
              <h3 className="text-base font-bold">Focus Time</h3>
              <p className="text-xs text-white/80 font-semibold leading-relaxed">
                Start a timer to earn extra bonus stars!
              </p>
            </div>
            <button onClick={() => router.push('/adult/focus')} className="w-full bg-white hover:bg-white/95 text-indigo-600 font-bold text-xs py-3 rounded-2xl transition-all shadow-sm flex items-center justify-center cursor-pointer mt-4">
              Start Focus
            </button>
          </div>

          {/* Buddy's Friends Leaderboard Card (Col span 12) */}
          <div className="col-span-12 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">Buddy's Friends</h3>
              <button className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
            </div>

            <div className="flex flex-wrap gap-6 items-center">
              
              {/* Leo */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full border-2 border-indigo-600 bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-700 relative">
                  LE
                  <span className="absolute -bottom-1.5 bg-amber-400 text-[8px] font-bold text-white px-1.5 rounded-full shadow-sm">1st</span>
                </div>
                <span className="text-xs font-bold text-slate-700">Leo</span>
              </div>

              {/* Mia */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full border-2 border-transparent bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-700">
                  MI
                </div>
                <span className="text-xs font-bold text-slate-700">Mia</span>
              </div>

              {/* Sam */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full border-2 border-transparent bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-700">
                  SA
                </div>
                <span className="text-xs font-bold text-slate-700">Sam</span>
              </div>

              {/* Zoe */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full border-2 border-transparent bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-700">
                  ZO
                </div>
                <span className="text-xs font-bold text-slate-700">Zoe</span>
              </div>

              {/* Add friend button */}
              <div className="flex flex-col items-center gap-2 cursor-pointer">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-white flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-400">Add Friend</span>
              </div>

            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
