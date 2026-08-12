'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import KidLayout from '@/components/layout/KidLayout';
import {
  Sun,
  FlaskConical,
  Palette,
  Calendar,
  Flame,
  BookOpen
} from 'lucide-react';

export default function KidRewardsPage() {
  const router = useRouter();

  return (
    <KidLayout starsCount={125}>
      <div className="space-y-10">
        {/* 1. Mascot & Welcome Hero Section */}
        <div className="flex flex-col items-center text-center space-y-5 pt-4">
          
          {/* Owl Mascot Card Frame */}
          <div className="w-36 h-36 bg-white dark:bg-slate-900 rounded-3xl p-3 shadow-md border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center space-y-1">
            <img
              src="/kid_owl_mascot.png"
              alt="Buddy"
              className="w-24 h-24 object-contain"
            />
            <span className="text-xs font-extrabold text-[#75C460]">Buddy</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-extrabold text-[#4F46E5] dark:text-indigo-400 tracking-tight">
            You're doing great!
          </h1>

          {/* 125 Stars Pill Card */}
          <div className="bg-white dark:bg-slate-900 rounded-full py-3.5 px-10 shadow-md border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <span className="text-2xl text-amber-400 font-extrabold">⭐</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">125 Stars</span>
          </div>

          {/* Daily Streak Box */}
          <div className="bg-blue-50/60 dark:bg-slate-900/80 border border-blue-100 dark:border-slate-800 rounded-3xl p-4 w-full max-w-sm shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Daily Streak</span>
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
                      d.active ? 'text-orange-500 fill-orange-500' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 2. Your Badges Section */}
        <div className="space-y-6 pt-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Your Badges</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Keep learning to unlock them all!</p>
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
            <div className="col-span-12 md:col-span-4 rounded-[28px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs flex flex-col items-center justify-center text-center gap-3 border-b-4 border-b-amber-400">
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/40">
                <Sun className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Early Bird</h3>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-0.5">
                  EARNED
                </span>
              </div>
            </div>

            {/* Badge 2: Math Master (Earned) */}
            <div className="col-span-12 md:col-span-4 rounded-[28px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs flex flex-col items-center justify-center text-center gap-3 border-b-4 border-b-indigo-600">
              <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/40">
                <div className="grid grid-cols-2 gap-0.5 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px]">
                  <span>−</span><span>×</span>
                  <span>+</span><span>=</span>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Math Master</h3>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-0.5">
                  EARNED
                </span>
              </div>
            </div>

            {/* Badge 3: Story Explorer (Earned) */}
            <div className="col-span-12 md:col-span-4 rounded-[28px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xs flex flex-col items-center justify-center text-center gap-3 border-b-4 border-b-teal-500">
              <div className="w-14 h-14 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800/40">
                <BookOpen className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Story Explorer</h3>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-0.5">
                  EARNED
                </span>
              </div>
            </div>

            {/* Badge 4: Science Star (Locked) */}
            <div className="col-span-12 md:col-span-4 rounded-[28px] border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-6 shadow-2xs flex flex-col items-center justify-center text-center gap-3 opacity-40">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <FlaskConical className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Science Star</h3>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-0.5">
                  LOCKED
                </span>
              </div>
            </div>

            {/* Badge 5: Artistic Owl (Locked) */}
            <div className="col-span-12 md:col-span-4 rounded-[28px] border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-6 shadow-2xs flex flex-col items-center justify-center text-center gap-3 opacity-40">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <Palette className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Artistic Owl</h3>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-0.5">
                  LOCKED
                </span>
              </div>
            </div>

            {/* Badge 6: Perfect Week (Locked) */}
            <div className="col-span-12 md:col-span-4 rounded-[28px] border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-6 shadow-2xs flex flex-col items-center justify-center text-center gap-3 opacity-40">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <Calendar className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Perfect Week</h3>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-0.5">
                  LOCKED
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </KidLayout>
  );
}
