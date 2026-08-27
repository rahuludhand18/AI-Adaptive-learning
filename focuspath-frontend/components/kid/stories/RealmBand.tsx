'use client';

import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';

interface RealmBandProps {
  worldNumber: number;
  realmName: string;
  realmDescription: string;
  themeColor: 'pink' | 'sky' | 'grass' | 'violet';
  totalStories: number;
  completedStories: number;
  children: React.ReactNode;
}

export default function RealmBand({
  worldNumber,
  realmName,
  realmDescription,
  themeColor,
  totalStories,
  completedStories,
  children,
}: RealmBandProps) {
  const percent = Math.round((completedStories / Math.max(1, totalStories)) * 100);

  const bandGradients = {
    pink: 'from-pink-100/70 via-rose-50/40 to-pink-50/60 dark:from-[#1d1021] dark:via-[#140b17] dark:to-[#0f172a] border-pink-300 dark:border-pink-900/60',
    sky: 'from-sky-100/70 via-blue-50/40 to-teal-50/60 dark:from-[#0f1b2b] dark:via-[#0b1320] dark:to-[#0f172a] border-sky-300 dark:border-sky-900/60',
    grass: 'from-emerald-100/70 via-teal-50/40 to-green-50/60 dark:from-[#0b1c16] dark:via-[#07130f] dark:to-[#0f172a] border-emerald-300 dark:border-emerald-900/60',
    violet: 'from-purple-100/70 via-indigo-50/40 to-violet-50/60 dark:from-[#18112b] dark:via-[#100b1e] dark:to-[#0f172a] border-purple-300 dark:border-purple-900/60',
  };

  const bannerBadges = {
    pink: 'bg-pink-500 text-white border-pink-300',
    sky: 'bg-sky-400 text-white border-sky-300',
    grass: 'bg-emerald-500 text-white border-emerald-300',
    violet: 'bg-purple-600 text-white border-purple-300',
  };

  const textAccents = {
    pink: 'text-pink-700 dark:text-pink-300',
    sky: 'text-sky-700 dark:text-sky-300',
    grass: 'text-emerald-700 dark:text-emerald-300',
    violet: 'text-purple-700 dark:text-purple-300',
  };

  const progressBounty = {
    pink: 'bg-pink-500',
    sky: 'bg-sky-400',
    grass: 'bg-emerald-500',
    violet: 'bg-purple-600',
  };

  return (
    <div className={`relative w-full rounded-[36px] border-4 bg-gradient-to-b ${bandGradients[themeColor]} backdrop-blur-md p-6 sm:p-8 shadow-sm space-y-8 overflow-hidden my-8 select-none`}>
      
      {/* Realm Header World Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-extrabold uppercase tracking-[0.2em] px-3.5 py-1 rounded-full border shadow-xs ${bannerBadges[themeColor]}`}>
              WORLD {worldNumber}
            </span>
            <span className={`text-xs font-extrabold flex items-center gap-1 ${textAccents[themeColor]}`}>
              <Sparkles className="w-3.5 h-3.5" /> {totalStories} Stories
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {realmName}
          </h2>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {realmDescription}
          </p>
        </div>

        {/* Realm Progress Bar */}
        <div className="space-y-1.5 w-full sm:w-48 shrink-0">
          <div className="flex items-center justify-between text-xs font-extrabold">
            <span className={textAccents[themeColor]}>Realm Progress</span>
            <span className="text-slate-900 dark:text-slate-100">{completedStories}/{totalStories}</span>
          </div>
          <div className="w-full h-3 bg-white/60 dark:bg-slate-800 rounded-full overflow-hidden border border-black/10 dark:border-slate-700">
            <div
              className={`h-full ${progressBounty[themeColor]} rounded-full transition-all duration-700 shadow-xs`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Children Trail Nodes */}
      <div className="relative z-10">{children}</div>

    </div>
  );
}
