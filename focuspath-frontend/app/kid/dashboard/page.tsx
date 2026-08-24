'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KidLayout from '@/components/layout/KidLayout';
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
  Gift,
  Lightbulb,
  Lock
} from 'lucide-react';

export default function KidDashboardPage() {
  const router = useRouter();

  // Gamification & Interactive State
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [dailyGoalPercent, setDailyGoalPercent] = useState(0);
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
        <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto">
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
        <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto">
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
        <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto">
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
        <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto">
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

  // load the child's real star balance + streak on mount
  useEffect(() => {
    apiRequest<{ balance: number; streak_count: number }>('/api/rewards/wallet/')
      .then((w) => {
        setStars(w.balance ?? 0);
        setStreak(w.streak_count ?? 0);
      })
      .catch(() => {});
  }, []);

  // Daily Puzzle Handler
  const handleAnswerPuzzle = (optionId: number, isCorrect: boolean) => {
    if (puzzleAnswered !== null) return;
    setPuzzleAnswered(optionId);
    if (isCorrect) {
      setStars((prev) => prev + 10);
      // persist the reward so the balance is real across the app
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

  return (
    <KidLayout starsCount={stars}>
      <div className="min-h-screen bg-slate-50/60 dark:bg-[#0b0f17] -m-4 sm:-m-8 p-4 sm:p-8 transition-colors">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* 1. Bento Top Hero Welcome Card */}
          <div className="rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">

              {/* Left Side: Mascot Frame & Greetings */}
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 p-2 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src="/kid_owl_mascot.png"
                    alt="Buddy Mascot"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="hidden peer-only:block">
                    <Rocket className="h-10 w-10 text-primary" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 dark:text-primary">
                    <span>Mission Hub</span>
                    <span>&bull;</span>
                    <span className="text-slate-500 dark:text-slate-400">Discovery Hero (Lvl 3)</span>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    Welcome back, Explorer! 👋
                  </h1>
                  <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xl">
                    You've completed 80% of your daily learning goal. Choose your next quest to unlock new rewards!
                  </p>
                </div>
              </div>

              {/* Right Side: Quick Action Pills & Safety Status */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => router.push('/kid/learn')}
                  className="bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2.5 px-5 rounded-full shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Start Learning</span>
                </button>

                <button
                  onClick={() => router.push('/kid/stories')}
                  className="bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 hover:text-primary text-slate-700 dark:text-slate-200 font-bold text-xs py-2.5 px-5 rounded-full border border-slate-200/80 dark:border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Rocket className="h-4 w-4 text-primary" />
                  <span>Story Quests</span>
                </button>

                <div className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/50 text-xs font-semibold py-2 px-3.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>100% Safe</span>
                </div>
              </div>

            </div>
          </div>

          {/* 2. Daily Stats & Gamification Metrics Bento Row (3 Cards across 12 cols) */}
          <div className="grid grid-cols-12 gap-5">

            {/* Metric Card 1: Daily Learning Goal (Col 4) */}
            <div className="col-span-12 md:col-span-4 rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 dark:text-primary">
                  Daily Progress
                </span>
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">24 / 30 mins</span>
                  <span className="text-xs font-bold text-primary">{dailyGoalPercent}% Done</span>
                </div>

                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${dailyGoalPercent}%` }}
                  />
                </div>
              </div>

              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {dailyGoalPercent >= 100 ? "Today's goal complete — great job! 🎉" : "Keep going to complete today's goal!"}
              </p>
            </div>

            {/* Metric Card 2: Focus Streak & Flame Counter (Col 4) */}
            <div className="col-span-12 md:col-span-4 rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600/80 dark:text-orange-400">
                  Consistency
                </span>
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-500 flex items-center justify-center shrink-0">
                  <Flame className="h-5 w-5 fill-orange-500" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{streak} Day Streak</span>
                  {streak > 0 && <span className="text-xs font-bold text-orange-600 dark:text-orange-400">Active 🔥</span>}
                </div>

                {/* Day Dots Indicator */}
                <div className="flex items-center justify-between pt-1">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                    const isDone = idx < streak;
                    return (
                      <div
                        key={idx}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                2 more consecutive days to earn the Weekly Master badge!
              </p>
            </div>

            {/* Metric Card 3: Star Vault & Level Milestone (Col 4) */}
            <div className="col-span-12 md:col-span-4 rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600/80 dark:text-amber-400">
                  Star Vault
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center shrink-0">
                  <Trophy className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stars} Stars</span>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Level 3</span>
                </div>

                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-700"
                    style={{ width: '83%' }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-medium text-slate-400 dark:text-slate-500">
                <span>50 stars to Level 4</span>
                <button
                  onClick={() => router.push('/kid/rewards')}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  View Rewards
                </button>
              </div>
            </div>

          </div>

          {/* 3. Main Bento Row: Quests Grid (8 Cols) & Featured Daily Lesson (4 Cols) */}
          <div className="grid grid-cols-12 gap-5">

            {/* Left 8 Cols: Adventure Quests Catalog */}
            <div className="col-span-12 lg:col-span-8 rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 dark:text-primary">
                    Adventure Quests
                  </span>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    Choose Your Learning Quest
                  </h2>
                </div>

                <button
                  onClick={() => router.push('/kid/learn')}
                  className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Subjects</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* 2x2 Quest Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Quest Card 1: Math Quest */}
                <div
                  onClick={() => router.push('/kid/learn')}
                  className="group rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Calculator className="h-6 w-6 text-primary" />
                    </div>
                    <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>+50 Stars</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                      Math Quest: Space Division
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-2">
                      Help the astronauts divide the star-crystals to power their rocket!
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs font-semibold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>15 Mins</span>
                    </div>
                    <span className="text-primary font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Play <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                {/* Quest Card 2: Science & Space */}
                <div
                  onClick={() => router.push('/kid/learn')}
                  className="group rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Atom className="h-6 w-6 text-primary" />
                    </div>
                    <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>+40 Stars</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                      Journey Through Solar System
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-2">
                      Visit 8 planets, the asteroid belt, and discover cosmic mysteries.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs font-semibold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>10 Mins</span>
                    </div>
                    <span className="text-primary font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Play <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                {/* Quest Card 3: Reading Journey */}
                <div
                  onClick={() => router.push('/kid/stories')}
                  className="group rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>+45 Stars</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                      The Secret Library of Elves
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-2">
                      Interactive story quest with vocabulary challenges and puzzle solving.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs font-semibold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>12 Mins</span>
                    </div>
                    <span className="text-primary font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Story <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                {/* Quest Card 4: Creative Art & Design */}
                <div
                  onClick={() => router.push('/kid/learn')}
                  className="group rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Palette className="h-6 w-6 text-primary" />
                    </div>
                    <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>+30 Stars</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                      Draw Your Own Planet
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-2">
                      Learn color theory, shape blending, and unleash your visual imagination.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs font-semibold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>8 Mins</span>
                    </div>
                    <span className="text-primary font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Play <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right 4 Cols: Recommended Video Lesson Card */}
            <div className="col-span-12 lg:col-span-4 rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 dark:text-primary">
                  Daily Spotlight
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Featured Safe Video Lesson
                </h3>
              </div>

              {/* Video Thumbnail Preview */}
              <div
                onClick={() => router.push('/kid/learn')}
                className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-100 dark:border-slate-800 aspect-video group cursor-pointer shadow-sm"
              >
                <img
                  src="https://img.youtube.com/vi/libKVRa01L8/hqdefault.jpg"
                  alt="Solar System 101"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-5 w-5 fill-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  4:05 mins
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                  Solar System 101 | National Geographic Kids
                </h4>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Verified safe educational video with 3 key takeaways and a bonus star quiz!
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50 text-xs font-bold py-1 px-3 rounded-full flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>+10 Stars Bounty</span>
                </span>

                <button
                  onClick={() => router.push('/kid/learn')}
                  className="bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2 px-4 rounded-full shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>Watch Now</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* 4. Bottom Bento Row: Daily Brain Puzzle (5 Cols) & Reward Shop Showcase (7 Cols) */}
          <div className="grid grid-cols-12 gap-5">

            {/* Left 5 Cols: Daily Interactive Logic Puzzle */}
            <div className="col-span-12 lg:col-span-5 rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 dark:text-primary">
                    Brain Booster
                  </span>
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    +10 Bonus Stars
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Daily Logic Challenge
                </h3>
              </div>

              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <Lightbulb className="h-4 w-4 text-primary shrink-0" />
                  <span>What number comes next in the pattern?</span>
                </div>
                <div className="text-center py-2 text-lg font-bold text-slate-800 dark:text-slate-100 tracking-wider bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  3, 6, 12, 24, <span className="text-primary underline">?</span>
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
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer border ${
                          isSelected
                            ? opt.correct
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 shadow-xs'
                              : 'bg-rose-100 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary/40'
                        }`}
                      >
                        {opt.val}
                      </button>
                    );
                  })}
                </div>

                {puzzleAnswered === 2 && (
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 pt-1 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Correct! Each number doubles (+10 Stars earned!).
                  </p>
                )}
                {puzzleAnswered !== null && puzzleAnswered !== 2 && (
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 pt-1 animate-in fade-in">
                    Nice try! Each number was multiplied by 2 (24 × 2 = 48).
                  </p>
                )}
              </div>

              {/* Daily Claim Box */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
                    <Gift className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Daily Login Bonus</span>
                </div>

                <button
                  disabled={claimedDailyPrize}
                  onClick={handleClaimDailyPrize}
                  className={`text-xs font-bold py-2 px-4 rounded-full transition-all cursor-pointer ${
                    claimedDailyPrize
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-default'
                      : 'bg-amber-400 hover:bg-amber-500 text-slate-900 shadow-sm'
                  }`}
                >
                  {claimedDailyPrize ? 'Claimed (+15 ★)' : 'Claim +15 ★'}
                </button>
              </div>
            </div>

            {/* Right 7 Cols: Reward Shop Showcase */}
            <div className="col-span-12 lg:col-span-7 rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 dark:text-primary">
                    Reward Vault
                  </span>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Unlockable Avatar Outfits & Items
                  </h3>
                </div>

                <button
                  onClick={() => router.push('/kid/rewards')}
                  className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Shop</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* 4 Items Horizontal Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {shopItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push('/kid/rewards')}
                    className="group rounded-[24px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 p-4 text-center shadow-xs hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer relative space-y-2 flex flex-col justify-between"
                  >
                    {item.ready ? (
                      <span className="absolute top-2.5 right-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[8px] font-bold px-2 py-0.5 rounded-full">
                        READY
                      </span>
                    ) : (
                      <span className="absolute top-2.5 right-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Lock className="h-2.5 w-2.5" />
                      </span>
                    )}

                    <div className="pt-2 group-hover:scale-105 transition-transform">
                      {item.iconSvg}
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center justify-center gap-1 text-xs font-bold text-amber-500">
                        <span>★</span>
                        <span>{item.stars}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 rounded-2xl p-3 flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                <span>Earn stars by watching verified lessons and completing quizzes!</span>
                <button
                  onClick={() => router.push('/kid/learn')}
                  className="font-bold text-primary hover:underline shrink-0 ml-2 cursor-pointer"
                >
                  Earn Stars &rarr;
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </KidLayout>
  );
}
