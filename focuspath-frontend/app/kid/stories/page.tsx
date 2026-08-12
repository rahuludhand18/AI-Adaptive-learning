'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import KidLayout from '@/components/layout/KidLayout';
import {
  Zap,
  Award,
  Rocket,
  Lock,
  Play,
  CheckCircle2,
  Check
} from 'lucide-react';

export default function KidStoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F0F4FF] dark:bg-[#0b0f17]" />}>
      <KidStoriesContent />
    </Suspense>
  );
}

function KidStoriesContent() {
  const router = useRouter();
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

  const handleStartReadingQuest = () => {
    router.push('/kid/play');
  };

  const handleStartMathQuest = () => {
    alert('Starting Math Island Quest!');
  };

  return (
    <KidLayout starsCount={readingCompleted ? 125 : 120}>
      <div className="space-y-12">
        {/* 1. Hero Banner Header Section */}
        <div className="flex items-center justify-between pt-4">
          <div className="space-y-4 max-w-lg">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Hi Alex!
              </h1>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <span>Let's study</span>
                <span className="text-2xl">🎒</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
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
                stroke={readingCompleted ? '#10B981' : '#6366F1'}
                strokeWidth="4"
                strokeDasharray="8 8"
                strokeLinecap="round"
                opacity="0.8"
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
                  className={`w-36 h-36 rounded-full border-4 p-1.5 bg-white dark:bg-slate-900 shadow-xl overflow-hidden group-hover:scale-105 transition-all ${
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
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Reading Quest</h3>
                {readingCompleted ? (
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase flex items-center gap-1 justify-center">
                    <CheckCircle2 className="h-3 w-3" /> COMPLETED
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-[#046B5C] dark:text-teal-400 tracking-wider uppercase">
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
                  <div className="w-36 h-36 rounded-full border-4 border-indigo-600 p-1.5 bg-white dark:bg-slate-900 shadow-xl overflow-hidden group-hover:scale-105 transition-all">
                    <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
                      <circle cx="50" cy="50" r="50" fill="#EEF2FF" />
                      <circle cx="50" cy="50" r="32" fill="#4F46E5" />
                      <text x="50" y="56" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#FFFFFF">+ − × =</text>
                    </svg>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-slate-300/80 dark:border-slate-700 p-1.5 bg-slate-100 dark:bg-slate-800 shadow-2xs overflow-hidden opacity-70 flex items-center justify-center">
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
                  <div className="absolute inset-0 rounded-full bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center">
                    <Lock className="h-7 w-7 text-white" />
                  </div>
                )}
              </div>

              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Math Island</h3>
                {readingCompleted ? (
                  <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
                    READY TO PLAY
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                    LOCKED
                  </span>
                )}
              </div>
            </div>

            {/* Node 3: Science Lab (Bottom Right) */}
            <div className="flex flex-col items-center text-center space-y-3 pt-16">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-slate-300/80 dark:border-slate-700 p-1.5 bg-slate-100 dark:bg-slate-800 shadow-2xs overflow-hidden opacity-70 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
                    <circle cx="50" cy="50" r="50" fill="#E2E8F0" />
                    <polygon points="50,20 75,75 25,75" fill="#94A3B8" />
                  </svg>
                </div>

                {/* Lock Overlay */}
                <div className="absolute inset-0 rounded-full bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center">
                  <Lock className="h-7 w-7 text-white" />
                </div>
              </div>

              <div className="space-y-0.5">
                <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-200">Science Lab</h3>
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  LOCKED
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* 3. Bottom 3 Bento Cards */}
        <div className="grid grid-cols-12 gap-6 pt-4">
          
          {/* Card 1: Today's Goal (Col 4) */}
          <div className="col-span-12 md:col-span-4 bg-white dark:bg-slate-900 border-2 border-teal-200/90 dark:border-teal-800/60 rounded-[28px] p-6 shadow-2xs space-y-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="text-teal-600 dark:text-teal-400">
                <Zap className="h-6 w-6 fill-teal-600/20" />
              </div>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">Today's Goal</span>
            </div>

            <div className="space-y-2">
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#046B5C] rounded-full transition-all duration-500"
                  style={{ width: readingCompleted ? '85%' : '65%' }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {readingCompleted ? 'Awesome! 85% Complete!' : 'Almost there! 15m more.'}
              </p>
            </div>
          </div>

          {/* Card 2: Streaks (Col 4) */}
          <div className="col-span-12 md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[28px] p-6 shadow-2xs space-y-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="text-indigo-600 dark:text-indigo-400">
                <Award className="h-6 w-6" />
              </div>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">Streaks</span>
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
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
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

      </div>
    </KidLayout>
  );
}
