'use client';

import { useEffect, useState } from 'react';
import KidLayout from '@/components/layout/KidLayout';
import KidPageBackground from '@/components/kid/KidPageBackground';
import { apiRequest } from '@/lib/api';
import { Puzzle, Star, CheckCircle2, Loader2, Lightbulb, Sparkles } from 'lucide-react';

interface Quest { id: number; title: string; subtitle: string; reward_stars: number; completed: boolean; }
interface DailyPuzzle { id: number; question: string; options: string[]; reward_stars: number; }

export default function KidQuestsPage() {
  const [stars, setStars] = useState(0);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [puzzle, setPuzzle] = useState<DailyPuzzle | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctIdx, setCorrectIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = async () => {
    try {
      const [w, q, p] = await Promise.all([
        apiRequest<{ balance: number }>('/api/rewards/wallet/'),
        apiRequest<Quest[]>('/api/kids/quests/'),
        apiRequest<{ puzzle: DailyPuzzle | null; attempted: boolean }>('/api/kids/puzzle/today/'),
      ]);
      setStars(w.balance || 0);
      setQuests(q);
      setPuzzle(p.puzzle);
      setAttempted(p.attempted);
    } catch {
      // leave defaults
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const answer = async (i: number) => {
    if (!puzzle || attempted || picked !== null) return;
    setPicked(i);
    try {
      const res = await apiRequest<{ correct: boolean; correct_index: number; balance: number | null }>(
        `/api/kids/puzzle/${puzzle.id}/answer/`,
        { method: 'POST', body: JSON.stringify({ option: i }) },
      );
      setCorrectIdx(res.correct_index);
      setAttempted(true);
      if (res.balance != null) setStars(res.balance);
    } catch {
      setPicked(null);
    }
  };

  const complete = async (quest: Quest) => {
    if (quest.completed) return;
    setBusy(quest.id);
    try {
      const res = await apiRequest<{ balance: number | null }>(
        `/api/kids/quests/${quest.id}/complete/`,
        { method: 'POST' },
      );
      if (res.balance != null) setStars(res.balance);
      setQuests((prev) => prev.map((x) => (x.id === quest.id ? { ...x, completed: true } : x)));
    } catch {
      // ignore
    } finally {
      setBusy(null);
    }
  };

  return (
    <KidLayout starsCount={stars}>
      {/* BACKGROUND LAYER */}
      <KidPageBackground theme="sun" />

      {/* PAGE CONTENT */}
      <div className="relative z-10 space-y-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-500">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md animate-kid-bob">
              <Puzzle className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Quests & Puzzles 🧩
            </h1>
          </div>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 font-bold">
            Earn stars by finishing quests and solving the daily puzzle!
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-500 font-bold py-16 justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" /> Loading Quests…
          </div>
        ) : (
          <>
            {/* Daily Puzzle (Treasure Chest / Riddle Scroll Card) */}
            {puzzle && (
              <div className="rounded-[32px] border-4 border-amber-300 dark:border-amber-800 bg-gradient-to-br from-amber-50/90 via-yellow-50/60 to-orange-50/40 dark:from-[#0f172a] dark:to-[#131b2a] backdrop-blur-md p-7 shadow-lg space-y-5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-900 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-950/80 px-3.5 py-1 rounded-full border border-amber-300 dark:border-amber-800 shadow-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Daily Treasure Riddle
                  </span>
                  <span className="text-xs font-extrabold text-amber-950 bg-gradient-to-r from-amber-300 to-yellow-400 border-2 border-amber-300 px-3.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                    <Star className="h-4 w-4 fill-amber-950 text-amber-950" /> +{puzzle.reward_stars}★ Bounty
                  </span>
                </div>

                <h3 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                  <span className="text-2xl animate-kid-bounce-subtle shrink-0">💡</span>
                  <span>{puzzle.question}</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {puzzle.options.map((opt, i) => {
                    const isPicked = picked === i;
                    const isCorrect = attempted && correctIdx === i;
                    const isWrongPick = attempted && isPicked && correctIdx !== i;
                    return (
                      <button
                        key={i}
                        disabled={attempted}
                        onClick={() => answer(i)}
                        className={`py-4 px-4 rounded-2xl text-sm font-extrabold border-2 transition-all cursor-pointer disabled:cursor-default ${
                          isCorrect
                            ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg scale-105 animate-kid-confetti'
                            : isWrongPick
                            ? 'bg-rose-500 border-rose-400 text-white shadow-lg scale-105 animate-shake'
                            : 'bg-white dark:bg-slate-800 border-amber-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-amber-400 hover:scale-105 shadow-xs'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {attempted && (
                  <p className="text-xs font-extrabold text-amber-900 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 p-3 rounded-2xl border border-amber-300 dark:border-amber-800/50 animate-kid-count-up">
                    {correctIdx === picked ? '🎉 Brilliant! Stars added to your Star Vault ⭐' : 'Good try! The highlighted answer was correct.'}
                  </p>
                )}
              </div>
            )}

            {/* Quests Catalog */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Your Active Quests</h2>
              {quests.length === 0 ? (
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold">No quests yet — check back soon!</p>
              ) : (
                <div className="grid grid-cols-12 gap-4">
                  {quests.map((q) => (
                    <div
                      key={q.id}
                      className={`col-span-12 md:col-span-6 rounded-[28px] border-2 p-6 shadow-sm flex items-center justify-between gap-4 transition-all ${
                        q.completed
                          ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900/50'
                          : 'bg-amber-50/60 dark:bg-slate-900/90 border-amber-200 dark:border-slate-800 hover:border-amber-400 hover:scale-102'
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100 truncate">{q.title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-bold truncate">{q.subtitle}</p>
                        <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-0.5">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-500" /> +{q.reward_stars}★ Bounty
                        </span>
                      </div>
                      {q.completed ? (
                        <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-3 py-1.5 rounded-full shrink-0 border border-emerald-300">
                          <CheckCircle2 className="h-4 w-4" /> Claimed ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => complete(q)}
                          disabled={busy === q.id}
                          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold py-3 px-6 rounded-full shadow-md shadow-orange-500/20 transition-all hover:scale-108 active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
                        >
                          {busy === q.id ? '…' : 'Complete'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </KidLayout>
  );
}
