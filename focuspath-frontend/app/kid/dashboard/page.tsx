'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import KidLayout from '@/components/layout/KidLayout';
import {
  Rocket,
  Target,
  Flame,
  BookOpen,
  Palette,
  Puzzle,
  Lock,
  ArrowRight,
  HelpCircle,
  Clock,
  Star,
  Sparkles,
  Calculator,
  ChevronRight
} from 'lucide-react';

export default function KidDashboardPage() {
  const router = useRouter();

  const shopItems = [
    {
      id: 1,
      name: 'Space Suit',
      stars: 300,
      image: '/rewards/space_suit.png',
      ready: false,
      iconSvg: (
        <svg viewBox="0 0 100 100" className="w-20 h-20 mx-auto">
          <circle cx="50" cy="50" r="45" fill="#f1f5f9" />
          {/* Space Helmet */}
          <circle cx="50" cy="38" r="22" fill="#cbd5e1" />
          <ellipse cx="50" cy="38" rx="16" ry="12" fill="#38bdf8" opacity="0.8" />
          {/* Suit body */}
          <path d="M 28 65 C 28 50, 72 50, 72 65 L 68 90 L 32 90 Z" fill="#94a3b8" />
          <circle cx="50" cy="62" r="5" fill="#f59e0b" />
        </svg>
      ),
    },
    {
      id: 2,
      name: 'Royal Crown',
      stars: 200,
      ready: true,
      iconSvg: (
        <svg viewBox="0 0 100 100" className="w-20 h-20 mx-auto">
          <circle cx="50" cy="50" r="45" fill="#fef3c7" />
          {/* Crown */}
          <path d="M 22 65 L 18 35 L 35 48 L 50 25 L 65 48 L 82 35 L 78 65 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
          <circle cx="18" cy="33" r="4" fill="#ef4444" />
          <circle cx="50" cy="23" r="5" fill="#3b82f6" />
          <circle cx="82" cy="33" r="4" fill="#10b981" />
          <rect x="24" y="65" width="52" height="8" rx="2" fill="#d97706" />
        </svg>
      ),
    },
    {
      id: 3,
      name: 'Robo-Buddy',
      stars: 500,
      ready: false,
      iconSvg: (
        <svg viewBox="0 0 100 100" className="w-20 h-20 mx-auto">
          <circle cx="50" cy="50" r="45" fill="#e2e8f0" />
          {/* Robot Head */}
          <rect x="30" y="25" width="40" height="30" rx="8" fill="#64748b" />
          <circle cx="40" cy="38" r="4" fill="#38bdf8" />
          <circle cx="60" cy="38" r="4" fill="#38bdf8" />
          <rect x="42" y="48" width="16" height="3" fill="#cbd5e1" />
          {/* Body */}
          <rect x="28" y="60" width="44" height="32" rx="10" fill="#475569" />
          <circle cx="50" cy="74" r="7" fill="#ef4444" />
        </svg>
      ),
    },
    {
      id: 4,
      name: 'Magic Potion',
      stars: 150,
      ready: false,
      iconSvg: (
        <svg viewBox="0 0 100 100" className="w-20 h-20 mx-auto">
          <circle cx="50" cy="50" r="45" fill="#f3e8ff" />
          {/* Potion Bottle */}
          <path d="M 42 25 L 58 25 L 58 35 L 72 70 C 75 78, 68 85, 50 85 C 32 85, 25 78, 28 70 L 42 35 Z" fill="#c084fc" opacity="0.7" stroke="#7e22ce" strokeWidth="2" />
          <rect x="40" y="20" width="20" height="6" rx="2" fill="#a16207" />
          {/* Bubbles */}
          <circle cx="48" cy="60" r="3" fill="#ffffff" />
          <circle cx="56" cy="68" r="2" fill="#ffffff" />
        </svg>
      ),
    },
  ];

  return (
    <KidLayout starsCount={250}>
      <div className="space-y-8">
        
        {/* 1. Hero Banner Card */}
        <div className="relative bg-gradient-to-r from-teal-200 via-cyan-100 to-sky-200 rounded-[36px] p-8 shadow-sm overflow-hidden flex items-center justify-between">
          
          {/* Left Side Content */}
          <div className="flex items-center gap-6 z-10">
            
            {/* Mascot Scene Preview Frame */}
            <div className="w-36 h-28 rounded-2xl bg-white/90 border-2 border-white/80 p-2 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 100 80" className="w-full h-full">
                <rect width="100" height="80" fill="#a7f3d0" rx="8" />
                <circle cx="20" cy="20" r="10" fill="#fef08a" />
                {/* Hills */}
                <circle cx="10" cy="75" r="35" fill="#059669" opacity="0.3" />
                <circle cx="80" cy="70" r="30" fill="#047857" opacity="0.3" />
                {/* Owl Mascot */}
                <ellipse cx="50" cy="45" rx="18" ry="20" fill="#fb923c" />
                <ellipse cx="50" cy="45" rx="12" ry="14" fill="#ffffff" />
                <circle cx="44" cy="38" r="4" fill="#1e293b" />
                <circle cx="56" cy="38" r="4" fill="#1e293b" />
                <polygon points="48,43 52,43 50,47" fill="#ea580c" />
              </svg>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Great job today!
                </h1>
                <p className="text-base font-bold text-slate-700">
                  Ready for your next quest?
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/kid/stories')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3 px-6 rounded-full shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
                >
                  <span>Let's Go!</span>
                  <Rocket className="h-4 w-4" />
                </button>

                {/* opens the curated, parent-approved video lessons */}
                <button
                  onClick={() => router.push('/kid/learn')}
                  className="bg-white text-indigo-600 border border-indigo-200 hover:border-indigo-400 font-extrabold text-xs py-3 px-6 rounded-full shadow-2xs flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
                >
                  <span>Learn</span>
                  <BookOpen className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Decorative Clouds & Stars Graphic on Right */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
            <svg viewBox="0 0 120 120" className="w-48 h-48">
              <path
                d="M 20 60 C 20 40, 40 30, 60 40 C 70 20, 100 30, 100 50 C 115 50, 115 75, 95 80 L 25 80 C 10 80, 10 60, 20 60 Z"
                fill="#ffffff"
              />
              <polygon points="90,20 93,28 100,28 95,33 97,40 90,35 83,40 85,33 80,28 87,28" fill="#38bdf8" />
            </svg>
          </div>

        </div>

        {/* 2. Daily Stats Row (Daily Goal & Current Streak) */}
        <div className="grid grid-cols-12 gap-5">
          
          {/* Daily Goal Card (Col 6) */}
          <div className="col-span-12 md:col-span-6 bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-2xs flex items-center justify-between">
            <div className="space-y-3 flex-1 pr-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-slate-900">Daily Goal</span>
                <span className="text-xs font-extrabold text-indigo-600">80%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[80%]" />
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Target className="h-6 w-6" />
            </div>
          </div>

          {/* Current Streak Card (Col 6) */}
          <div className="col-span-12 md:col-span-6 bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-2xs flex items-center justify-between">
            <div className="space-y-3 flex-1 pr-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-slate-900">Current Streak</span>
                <span className="text-xs font-extrabold text-rose-600">5 Days</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full w-[70%]" />
              </div>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <Flame className="h-6 w-6" />
            </div>
          </div>

        </div>

        {/* 3. Choose Your Adventure Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Choose Your Adventure
          </h2>

          <div className="grid grid-cols-12 gap-5">
            
            {/* Card 1: Math Quest: Space Division (Col 6) */}
            <div
              onClick={() => router.push('/kid/stories')}
              className="col-span-12 lg:col-span-6 bg-[#6E4207] text-white rounded-[32px] p-6 shadow-sm space-y-4 cursor-pointer hover:scale-[1.01] transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-2xl bg-amber-800/60 border border-amber-600/40 flex items-center justify-center shrink-0">
                  <div className="grid grid-cols-2 gap-1 text-amber-200 font-bold text-xs">
                    <span>−</span><span>×</span>
                    <span>+</span><span>=</span>
                  </div>
                </div>
                <span className="bg-amber-800/80 text-amber-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  LEVEL 3 QUEST
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold tracking-tight">Math Quest: Space Division</h3>
                <p className="text-xs text-amber-100/90 font-medium leading-relaxed">
                  Help the astronauts divide the star-crystals to power their rocket! 🚀
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2 text-xs font-bold text-amber-200">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>+50 Stars</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>15 Mins</span>
                </div>
              </div>
            </div>

            {/* Card 2: Reading Journey (Col 6) */}
            <div
              onClick={() => router.push('/kid/stories')}
              className="col-span-12 lg:col-span-6 bg-teal-200 text-slate-900 rounded-[32px] p-6 shadow-sm relative flex flex-col justify-between cursor-pointer hover:scale-[1.01] transition-all"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-300/80 flex items-center justify-center shrink-0">
                  <BookOpen className="h-6 w-6 text-teal-900" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
                    Reading Journey
                  </h3>
                  <p className="text-xs font-semibold text-slate-700">
                    The Secret Library of Elves
                  </p>
                </div>
              </div>

              <div className="pt-6 space-y-2">
                <div className="w-full h-2 bg-teal-300/70 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-800 rounded-full w-[60%]" />
                </div>
              </div>

              {/* Red Floating Help Button Badge */}
              <div className="absolute right-6 bottom-6 w-10 h-10 rounded-full bg-rose-600 text-white font-extrabold text-base flex items-center justify-center shadow-md">
                ?
              </div>
            </div>

            {/* Card 3: Creative Art (Col 5) */}
            <div className="col-span-12 lg:col-span-5 bg-indigo-600 text-white rounded-[32px] p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Palette className="h-6 w-6 text-white" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-extrabold">Creative Art</h3>
                <p className="text-xs text-indigo-100 font-medium">Draw your own Planet!</p>
              </div>

              <div className="bg-white/20 backdrop-blur-xs text-white text-xs font-bold py-2 px-4 rounded-full w-fit flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                <span>Unlock in 2h</span>
              </div>
            </div>

            {/* Card 4: Daily Brain Puzzle (Col 7) */}
            <div
              onClick={() => router.push('/kid/stories')}
              className="col-span-12 lg:col-span-7 bg-blue-100 text-slate-900 rounded-[32px] p-6 shadow-sm flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-200 text-blue-800 flex items-center justify-center shrink-0">
                  <Puzzle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900">Daily Brain Puzzle</h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Warm up your mind with a quick logic game!
                  </p>
                </div>
              </div>

              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>

          </div>
        </div>

        {/* 4. Reward Shop Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Reward Shop
              </h2>
              <p className="text-xs text-slate-400 font-semibold">
                You're almost there! Only 50 stars left for the next pack.
              </p>
            </div>

            <button
              onClick={() => router.push('/kid/rewards')}
              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>See All</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Grid of 4 Shop Items */}
          <div className="grid grid-cols-12 gap-5">
            {shopItems.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push('/kid/rewards')}
                className="col-span-6 md:col-span-3 bg-white border border-slate-200/80 rounded-[28px] p-5 text-center shadow-2xs space-y-3 relative hover:border-indigo-200 transition-all cursor-pointer"
              >
                {item.ready && (
                  <span className="absolute top-3 right-3 bg-teal-100 text-teal-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-teal-200">
                    READY!
                  </span>
                )}

                {item.iconSvg}

                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-900">{item.name}</h4>
                  <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-500">
                    <span className="text-amber-500 font-extrabold">★</span>
                    <span>{item.stars}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </KidLayout>
  );
}
