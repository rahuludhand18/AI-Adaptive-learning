'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KidLayout from '@/components/layout/KidLayout';
import KidPageBackground from '@/components/kid/KidPageBackground';
import { apiRequest } from '@/lib/api';
import {
  Sun,
  FlaskConical,
  Palette,
  Calendar,
  Flame,
  BookOpen,
  Trophy,
  Sparkles,
  Lock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface Wallet { balance: number; streak_count: number; }
interface EarnedBadge { id: number; badge: { id: number; name: string }; earned_at: string; }

const BADGE_CATALOG: { name: string; hint: string; accent: string; icon: React.ReactNode }[] = [
  { name: 'Early Bird', hint: 'Complete a morning study block before 9 AM', accent: 'amber', icon: <Sun className="h-7 w-7" /> },
  { name: 'Math Master', hint: 'Complete 3 Math Quests or Puzzles', accent: 'indigo', icon: (
      <div className="grid grid-cols-2 gap-0.5 font-black text-[10px]"><span>−</span><span>×</span><span>+</span><span>=</span></div>
    ) },
  { name: 'Story Explorer', hint: 'Finish a complete Story Quest chapter', accent: 'teal', icon: <BookOpen className="h-7 w-7" /> },
  { name: 'Science Star', hint: 'Watch 2 verified Science video lessons', accent: 'emerald', icon: <FlaskConical className="h-7 w-7" /> },
  { name: 'Artistic Owl', hint: 'Complete the Creative Art & Draw quest', accent: 'pink', icon: <Palette className="h-7 w-7" /> },
  { name: 'Perfect Week', hint: 'Maintain a 7-day consecutive study streak', accent: 'blue', icon: <Calendar className="h-7 w-7" /> },
];

const STREAK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function KidRewardsPage() {
  const router = useRouter();

  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [earned, setEarned] = useState<Set<string>>(new Set());
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

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
        // leave defaults if request fails
      }
    })();
  }, []);

  return (
    <KidLayout starsCount={stars}>
      {/* BACKGROUND LAYER */}
      <KidPageBackground theme="sun" />

      {/* PAGE CONTENT */}
      <div className="relative z-10 space-y-10">

        {/* 1. Mascot & Welcome Hero Section */}
        <div className="flex flex-col items-center text-center space-y-5 pt-4">

          {/* Owl Mascot Card Frame */}
          <div className="w-36 h-36 bg-gradient-to-br from-amber-200/40 via-yellow-100/30 to-orange-200/40 dark:from-slate-900 dark:to-slate-900 rounded-[36px] p-3 shadow-md border-4 border-amber-300 dark:border-amber-800 flex flex-col items-center justify-center space-y-1 animate-kid-bob relative">
            <span className="text-6xl select-none">🦉</span>
            <span className="text-[10px] font-extrabold text-amber-950 dark:text-amber-200 bg-amber-300 dark:bg-amber-950 px-3 py-0.5 rounded-full border border-amber-400">Buddy The Owl</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-amber-300 dark:border-amber-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Trophy Room & Vault</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Star Vault & Badges 🏆
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 font-bold">
              You&apos;re doing great! Keep learning to collect every badge!
            </p>
          </div>

          {/* Stars Pill Card (Treasure Vault Balance) */}
          <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-full py-4 px-12 shadow-xl shadow-amber-400/30 border-4 border-white dark:border-amber-300 flex items-center gap-3 animate-kid-bounce-subtle cursor-pointer hover:scale-105 transition-all">
            <Trophy className="h-8 w-8 text-amber-950 fill-amber-950 animate-kid-wiggle" />
            <span className="text-3xl font-extrabold text-amber-950 tracking-tight animate-kid-count-up">{stars} Stars</span>
          </div>

          {/* Daily Streak Box */}
          <div className="bg-gradient-to-br from-orange-50/90 via-amber-50/60 to-orange-100/70 dark:from-[#0f172a] dark:to-[#131b2a] backdrop-blur-md border-2 border-orange-300 dark:border-orange-800/80 rounded-[32px] p-5 w-full max-w-md shadow-sm space-y-3">
            <span className="text-xs font-extrabold text-orange-900 dark:text-orange-300 block">Daily Streak Tracker · {streak} Days Active 🔥</span>
            <div className="flex items-center justify-around">
              {STREAK_DAYS.map((day, idx) => {
                const active = idx < streak;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1 relative">
                    <Flame className={`h-6 w-6 transition-all ${active ? 'text-orange-500 fill-orange-500 animate-kid-pulse-glow scale-110' : 'text-slate-300 dark:text-slate-600'}`} />
                    <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400">{day}</span>
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
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Your Trophy Hall</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-bold">Earned achievements stay unlocked forever!</p>
            </div>

            <button
              onClick={() => router.push('/kid/dashboard')}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs py-2.5 px-6 rounded-full shadow-md shadow-orange-500/20 cursor-pointer transition-all hover:scale-105 active:scale-95 border-2 border-orange-300 flex items-center gap-1.5"
            >
              <span>Shop Vault</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Grid of Badges */}
          <div className="grid grid-cols-12 gap-5">
            {BADGE_CATALOG.map((b) => {
              const isEarned = earned.has(b.name.toLowerCase());
              const accentText: Record<string, string> = {
                amber: 'text-amber-600 dark:text-amber-400', indigo: 'text-sky-600 dark:text-sky-400',
                teal: 'text-emerald-600 dark:text-emerald-400', emerald: 'text-emerald-600 dark:text-emerald-400',
                pink: 'text-pink-600 dark:text-pink-400', blue: 'text-sky-600 dark:text-sky-400',
              };
              const accentBg: Record<string, string> = {
                amber: 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800',
                indigo: 'bg-sky-100 dark:bg-sky-950/80 border-sky-300 dark:border-sky-800',
                teal: 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800',
                emerald: 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800',
                pink: 'bg-pink-100 dark:bg-pink-950/80 border-pink-300 dark:border-pink-800',
                blue: 'bg-sky-100 dark:bg-sky-950/80 border-sky-300 dark:border-sky-800',
              };
              const accentBorderB: Record<string, string> = {
                amber: 'border-b-amber-500', indigo: 'border-b-sky-500', teal: 'border-b-emerald-500',
                emerald: 'border-b-emerald-500', pink: 'border-b-pink-500', blue: 'border-b-sky-500',
              };
              return (
                <div
                  key={b.name}
                  onMouseEnter={() => setHoveredBadge(b.name)}
                  onMouseLeave={() => setHoveredBadge(null)}
                  className={`col-span-12 md:col-span-4 rounded-[28px] border-2 p-6 shadow-sm flex flex-col items-center justify-between text-center gap-3 transition-all relative overflow-hidden ${
                    isEarned
                      ? `bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 border-b-4 ${accentBorderB[b.accent]} hover:scale-105 shadow-md animate-kid-shine`
                      : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60 grayscale'
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                      isEarned ? `${accentBg[b.accent]} ${accentText[b.accent]} shadow-md animate-kid-bob` : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {b.icon}
                  </div>

                  <div className="space-y-1">
                    <h3 className={`text-sm font-extrabold ${isEarned ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>{b.name}</h3>
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 px-3 py-0.5 rounded-full ${
                      isEarned ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300'
                    }`}>
                      {isEarned ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>EARNED</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>LOCKED</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Helper Text for Locked Badges */}
                  {!isEarned && (
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight pt-1">
                      Earn by: {b.hint}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </KidLayout>
  );
}
