'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useTabTracker } from '@/hooks/useTabTracker';
import {
  Brain,
  ArrowLeft,
  Flame,
  Sun,
  Calculator,
  BookOpen,
  FlaskConical,
  Palette,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function KidRewards() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Track tab focus
  useTabTracker();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans antialiased text-slate-800">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/kid/dashboard')}
              className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-500 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src="/focuspath_logo.png"
                alt="FocusPath Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="font-bold text-base text-slate-800 tracking-tight">FocusPath</span>
            </div>
          </div>

          <nav className="flex items-center gap-8 h-full">
            <button onClick={() => router.push('/kid/dashboard')} className="h-16 flex items-center text-sm font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-600 cursor-pointer">
              Home
            </button>
            <button onClick={() => router.push('/kid/stories')} className="h-16 flex items-center text-sm font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-600 cursor-pointer">
              Story
            </button>
            <button className="h-16 flex items-center text-sm font-semibold border-b-2 border-indigo-600 text-indigo-600 px-1 cursor-pointer">
              Rewards
            </button>
          </nav>
          
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
            {user.username.slice(0,2).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-4xl space-y-8 p-6 py-12">
        
        {/* Welcome Area */}
        <div className="flex flex-col items-center text-center space-y-5">
          {/* Owl mascot SVG */}
          <div className="w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <ellipse cx="50" cy="55" rx="30" ry="34" fill="#a7f3d0" />
              <ellipse cx="50" cy="55" rx="22" ry="25" fill="#ffffff" />
              <path d="M 28 32 C 20 22, 38 18, 38 28 Z" fill="#6ee7b7" />
              <path d="M 72 32 C 80 22, 62 18, 62 28 Z" fill="#6ee7b7" />
              <circle cx="40" cy="42" r="7" fill="#1e293b" />
              <circle cx="40" cy="40" r="2.5" fill="#ffffff" />
              <circle cx="60" cy="42" r="7" fill="#1e293b" />
              <circle cx="60" cy="40" r="2.5" fill="#ffffff" />
              <polygon points="46,48 54,48 50,56" fill="#fb923c" />
              <path d="M 20 50 C 10 50, 15 65, 23 60" stroke="#6ee7b7" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 80 50 C 90 40, 85 30, 75 42" stroke="#6ee7b7" strokeWidth="4" fill="none" strokeLinecap="round" />
              <text x="50" y="93" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#6ee7b7">Buddy</text>
            </svg>
          </div>

          <h2 className="text-3xl font-black text-slate-800 leading-tight">
            You're doing great!
          </h2>

          {/* Stars Pill */}
          <div className="bg-white rounded-full py-3.5 px-8 shadow-sm border border-slate-200/60 flex items-center gap-2.5">
            <span className="text-xl">⭐</span>
            <span className="text-xl font-black text-slate-800">125 Stars</span>
          </div>

          {/* Daily Streak Flame Row */}
          <div className="bg-indigo-50/40 rounded-3xl border border-indigo-100/50 p-4 w-full max-w-sm flex items-center justify-around">
            {[
              { name: 'M', active: true },
              { name: 'T', active: true },
              { name: 'W', active: true },
              { name: 'T', active: true },
              { name: 'F', active: true },
              { name: 'S', active: false },
              { name: 'S', active: false },
            ].map((d, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <Flame className={`h-5 w-5 ${d.active ? 'text-orange-500 fill-orange-500' : 'text-slate-300'}`} />
                <span className="text-[10px] font-bold text-slate-400">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Your Badges Section */}
        <div className="space-y-6 pt-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800">Your Badges</h3>
              <p className="text-xs text-slate-400 font-semibold">Keep learning to unlock them all!</p>
            </div>
            
            <button className="bg-coral-500 bg-red-400 hover:bg-red-500 text-white font-bold text-xs py-2.5 px-6 rounded-full cursor-pointer shadow-sm">
              Store
            </button>
          </div>

          {/* Badges Grid (12-column template cards) */}
          <div className="grid grid-cols-12 gap-5">
            
            {/* Badge 1: Early Bird (Earned) */}
            <div className="col-span-12 md:col-span-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center text-center gap-3 border-b-4 border-b-yellow-400">
              <div className="bg-yellow-50 text-yellow-500 p-3 rounded-full border border-yellow-100">
                <Sun className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Early Bird</h4>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">EARNED</span>
            </div>

            {/* Badge 2: Math Master (Earned) */}
            <div className="col-span-12 md:col-span-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center text-center gap-3 border-b-4 border-b-indigo-500">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-full border border-indigo-100">
                <Calculator className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Math Master</h4>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">EARNED</span>
            </div>

            {/* Badge 3: Story Explorer (Earned) */}
            <div className="col-span-12 md:col-span-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center text-center gap-3 border-b-4 border-b-teal-500">
              <div className="bg-teal-50 text-teal-600 p-3 rounded-full border border-teal-100">
                <BookOpen className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Story Explorer</h4>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">EARNED</span>
            </div>

            {/* Badge 4: Science Star (Locked) */}
            <div className="col-span-12 md:col-span-4 rounded-[32px] border border-slate-200 bg-white/60 p-6 shadow-sm flex flex-col items-center justify-center text-center gap-3 opacity-50">
              <div className="bg-slate-50 text-slate-400 p-3 rounded-full border border-slate-100">
                <FlaskConical className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Science Star</h4>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">LOCKED</span>
            </div>

            {/* Badge 5: Artistic Owl (Locked) */}
            <div className="col-span-12 md:col-span-4 rounded-[32px] border border-slate-200 bg-white/60 p-6 shadow-sm flex flex-col items-center justify-center text-center gap-3 opacity-50">
              <div className="bg-slate-50 text-slate-400 p-3 rounded-full border border-slate-100">
                <Palette className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Artistic Owl</h4>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">LOCKED</span>
            </div>

            {/* Badge 6: Perfect Week (Locked) */}
            <div className="col-span-12 md:col-span-4 rounded-[32px] border border-slate-200 bg-white/60 p-6 shadow-sm flex flex-col items-center justify-center text-center gap-3 opacity-50">
              <div className="bg-slate-50 text-slate-400 p-3 rounded-full border border-slate-100">
                <Calendar className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Perfect Week</h4>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">LOCKED</span>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
}
