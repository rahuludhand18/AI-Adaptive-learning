'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KidLayout from '@/components/layout/KidLayout';
import { apiRequest } from '@/lib/api';
import {
  Sun,
  FlaskConical,
  Palette,
  Calendar,
  Flame,
  BookOpen,
} from 'lucide-react';

// Backend shapes
interface Wallet { balance: number; streak_count: number; }
interface EarnedBadge { id: number; badge: { id: number; name: string }; earned_at: string; }

// Fixed display catalog; a badge shows as EARNED when its name matches one the child earned.
const BADGE_CATALOG: { name: string; accent: string; icon: React.ReactNode }[] = [
  { name: 'Early Bird', accent: 'amber', icon: <Sun className="h-7 w-7" /> },
  { name: 'Math Master', accent: 'indigo', icon: (
      <div className="grid grid-cols-2 gap-0.5 font-extrabold text-[10px]"><span>−</span><span>×</span><span>+</span><span>=</span></div>
    ) },
  { name: 'Story Explorer', accent: 'teal', icon: <BookOpen className="h-7 w-7" /> },
  { name: 'Science Star', accent: 'emerald', icon: <FlaskConical className="h-7 w-7" /> },
  { name: 'Artistic Owl', accent: 'pink', icon: <Palette className="h-7 w-7" /> },
  { name: 'Perfect Week', accent: 'blue', icon: <Calendar className="h-7 w-7" /> },
];

const STREAK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function KidRewardsPage() {
  const router = useRouter();

  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [earned, setEarned] = useState<Set<string>>(new Set());

  // load the child's real star wallet and earned badges
  useEffect(() => {
    (async () => {
      try {
        const [wallet, badges] = await Promise.all([
          apiRequest<Wallet>('/api/rewards/wallet/'),
          apiRequest<EarnedBadge[]>('/api/rewards/badges/'),
        ]);
        setStars(wallet.balance ?? 0);
        setStreak(wallet.streak_count ?? 0);
        setEarned(new Set(badges.map((b) => b.badge?.name?.toLowerCase()).filter(Boolean)));
      } catch {
        // leave defaults (0 stars, all locked) if the request fails
      }
    })();
  }, []);

  return (
    <KidLayout starsCount={stars}>
      <div className="space-y-10">
        {/* 1. Mascot & Welcome Hero Section */}
        <div className="flex flex-col items-center text-center space-y-5 pt-4">

          {/* Owl Mascot Card Frame */}
          <div className="w-36 h-36 bg-white dark:bg-slate-900 rounded-3xl p-3 shadow-md border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center space-y-1">
            <img src="/kid_owl_mascot.png" alt="Buddy" className="w-24 h-24 object-contain" />
            <span className="text-xs font-extrabold text-[#75C460]">Buddy</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-extrabold text-[#4F46E5] dark:text-indigo-400 tracking-tight">
            You&apos;re doing great!
          </h1>

          {/* Stars Pill Card (real balance) */}
          <div className="bg-white dark:bg-slate-900 rounded-full py-3.5 px-10 shadow-md border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <span className="text-2xl text-amber-400 font-extrabold">⭐</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{stars} Stars</span>
          </div>

          {/* Daily Streak Box (first `streak` days lit) */}
          <div className="bg-blue-50/60 dark:bg-slate-900/80 border border-blue-100 dark:border-slate-800 rounded-3xl p-4 w-full max-w-sm shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Daily Streak · {streak} days</span>
            <div className="flex items-center justify-around">
              {STREAK_DAYS.map((day, idx) => {
                const active = idx < streak;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1 relative">
                    <Flame className={`h-5 w-5 ${active ? 'text-orange-500 fill-orange-500' : 'text-slate-300 dark:text-slate-600'}`} />
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{day}</span>
                  </div>
                );
              })}
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

          {/* Grid of Badges (earned vs locked from real data) */}
          <div className="grid grid-cols-12 gap-6">
            {BADGE_CATALOG.map((b) => {
              const isEarned = earned.has(b.name.toLowerCase());
              const accentText: Record<string, string> = {
                amber: 'text-amber-500 dark:text-amber-400', indigo: 'text-indigo-600 dark:text-indigo-400',
                teal: 'text-teal-600 dark:text-teal-400', emerald: 'text-emerald-600 dark:text-emerald-400',
                pink: 'text-pink-600 dark:text-pink-400', blue: 'text-blue-600 dark:text-blue-400',
              };
              const accentBg: Record<string, string> = {
                amber: 'bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/40',
                indigo: 'bg-indigo-100 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/40',
                teal: 'bg-teal-100 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800/40',
                emerald: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/40',
                pink: 'bg-pink-100 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800/40',
                blue: 'bg-blue-100 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/40',
              };
              const accentBorderB: Record<string, string> = {
                amber: 'border-b-amber-400', indigo: 'border-b-indigo-600', teal: 'border-b-teal-500',
                emerald: 'border-b-emerald-500', pink: 'border-b-pink-500', blue: 'border-b-blue-500',
              };
              return (
                <div
                  key={b.name}
                  className={`col-span-12 md:col-span-4 rounded-[28px] border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs flex flex-col items-center justify-center text-center gap-3 ${
                    isEarned
                      ? `bg-white dark:bg-slate-900 border-b-4 ${accentBorderB[b.accent]}`
                      : 'bg-white/60 dark:bg-slate-900/40 opacity-40'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center border ${
                      isEarned ? `${accentBg[b.accent]} ${accentText[b.accent]}` : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {b.icon}
                  </div>
                  <div>
                    <h3 className={`text-xs font-extrabold ${isEarned ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>{b.name}</h3>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mt-0.5">
                      {isEarned ? 'EARNED' : 'LOCKED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </KidLayout>
  );
}
