'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KidLayout from '@/components/layout/KidLayout';
import DashboardBackground from '@/components/kid/dashboard/DashboardBackground';
import PrizeBoxCard from '@/components/kid/dashboard/PrizeBoxCard';
import TreasureJarProgress from '@/components/kid/dashboard/TreasureJarProgress';
import SafeLink from '@/components/kid/SafeLink';
import { apiRequest } from '@/lib/api';
import {
  BookOpen,
  Rocket,
  Target,
  Flame,
  Trophy,
  Star,
  Clock,
  ChevronRight,
  ShieldCheck,
  Calculator,
  Atom,
  Palette,
  Play,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  Lock,
  Gift
} from 'lucide-react';

export default function KidDashboardPage() {
  const router = useRouter();

  // Time of Day Prop Logic for Buddy Mascot
  const currentHour = new Date().getHours();
  const timeProp = currentHour >= 6 && currentHour < 18 ? '☀️' : '🌙';
  const timeGreeting = currentHour >= 6 && currentHour < 12 ? 'Good Morning' : currentHour >= 12 && currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  // Gamification & Interactive State
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [dailyGoalPercent, setDailyGoalPercent] = useState(80);
  const [claimedDailyPrize, setClaimedDailyPrize] = useState(false);
  const [puzzleAnswered, setPuzzleAnswered] = useState<number | null>(null);

  // Shop Showcase Items
  const shopItems = [
    {
      id: 1,
      name: 'Royal Crown',
      stars: 200,
      ready: true,
      iconSvg: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto drop-shadow-sm">
          <circle cx="50" cy="50" r="45" fill="#fef3c7" />
          <path d="M 22 65 L 18 35 L 35 48 L 50 25 L 65 48 L 82 35 L 78 65 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
          <circle cx="18" cy="33" r="4" fill="#ef4444" />
          <circle cx="50" cy="23" r="5" fill="#3b82f6" />
          <circle cx="82" cy="33" r="4" fill="#10b981" />
          <rect x="24" y="65" width="52" height="8" rx="2" fill="#d97706" />
        </svg>
      ),
    },
    {
      id: 2,
      name: 'Space Suit',
      stars: 300,
      ready: false,
      iconSvg: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto drop-shadow-sm">
          <circle cx="50" cy="50" r="45" fill="#f1f5f9" />
          <circle cx="50" cy="38" r="22" fill="#cbd5e1" />
          <ellipse cx="50" cy="38" rx="16" ry="12" fill="#38bdf8" opacity="0.8" />
          <path d="M 28 65 C 28 50, 72 50, 72 65 L 68 90 L 32 90 Z" fill="#94a3b8" />
          <circle cx="50" cy="62" r="5" fill="#f59e0b" />
        </svg>
      ),
    },
    {
      id: 3,
      name: 'Magic Potion',
      stars: 150,
      ready: true,
      iconSvg: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto drop-shadow-sm">
          <circle cx="50" cy="50" r="45" fill="#f3e8ff" />
          <path d="M 42 25 L 58 25 L 58 35 L 72 70 C 75 78, 68 85, 50 85 C 32 85, 25 78, 28 70 L 42 35 Z" fill="#c084fc" opacity="0.7" stroke="#7e22ce" strokeWidth="2" />
          <rect x="40" y="20" width="20" height="6" rx="2" fill="#a16207" />
          <circle cx="48" cy="60" r="3" fill="#ffffff" />
          <circle cx="56" cy="68" r="2" fill="#ffffff" />
        </svg>
      ),
    },
    {
      id: 4,
      name: 'Robo-Buddy',
      stars: 500,
      ready: false,
      iconSvg: (
        <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto drop-shadow-sm">
          <circle cx="50" cy="50" r="45" fill="#e2e8f0" />
          <rect x="30" y="25" width="40" height="30" rx="8" fill="#64748b" />
          <circle cx="40" cy="38" r="4" fill="#38bdf8" />
          <circle cx="60" cy="38" r="4" fill="#38bdf8" />
          <rect x="42" y="48" width="16" height="3" fill="#cbd5e1" />
          <rect x="28" y="60" width="44" height="32" rx="10" fill="#475569" />
          <circle cx="50" cy="74" r="7" fill="#ef4444" />
        </svg>
      ),
    },
  ];

  const [networkError, setNetworkError] = useState(false);

  // load real star balance + streak on mount
  useEffect(() => {
    apiRequest<{ balance: number; streak_count: number }>('/api/rewards/wallet/')
      .then((w) => {
        setStars(w.balance ?? 0);
        setStreak(w.streak_count ?? 0);
      })
      .catch((err) => {
        if (err.status === 0) setNetworkError(true);
      });
  }, []);

  // Daily Puzzle Handler
  const handleAnswerPuzzle = (optionId: number, isCorrect: boolean) => {
    if (puzzleAnswered !== null) return;
    setPuzzleAnswered(optionId);
    if (isCorrect) {
      setStars((prev) => prev + 10);
      apiRequest<{ balance: number }>('/api/rewards/award/', {
        method: 'POST',
        body: JSON.stringify({ amount: 10, badge: 'Math Master' }),
      })
        .then((res) => setStars(res.balance))
        .catch(() => {});
    }
  };

  // Claim Daily Prize Handler
  const handleClaimDailyPrize = () => {
    if (claimedDailyPrize) return;
    setClaimedDailyPrize(true);
    setStars((prev) => prev + 15);
    apiRequest<{ balance: number }>('/api/rewards/award/', {
      method: 'POST',
      body: JSON.stringify({ amount: 15 }),
    })
      .then((res) => setStars(res.balance))
      .catch(() => {});
  };

  if (networkError) {
    return (
      <KidLayout starsCount={stars}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] relative z-10 m-6">
          <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-8 max-w-2xl w-full shadow-lg flex flex-col items-center text-center">
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-red-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Backend Connection Failed
              </h2>
            </div>
            
            <div className="font-mono text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full mb-6">
              Error Code: ERR_CONNECTION_REFUSED (Status 0)
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">
              Your Next.js frontend is running, but it cannot communicate with the Django backend. The server is either offline or encountering a fatal error.
            </p>

            <div className="w-full bg-slate-900 text-slate-300 p-5 rounded-xl text-sm font-mono mt-4 text-left space-y-2">
              <div className="text-slate-400 border-b border-slate-700 pb-2 mb-2 font-bold uppercase text-[10px] tracking-wider">
                Developer Troubleshooting Steps
              </div>
              <div>1. Check your Django terminal for a Python Traceback.</div>
              <div>2. Resolve any database lock or syntax errors causing the crash.</div>
              <div>3. Restart the server: <span className="text-emerald-400">python manage.py runserver</span></div>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold px-6 py-2 rounded-xl mt-6 transition-colors shadow-sm cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </KidLayout>
    );
  }

  return (
    <KidLayout starsCount={stars}>
      {/* LAYER 1: BACKGROUND (Page Canvas Gradient & Drifting Blobs) */}
      <DashboardBackground />

      {/* PAGE CANVAS CONTENT */}
      <div className="relative z-10 space-y-6 select-none">

        {/* ROW 1: Hero Card (Kid's Treasure-Map Command Center) */}
        <div className="rounded-[36px] border-4 border-orange-300 dark:border-slate-800 bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 text-white p-6 md:p-8 shadow-xl relative overflow-hidden">
          {/* Drifting Background Cloud Shapes */}
          <svg className="absolute -right-10 -top-10 w-72 h-72 opacity-20 pointer-events-none fill-white" viewBox="0 0 200 200">
            <path d="M45,-63C58.3,-54.3,69,-41.3,74.4,-26.4C79.8,-11.5,79.9,5.3,74.9,20.4C69.9,35.5,59.8,48.9,46.8,58.4C33.8,67.9,16.9,73.5,0.4,72.9C-16.1,72.3,-32.2,65.5,-45.3,55.5C-58.4,45.5,-68.5,32.3,-73.4,17.2C-78.3,2.1,-78,-14.9,-71.4,-29.4C-64.8,-43.9,-51.9,-55.9,-37.8,-64.1C-23.7,-72.3,-8.4,-76.7,5.5,-84.3C19.4,-91.9,31.7,-71.7,45,-63Z" transform="translate(100 100)" />
          </svg>

          {/* Soft Inner Vignette Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-orange-600/30 via-transparent to-black/10 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">

            {/* Left Side: Mascot Frame & Time-of-Day Greetings */}
            <div className="flex items-center gap-5">
              {/* Larger Buddy Owl Mascot with Time-of-Day Prop */}
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-white/20 backdrop-blur-md border-4 border-white/40 p-2 shadow-xl shrink-0 flex items-center justify-center overflow-hidden animate-kid-bob relative">
                <span className="text-6xl select-none">🦉</span>
                <span className="absolute top-1 right-1 text-xl animate-kid-wiggle">{timeProp}</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-100">
                  <span className="bg-white/25 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/30 shadow-xs">
                    Mission Command Center
                  </span>
                  <span>&bull;</span>
                  <span className="text-white font-extrabold flex items-center gap-1">
                    <span>{timeProp}</span> {timeGreeting}!
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Welcome back, Explorer! 👋
                </h1>
                <p className="text-xs md:text-sm font-extrabold text-amber-50 max-w-xl leading-relaxed">
                  You&apos;ve completed {dailyGoalPercent}% of your daily learning goal. Choose your next quest to unlock new rewards!
                </p>
              </div>
            </div>

            {/* Right Side: Circular Level Badge & Action Pills */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Circular Level Ring Progress */}
              <TreasureJarProgress level={3} currentStars={stars} nextLevelStars={50} />

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => router.push('/kid/learn')}
                  className="bg-white text-orange-600 hover:bg-amber-50 font-extrabold text-xs py-3 px-5 rounded-full shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 group border-2 border-white"
                >
                  <BookOpen className="h-4 w-4 text-orange-500 group-hover:animate-kid-wiggle" />
                  <span>Start Learning</span>
                </button>

                <button
                  onClick={() => router.push('/kid/stories')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs py-3 px-5 rounded-full shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 group border-2 border-purple-400"
                >
                  <Rocket className="h-4 w-4 text-white group-hover:animate-kid-wiggle" />
                  <span>Story Quests</span>
                </button>

                {/* 100% Safe Reassuring Shield Badge */}
                <div className="bg-emerald-500 text-white border-2 border-emerald-300 text-xs font-extrabold py-2.5 px-3.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-white animate-pulse" />
                  <span>100% Safe ✓</span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ROW 2: Gamification Metrics (3 Tinted Cards) */}
        <div className="grid grid-cols-12 gap-5">

          {/* Metric Card 1: Daily Progress (Kid Sky Theme Tint + Rocket Motif) */}
          <div className="col-span-12 md:col-span-4 rounded-[32px] border-2 border-sky-300 dark:border-sky-800/80 bg-gradient-to-br from-sky-50/90 via-sky-100/40 to-white dark:from-[#0f172a] dark:to-[#131b2a] p-6 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">
                Daily Progress
              </span>
              <div className="w-11 h-11 rounded-2xl bg-sky-400 text-white flex items-center justify-center shrink-0 shadow-md animate-kid-bob">
                <Target className="h-6 w-6" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">24 / 30 mins</span>
                <span className="text-xs font-extrabold text-sky-600 dark:text-sky-400 animate-kid-count-up">{dailyGoalPercent}% Done</span>
              </div>

              <div className="w-full h-3.5 bg-sky-100 dark:bg-slate-800 rounded-full overflow-hidden border border-sky-200 dark:border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${dailyGoalPercent}%` }}
                />
              </div>
            </div>

            <p className="text-xs font-extrabold text-sky-700 dark:text-sky-300">
              {dailyGoalPercent >= 100 ? "Today's goal complete — great job! 🎉" : "Keep going to complete today's goal!"}
            </p>
          </div>

          {/* Metric Card 2: Focus Streak & Flickering Flame (Kid Coral Theme Tint) */}
          <div className="col-span-12 md:col-span-4 rounded-[32px] border-2 border-rose-300 dark:border-rose-800/80 bg-gradient-to-br from-rose-50/90 via-orange-50/40 to-white dark:from-[#0f172a] dark:to-[#131b2a] p-6 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
                Consistency Streak
              </span>
              <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md animate-kid-pulse-glow">
                <Flame className="h-6 w-6 fill-white" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{streak} Day Streak</span>
                {streak > 0 && <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 animate-pulse">Active 🔥</span>}
              </div>

              {/* Day Dots Indicator (Colored Beads) */}
              <div className="flex items-center justify-between pt-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                  const isDone = idx < streak;
                  return (
                    <div
                      key={idx}
                      className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-extrabold transition-all shadow-xs ${
                        isDone
                          ? 'bg-gradient-to-b from-orange-400 to-rose-500 text-white shadow-orange-400/30 scale-105 border-2 border-white'
                          : 'bg-rose-100 dark:bg-slate-800 text-rose-400 dark:text-slate-500 border border-rose-200 dark:border-slate-700'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs font-extrabold text-rose-700 dark:text-rose-300">
              2 more consecutive days to earn the Weekly Master badge!
            </p>
          </div>

          {/* Metric Card 3: Star Vault (Kid Sun Yellow Theme Tint) */}
          <div className="col-span-12 md:col-span-4 rounded-[32px] border-2 border-amber-300 dark:border-amber-800/80 bg-gradient-to-br from-amber-50/90 via-yellow-50/40 to-white dark:from-[#0f172a] dark:to-[#131b2a] p-6 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
                Star Vault
              </span>
              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-md animate-kid-bob">
                <Trophy className="h-6 w-6" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div className="flex items-center gap-1.5">
                  <Star className="h-6 w-6 fill-amber-400 text-amber-500" />
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100 animate-kid-count-up">{stars} Stars</span>
                </div>
                <span className="text-xs font-extrabold text-amber-900 bg-amber-200 dark:bg-amber-950 dark:text-amber-200 px-2.5 py-0.5 rounded-full">Level 3</span>
              </div>

              <div className="w-full h-3.5 bg-amber-100 dark:bg-slate-800 rounded-full overflow-hidden border border-amber-200 dark:border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: '83%' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-extrabold text-amber-900 dark:text-amber-300">
              <span>50 stars to Level 4</span>
              <button
                onClick={() => router.push('/kid/rewards')}
                className="font-extrabold text-orange-600 hover:underline cursor-pointer"
              >
                View Rewards &rarr;
              </button>
            </div>
          </div>

        </div>

        {/* ROW 3: Core Content (Adventure Quests Grid & Spotlight Video Postcard Card) */}
        <div className="grid grid-cols-12 gap-5">

          {/* Left 8 Cols: Adventure Quests Catalog */}
          <div className="col-span-12 lg:col-span-8 rounded-[32px] border-2 border-orange-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-orange-500">
                  Adventure Quests
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                  Choose Your Learning Quest
                </h2>
              </div>

              <button
                onClick={() => router.push('/kid/learn')}
                className="text-xs font-extrabold text-orange-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer bg-orange-100/60 dark:bg-orange-950/40 px-3.5 py-1.5 rounded-full border border-orange-200 dark:border-orange-800"
              >
                <span>View All Subjects</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* 2x2 Quest Cards Grid with Subject Hues & Distinct Pattern Textures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Quest Card 1: Math Quest (Kid Sky Theme + Grid Texture) */}
              <div
                onClick={() => router.push('/kid/learn')}
                className="group rounded-[28px] border-2 border-sky-300 dark:border-sky-800/60 bg-gradient-to-br from-sky-50/90 via-blue-50/40 to-white dark:from-slate-800 dark:to-slate-850 p-5 shadow-sm hover:border-sky-400 hover:scale-105 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                {/* Faint Subject Grid Pattern Motif */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

                <div className="flex items-start justify-between relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-sky-400 text-white flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:animate-kid-wiggle transition-transform shadow-md">
                    <Calculator className="h-6 w-6" />
                  </div>
                  {/* Gold Reward Token Chip */}
                  <span className="bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 border border-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <span>+50★</span>
                  </span>
                </div>

                <div className="space-y-1 relative z-10">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    Math Quest: Space Division
                  </h3>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    Help the astronauts divide star-crystals to power their rocket!
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs font-extrabold text-sky-700 dark:text-sky-400 border-t border-sky-200/60 dark:border-slate-700 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>15 Mins</span>
                  </div>
                  <span className="bg-sky-400 text-white px-3.5 py-1 rounded-full text-xs font-extrabold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shadow-xs">
                    Play <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              {/* Quest Card 2: Science & Space (Kid Grass Theme + Leaf Pattern) */}
              <div
                onClick={() => router.push('/kid/learn')}
                className="group rounded-[28px] border-2 border-emerald-300 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white dark:from-slate-800 dark:to-slate-850 p-5 shadow-sm hover:border-emerald-400 hover:scale-105 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:animate-kid-wiggle transition-transform shadow-md">
                    <Atom className="h-6 w-6" />
                  </div>
                  <span className="bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 border border-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <span>+40★</span>
                  </span>
                </div>

                <div className="space-y-1 relative z-10">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Journey Through Solar System
                  </h3>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    Visit 8 planets, the asteroid belt, and discover cosmic mysteries.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 border-t border-emerald-200/60 dark:border-slate-700 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>10 Mins</span>
                  </div>
                  <span className="bg-emerald-500 text-white px-3.5 py-1 rounded-full text-xs font-extrabold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shadow-xs">
                    Play <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              {/* Quest Card 3: Reading Journey (Kid Bubblegum Theme + Book Lines Pattern) */}
              <div
                onClick={() => router.push('/kid/stories')}
                className="group rounded-[28px] border-2 border-pink-300 dark:border-pink-800/60 bg-gradient-to-br from-pink-50/90 via-rose-50/40 to-white dark:from-slate-800 dark:to-slate-850 p-5 shadow-sm hover:border-pink-400 hover:scale-105 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-pink-400 text-white flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:animate-kid-wiggle transition-transform shadow-md">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <span className="bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 border border-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <span>+45★</span>
                  </span>
                </div>

                <div className="space-y-1 relative z-10">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    The Secret Library of Elves
                  </h3>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    Interactive story quest with vocabulary challenges and puzzles.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs font-extrabold text-pink-700 dark:text-pink-400 border-t border-pink-200/60 dark:border-slate-700 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>12 Mins</span>
                  </div>
                  <span className="bg-pink-400 text-white px-3.5 py-1 rounded-full text-xs font-extrabold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shadow-xs">
                    Story <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              {/* Quest Card 4: Creative Art & Design (Kid Sun Theme + Paint Splash Pattern) */}
              <div
                onClick={() => router.push('/kid/learn')}
                className="group rounded-[28px] border-2 border-amber-300 dark:border-amber-800/60 bg-gradient-to-br from-amber-50/90 via-yellow-50/40 to-white dark:from-slate-800 dark:to-slate-850 p-5 shadow-sm hover:border-amber-400 hover:scale-105 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:animate-kid-wiggle transition-transform shadow-md">
                    <Palette className="h-6 w-6" />
                  </div>
                  <span className="bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 border border-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <span>+30★</span>
                  </span>
                </div>

                <div className="space-y-1 relative z-10">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Draw Your Own Planet
                  </h3>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    Learn color theory, shape blending, and unleash your imagination.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs font-extrabold text-amber-900 dark:text-amber-300 border-t border-amber-200/60 dark:border-slate-700 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>8 Mins</span>
                  </div>
                  <span className="bg-amber-400 text-amber-950 px-3.5 py-1 rounded-full text-xs font-extrabold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shadow-xs">
                    Play <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Right 4 Cols: Recommended Video Lesson Card (Postcard Frame with Rotated Sticker Tape) */}
          <div className="col-span-12 lg:col-span-4 rounded-[32px] border-2 border-purple-300 dark:border-purple-800/60 bg-[#fffdfa] dark:bg-[#131b2a] p-6 shadow-sm flex flex-col justify-between space-y-5 relative">
            
            {/* Sticker Tape Corner Decoration */}
            <div className="absolute -top-3 left-8 bg-purple-200/80 dark:bg-purple-900/80 px-4 py-0.5 rounded-sm shadow-xs transform -rotate-3 text-[9px] font-black uppercase text-purple-900 dark:text-purple-200">
              📌 FEATURED POSTCARD
            </div>

            <div className="space-y-1 pt-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
                Daily Spotlight
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Featured Safe Video Lesson
              </h3>
            </div>

            {/* Postcard Frame */}
            <div
              onClick={() => router.push('/kid/learn')}
              className="relative rounded-3xl overflow-hidden bg-slate-900 border-4 border-purple-200 dark:border-slate-800 aspect-video group cursor-pointer shadow-md"
            >
              <img
                src="https://img.youtube.com/vi/libKVRa01L8/hqdefault.jpg"
                alt="Solar System 101"
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-90"
              />
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:animate-kid-wiggle transition-transform">
                  <Play className="h-7 w-7 fill-white ml-1" />
                </div>
              </div>
              <div className="absolute top-3 right-3 bg-slate-900/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-slate-700 shadow-sm">
                4:05 mins
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                Solar System 101 | National Geographic Kids
              </h4>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                Verified safe educational video with 3 key takeaways and a bonus star quiz!
              </p>
            </div>

            <div className="pt-2 border-t border-purple-200/60 dark:border-slate-800 flex items-center justify-between">
              <span className="bg-amber-300 text-amber-950 text-xs font-extrabold py-1 px-3 rounded-full flex items-center gap-1 shadow-xs border border-amber-300">
                <Star className="h-3.5 w-3.5 fill-amber-950 text-amber-950" />
                <span>+10 Bounty</span>
              </span>

              <button
                onClick={() => router.push('/kid/learn')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-full shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 group border border-purple-400"
              >
                <span>Watch Now</span>
                <Play className="h-3.5 w-3.5 fill-white group-hover:animate-kid-wiggle" />
              </button>
            </div>
          </div>

        </div>

        {/* ROW 4: Boosters & Rewards (Prize Box Cards & Reward Shop Showcase) */}
        <div className="grid grid-cols-12 gap-5">

          {/* Left 5 Cols: Brain Booster Logic Challenge + Login Bonus (Prize Box Cards) */}
          <div className="col-span-12 lg:col-span-5 space-y-4">
            
            {/* Prize Box 1: Brain Booster Challenge */}
            <PrizeBoxCard
              title="Daily Logic Challenge"
              badgeTag="Brain Booster"
              rewardText="+10 Stars"
              isClaimed={puzzleAnswered !== null}
              themeColor="violet"
              onClaim={() => {}}
            >
              <div className="bg-white dark:bg-slate-800 border-2 border-purple-200 dark:border-slate-700 rounded-3xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 animate-bounce" />
                  <span>What number comes next in the pattern?</span>
                </div>
                <div className="text-center py-2 text-xl font-black text-purple-700 dark:text-purple-300 tracking-wider bg-purple-50 dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-800">
                  3, 6, 12, 24, <span className="text-orange-500 underline">?</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 1, val: 36, correct: false },
                    { id: 2, val: 48, correct: true },
                    { id: 3, val: 50, correct: false },
                  ].map((opt) => {
                    const isSelected = puzzleAnswered === opt.id;
                    return (
                      <button
                        key={opt.id}
                        disabled={puzzleAnswered !== null}
                        onClick={() => handleAnswerPuzzle(opt.id, opt.correct)}
                        className={`py-2.5 px-2 rounded-2xl text-xs font-extrabold text-center transition-all cursor-pointer border-2 ${
                          isSelected
                            ? opt.correct
                              ? 'bg-emerald-500 border-emerald-400 text-white shadow-md scale-105 animate-kid-confetti'
                              : 'bg-rose-500 border-rose-400 text-white shadow-md scale-105 animate-shake'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-purple-400 hover:scale-105'
                        }`}
                      >
                        {opt.val}
                      </button>
                    );
                  })}
                </div>
              </div>
            </PrizeBoxCard>

            {/* Prize Box 2: Daily Login Bonus */}
            <PrizeBoxCard
              title="Daily Login Streak Bonus"
              badgeTag="Login Bonus"
              rewardText="+15 Stars"
              isClaimed={claimedDailyPrize}
              themeColor="coral"
              onClaim={handleClaimDailyPrize}
            />
          </div>

          {/* Right 7 Cols: Reward Shop Showcase (4 Items in Individual Pastel Cards with Shelf Ledge) */}
          <div className="col-span-12 lg:col-span-7 rounded-[32px] border-2 border-orange-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-orange-500">
                  Reward Vault
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Unlockable Avatar Outfits & Items
                </h3>
              </div>

              <button
                onClick={() => router.push('/kid/rewards')}
                className="text-xs font-extrabold text-orange-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer bg-orange-100/60 dark:bg-orange-950/40 px-3.5 py-1.5 rounded-full border border-orange-200 dark:border-orange-800"
              >
                <span>Open Shop</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* 4 Pastel Cards with Shop Shelf Ledge */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {shopItems.map((item, idx) => {
                const themes = [
                  'bg-amber-50/90 border-amber-300 text-amber-700',
                  'bg-sky-50/90 border-sky-300 text-sky-700',
                  'bg-purple-50/90 border-purple-300 text-purple-700',
                  'bg-rose-50/90 border-rose-300 text-rose-700',
                ];
                return (
                  <div
                    key={item.id}
                    onClick={() => router.push('/kid/rewards')}
                    className={`group rounded-[24px] border-2 ${themes[idx % 4]} dark:bg-slate-800 dark:border-slate-700 p-4 text-center shadow-xs hover:scale-105 transition-all duration-200 cursor-pointer relative space-y-2 flex flex-col justify-between overflow-hidden animate-kid-shine`}
                  >
                    {item.ready ? (
                      <span className="absolute top-2.5 right-2.5 bg-emerald-500 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                        READY
                      </span>
                    ) : (
                      <span className="absolute top-2.5 right-2.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Lock className="h-2.5 w-2.5" />
                      </span>
                    )}

                    <div className="pt-2 group-hover:scale-110 group-hover:animate-kid-wiggle transition-transform">
                      {item.iconSvg}
                    </div>

                    {/* Shop Shelf Ledge Shadow Decoration */}
                    <div className="w-full h-1 bg-black/10 dark:bg-black/30 rounded-full my-1" />

                    <div className="space-y-0.5">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center justify-center gap-1 text-xs font-extrabold text-amber-500">
                        <span>★</span>
                        <span>{item.stars}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-orange-100/60 dark:bg-slate-800/60 border border-orange-200/80 dark:border-slate-700 rounded-2xl p-3 flex items-center justify-between text-xs font-bold text-orange-900 dark:text-orange-200">
              <span>Earn stars by watching verified lessons and completing quizzes!</span>
              <button
                onClick={() => router.push('/kid/learn')}
                className="font-extrabold text-orange-600 hover:underline shrink-0 ml-2 cursor-pointer"
              >
                Earn Stars &rarr;
              </button>
            </div>
          </div>

        </div>

        {/* ROW 5: Walled Garden Passports (Horizontally Scrollable Passport Stamp Strip) */}
        <div className="rounded-[32px] border-2 border-emerald-200 dark:border-slate-800 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white dark:from-[#0f172a] dark:to-[#131b2a] backdrop-blur-md p-6 shadow-sm space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                Walled Garden Passports
              </span>
              <span className="bg-emerald-500 text-white border border-emerald-300 text-xs font-extrabold py-1 px-3 rounded-full flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Safe Browsing</span>
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Explore Approved Websites
            </h3>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            <SafeLink 
              href="https://www.wikipedia.org"
              className="bg-sky-50 dark:bg-slate-800 border-2 border-sky-200 dark:border-slate-700 py-3 px-5 rounded-2xl text-xs font-extrabold text-sky-900 dark:text-sky-200 hover:border-sky-400 hover:scale-105 transition-all shadow-xs flex items-center gap-2 shrink-0"
            >
              <span>🌐</span>
              <span>Wikipedia</span>
              <span className="text-[10px] bg-sky-200 dark:bg-sky-900 px-2 py-0.5 rounded-full text-sky-800 dark:text-sky-100 font-black">Safe ✓</span>
            </SafeLink>

            <SafeLink 
              href="https://www.khanacademy.org"
              className="bg-emerald-50 dark:bg-slate-800 border-2 border-emerald-200 dark:border-slate-700 py-3 px-5 rounded-2xl text-xs font-extrabold text-emerald-900 dark:text-emerald-200 hover:border-emerald-400 hover:scale-105 transition-all shadow-xs flex items-center gap-2 shrink-0"
            >
              <span>🎓</span>
              <span>Khan Academy</span>
              <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded-full text-emerald-800 dark:text-emerald-100 font-black">Safe ✓</span>
            </SafeLink>

            <SafeLink 
              href="https://www.coursera.org"
              className="bg-purple-50 dark:bg-slate-800 border-2 border-purple-200 dark:border-slate-700 py-3 px-5 rounded-2xl text-xs font-extrabold text-purple-900 dark:text-purple-200 hover:border-purple-400 hover:scale-105 transition-all shadow-xs flex items-center gap-2 shrink-0"
            >
              <span>📚</span>
              <span>Coursera</span>
              <span className="text-[10px] bg-purple-200 dark:bg-purple-900 px-2 py-0.5 rounded-full text-purple-800 dark:text-purple-100 font-black">Safe ✓</span>
            </SafeLink>

            {/* Intentional bad link test */}
            <SafeLink 
              href="https://www.reddit.com"
              className="bg-rose-50 dark:bg-slate-800 border-2 border-rose-200 dark:border-slate-700 py-3 px-5 rounded-2xl text-xs font-extrabold text-rose-900 dark:text-rose-200 hover:border-rose-400 hover:scale-105 transition-all shadow-xs flex items-center gap-2 shrink-0"
            >
              <span>🚫</span>
              <span>Reddit (Blocked)</span>
            </SafeLink>
          </div>
        </div>

      </div>
    </KidLayout>
  );
}
