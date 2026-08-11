'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  Home,
  BookOpen,
  Trophy,
  Zap,
  Award,
  Rocket,
  Lock,
  Play,
  CheckCircle2,
  Check,
  LogOut
} from 'lucide-react';

export default function KidStoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F0F4FF]" />}>
      <KidStoriesContent />
    </Suspense>
  );
}

function KidStoriesContent() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [readingCompleted, setReadingCompleted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const isCompleted = localStorage.getItem('focuspath_quest_reading_completed') === 'true' || searchParams.get('unlocked') === 'math';
      if (isCompleted) {
        setReadingCompleted(true);
      }
    }
  }, []);

  const userInitial = user?.username ? user.username.slice(0, 2).toUpperCase() : 'A';

  const handleStartReadingQuest = () => {
    router.push('/kid/play');
  };

  const handleStartMathQuest = () => {
    alert('Starting Math Island Quest!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F4FF] via-[#F8FAFC] to-[#F0F4FF] text-slate-800 font-sans antialiased flex flex-col">
      
      {/* Top Navbar Header */}
      <header className="bg-white/90 backdrop-blur-xs border-b border-slate-200/80 px-8 h-16 flex items-center justify-between sticky top-0 z-40 shrink-0 shadow-2xs">
        {/* Left Logo */}
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
          <button
            onClick={() => router.push('/kid/dashboard')}
            className="h-16 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <Home className="h-4.5 w-4.5 text-slate-400" />
            <span>Home</span>
          </button>

          <button
            onClick={() => router.push('/kid/stories')}
            className="h-16 flex items-center gap-2 text-sm font-extrabold text-indigo-600 border-b-2 border-indigo-600 cursor-pointer"
          >
            <BookOpen className="h-4.5 w-4.5 text-indigo-600" />
            <span>Story</span>
          </button>

          <button
            onClick={() => router.push('/kid/rewards')}
            className="h-16 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <Trophy className="h-4.5 w-4.5 text-slate-400" />
            <span>Rewards</span>
          </button>
        </nav>

        {/* Right Stars Badge & Avatar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/kid/rewards')}
            className="bg-amber-100/90 border border-amber-200 text-amber-900 text-xs font-extrabold py-1.5 px-4 rounded-full flex items-center gap-1.5 shadow-2xs hover:bg-amber-200/80 transition-all cursor-pointer"
          >
            <span className="text-amber-500 text-sm">★</span>
            <span>{readingCompleted ? 125 : 120}</span>
          </button>

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-9 h-9 rounded-full bg-teal-200 text-teal-900 font-bold text-xs flex items-center justify-center shadow-sm ring-2 ring-indigo-600/20 hover:ring-indigo-600 transition-all cursor-pointer overflow-hidden"
            >
              <span className="font-extrabold">{userInitial}</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user?.username || 'Alex'}
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-8 space-y-12">
        
        {/* 1. Hero Banner Header Section */}
        <div className="flex items-center justify-between pt-4">
          <div className="space-y-4 max-w-lg">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Hi Alex!
              </h1>
              <div className="text-3xl font-extrabold text-indigo-600 flex items-center gap-2">
                <span>Let's study</span>
                <span className="text-2xl">🎒</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Your learning adventure is waiting! Choose a quest to earn more stars today.
            </p>

            <button
              onClick={readingCompleted ? handleStartMathQuest : handleStartReadingQuest}
              className="bg-[#046B5C] hover:bg-[#035448] text-white font-extrabold text-xs py-3.5 px-8 rounded-full shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              {readingCompleted ? 'Play Math Island!' : 'Keep Going!'}
            </button>
          </div>

          {/* Owl Mascot 3D Image */}
          <div className="w-80 h-52 relative shrink-0 flex items-center justify-center">
            <img
              src="/kid_owl_mascot.png"
              alt="Owl Mascot"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* 2. Interactive Quest Trail Map (Curved Dotted Arc Line) */}
        <div className="relative py-16 px-4 flex flex-col items-center min-h-[320px] justify-center">
          
          {/* Curved Dotted SVG Arc Path */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <svg className="w-full h-full max-w-4xl" viewBox="0 0 800 240" fill="none">
              <path
                d="M 140 180 C 260 30, 540 30, 660 180"
                stroke={readingCompleted ? '#10B981' : '#A5B4FC'}
                strokeWidth="4"
                strokeDasharray="8 8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* 3 Quest Nodes along the Arc */}
          <div className="relative w-full max-w-4xl flex justify-between items-center z-10 px-8">
            
            {/* Node 1: Reading Quest (Bottom Left) */}
            <div className="flex flex-col items-center text-center space-y-3 pt-16">
              <div
                onClick={handleStartReadingQuest}
                className="relative cursor-pointer group"
              >
                {/* Green Outer Ring Frame */}
                <div
                  className={`w-36 h-36 rounded-full border-4 p-1.5 bg-white shadow-xl overflow-hidden group-hover:scale-105 transition-all ${
                    readingCompleted ? 'border-emerald-500' : 'border-[#046B5C]'
                  }`}
                >
                  <img
                    src="/reading_quest_thumb.png"
                    alt="Reading Quest"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                {/* Badge: Play or Completed Checkmark */}
                {readingCompleted ? (
                  <div className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                    <Check className="h-5 w-5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                    <Play className="h-4.5 w-4.5 fill-white ml-0.5" />
                  </div>
                )}
              </div>

              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-slate-900">Reading Quest</h3>
                {readingCompleted ? (
                  <span className="text-[10px] font-extrabold text-emerald-600 tracking-wider uppercase flex items-center gap-1 justify-center">
                    <CheckCircle2 className="h-3 w-3" /> COMPLETED
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-[#046B5C] tracking-wider uppercase">
                    READY TO PLAY
                  </span>
                )}
              </div>
            </div>

            {/* Node 2: Math Island (Apex Top Center) */}
            <div className="flex flex-col items-center text-center space-y-3 pb-20">
              <div
                onClick={readingCompleted ? handleStartMathQuest : undefined}
                className={`relative ${readingCompleted ? 'cursor-pointer group' : ''}`}
              >
                {readingCompleted ? (
                  <div className="w-36 h-36 rounded-full border-4 border-indigo-600 p-1.5 bg-white shadow-xl overflow-hidden group-hover:scale-105 transition-all">
                    <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
                      <circle cx="50" cy="50" r="50" fill="#EEF2FF" />
                      <circle cx="50" cy="50" r="32" fill="#4F46E5" />
                      <text x="50" y="56" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#FFFFFF">+ − × =</text>
                    </svg>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-slate-300/80 p-1.5 bg-slate-100 shadow-2xs overflow-hidden opacity-70 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
                      <circle cx="50" cy="50" r="50" fill="#E2E8F0" />
                      <circle cx="50" cy="50" r="30" fill="#94A3B8" />
                      <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#64748B">+ − × =</text>
                    </svg>
                  </div>
                )}

                {/* Badge: Play or Lock */}
                {readingCompleted ? (
                  <div className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                    <Play className="h-4.5 w-4.5 fill-white ml-0.5" />
                  </div>
                ) : (
                  <div className="absolute inset-0 rounded-full bg-slate-900/30 backdrop-blur-2xs flex items-center justify-center">
                    <Lock className="h-7 w-7 text-white" />
                  </div>
                )}
              </div>

              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-slate-900">Math Island</h3>
                {readingCompleted ? (
                  <span className="text-[10px] font-extrabold text-indigo-600 tracking-wider uppercase">
                    READY TO PLAY
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                    LOCKED
                  </span>
                )}
              </div>
            </div>

            {/* Node 3: Science Lab (Bottom Right) */}
            <div className="flex flex-col items-center text-center space-y-3 pt-16">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-slate-300/80 p-1.5 bg-slate-100 shadow-2xs overflow-hidden opacity-70 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
                    <circle cx="50" cy="50" r="50" fill="#E2E8F0" />
                    <polygon points="50,20 75,75 25,75" fill="#94A3B8" />
                  </svg>
                </div>

                {/* Lock Overlay */}
                <div className="absolute inset-0 rounded-full bg-slate-900/30 backdrop-blur-2xs flex items-center justify-center">
                  <Lock className="h-7 w-7 text-white" />
                </div>
              </div>

              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-slate-700">Science Lab</h3>
                <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                  LOCKED
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* 3. Bottom 3 Bento Cards */}
        <div className="grid grid-cols-12 gap-6 pt-4">
          
          {/* Card 1: Today's Goal (Col 4) */}
          <div className="col-span-12 md:col-span-4 bg-white border-2 border-teal-200/90 rounded-[28px] p-6 shadow-2xs space-y-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="text-teal-600">
                <Zap className="h-6 w-6 fill-teal-600/20" />
              </div>
              <span className="text-xs font-extrabold text-slate-800">Today's Goal</span>
            </div>

            <div className="space-y-2">
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#046B5C] rounded-full transition-all duration-500"
                  style={{ width: readingCompleted ? '85%' : '65%' }}
                />
              </div>
              <p className="text-xs text-slate-500 font-semibold">
                {readingCompleted ? 'Awesome! 85% Complete!' : 'Almost there! 15m more.'}
              </p>
            </div>
          </div>

          {/* Card 2: Streaks (Col 4) */}
          <div className="col-span-12 md:col-span-4 bg-white border border-slate-200/90 rounded-[28px] p-6 shadow-2xs space-y-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="text-indigo-600">
                <Award className="h-6 w-6" />
              </div>
              <span className="text-xs font-extrabold text-slate-800">Streaks</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-between px-1">
                {['M', 'T', 'W', 'T', 'F'].map((day, idx) => {
                  const isActive = idx < 3; // M, T, W active
                  return (
                    <div
                      key={idx}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
                        isActive
                          ? 'bg-[#2A2BE2] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-700 font-bold">
                3 Day Streak! <span className="text-orange-500">🔥</span>
              </p>
            </div>
          </div>

          {/* Card 3: Claim Daily Prize (Col 4) */}
          <div
            onClick={() => alert('Daily Prize Claimed! +10 Stars!')}
            className="col-span-12 md:col-span-4 bg-[#2A2BE2] hover:bg-indigo-700 text-white rounded-[28px] p-6 shadow-md flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
              <Rocket className="h-6 w-6 text-white" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-extrabold">Claim Daily Prize</h3>
              <p className="text-xs text-indigo-100 font-medium">Unlock 10 bonus stars!</p>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
