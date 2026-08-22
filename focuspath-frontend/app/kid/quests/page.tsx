'use client';

import { useEffect, useState } from 'react';
import KidLayout from '@/components/layout/KidLayout';
import { apiRequest } from '@/lib/api';
import { Puzzle, Star, CheckCircle2, Loader2, Lightbulb } from 'lucide-react';

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
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Puzzle className="h-7 w-7 text-indigo-600 dark:text-indigo-400" /> Quests & Puzzles
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Earn stars by finishing quests and the daily puzzle!</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-500 font-semibold py-16 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading…
          </div>
        ) : (
          <>
            {/* Daily Puzzle */}
            {puzzle && (
              <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Daily Puzzle</span>
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-indigo-600 text-indigo-600" /> +{puzzle.reward_stars}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" /> {puzzle.question}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {puzzle.options.map((opt, i) => {
                    const isPicked = picked === i;
                    const isCorrect = attempted && correctIdx === i;
                    const isWrongPick = attempted && isPicked && correctIdx !== i;
                    return (
                      <button
                        key={i}
                        disabled={attempted}
                        onClick={() => answer(i)}
                        className={`py-2.5 px-3 rounded-xl text-sm font-bold border transition-all cursor-pointer disabled:cursor-default ${
                          isCorrect
                            ? 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                            : isWrongPick
                            ? 'bg-rose-100 dark:bg-rose-950/70 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {attempted && (
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {correctIdx === picked ? 'Correct! Stars added ⭐' : 'Good try! The highlighted one was correct.'}
                  </p>
                )}
              </div>
            )}

            {/* Quests */}
            <div className="space-y-3">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Your Quests</h2>
              {quests.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">No quests yet — check back soon!</p>
              ) : (
                <div className="grid grid-cols-12 gap-4">
                  {quests.map((q) => (
                    <div
                      key={q.id}
                      className={`col-span-12 md:col-span-6 rounded-[28px] border p-5 shadow-sm flex items-center justify-between gap-4 ${
                        q.completed
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">{q.title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate">{q.subtitle}</p>
                        <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> +{q.reward_stars} stars
                        </span>
                      </div>
                      {q.completed ? (
                        <span className="flex items-center gap-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 shrink-0">
                          <CheckCircle2 className="h-4 w-4" /> Done
                        </span>
                      ) : (
                        <button
                          onClick={() => complete(q)}
                          disabled={busy === q.id}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold py-2.5 px-5 rounded-full shadow-sm transition-all hover:scale-105 cursor-pointer shrink-0 disabled:opacity-50"
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
