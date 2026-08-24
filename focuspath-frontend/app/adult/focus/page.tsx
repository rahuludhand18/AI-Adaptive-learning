'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogOut, CheckCircle2, Pause, Play, BookOpen, NotebookPen } from 'lucide-react';
import { useFocusStore } from '@/store/useFocusStore';
import { apiRequest } from '@/lib/api';
import { updateTask } from '@/lib/plannerApi';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

function FocusSessionInner() {
  const router = useRouter();
  const params = useSearchParams();

  // which block is being studied (passed from the planner)
  const taskId = params.get('task') || '';
  const subject = params.get('title') || 'Study Session';
  const topic = params.get('topic') || 'Focused study session';

  const { activeSession, startSession, pauseSession, resumeSession, endSession, tickSession } = useFocusStore();

  const [durationMin, setDurationMin] = useState(25);
  const [notes, setNotes] = useState('');

  const setDuration = (mins: number) => {
    const m = Math.max(1, Math.min(180, Math.round(mins || 0)));
    setDurationMin(m);
    startSession(taskId || 'block', m);
  };

  useEffect(() => {
    apiRequest('/api/focus/session/start', { method: 'POST' }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeSession.blockId) startSession(taskId || 'block', durationMin);
    const interval = setInterval(() => tickSession(), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const remainingSeconds = Math.max(activeSession.totalSeconds - activeSession.elapsedSeconds, 0);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPct = Math.round((activeSession.elapsedSeconds / (activeSession.totalSeconds || 1)) * 100);

  const handleMarkComplete = async () => {
    // persist this block as completed on the backend (works whether they studied here or elsewhere)
    if (taskId && /^\d+$/.test(taskId)) {
      try { await updateTask(Number(taskId), { status: 'COMPLETED' }); } catch { /* ignore */ }
    }
    try { await apiRequest('/api/focus/session/end', { method: 'POST' }); } catch { /* ignore */ }
    endSession();
    router.push('/adult/planner');
  };

  return (
    <div className="min-h-screen bg-bg dark:bg-[#0b0f17] flex flex-col font-sans antialiased text-textPrimary dark:text-slate-100 transition-colors">
      {/* Header */}
      <header className="w-full sticky top-0 z-40">
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/adult/planner" className="flex items-center group">
            <img src="/focuspath_logo.png" alt="FocusPath" className="h-8 w-auto object-contain transition-transform group-hover:scale-105" />
          </Link>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => router.push('/adult/planner')}
              className="flex items-center space-x-1.5 text-xs font-semibold text-textPrimary dark:text-slate-300 hover:text-danger dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
        {/* Left: what to study (content) */}
        <section className="lg:col-span-3 space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-light dark:bg-indigo-950/60 text-indigo dark:text-indigo-400 font-bold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-indigo/20">
            <span className="w-2 h-2 rounded-full bg-indigo animate-pulse" />
            Now studying
          </div>

          {/* Content card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-border dark:border-slate-800 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-light dark:bg-indigo-950/50 text-indigo dark:text-indigo-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-textPrimary dark:text-slate-100 tracking-tight">{subject}</h1>
                <p className="text-sm text-textSecondary dark:text-slate-400 mt-0.5">{topic}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-border dark:border-slate-800 p-5">
              <h3 className="text-sm font-bold text-textPrimary dark:text-slate-100 mb-2">Focus for this block</h3>
              <p className="text-sm text-textSecondary dark:text-slate-300 leading-relaxed">
                Spend this session on <span className="font-semibold text-textPrimary dark:text-slate-100">{topic}</span> from
                <span className="font-semibold text-textPrimary dark:text-slate-100"> {subject}</span>. Study here or from your own
                material — when you&apos;re done, mark this block complete and it updates your timetable and progress.
              </p>
            </div>

            {/* Notes / study space */}
            <div className="mt-4">
              <label className="flex items-center gap-1.5 text-xs font-bold text-textSecondary dark:text-slate-400 uppercase mb-1.5">
                <NotebookPen className="w-3.5 h-3.5" /> Study notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down key points, doubts, or a summary as you study…"
                rows={6}
                className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-2xl text-sm text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo resize-none"
              />
            </div>
          </div>
        </section>

        {/* Right: timer + controls */}
        <aside className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 border border-border dark:border-slate-800 shadow-xl text-center space-y-5">
            <div className="text-6xl font-black text-indigo tracking-tight font-mono">{formattedTime}</div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {[15, 25, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => setDuration(m)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    durationMin === m
                      ? 'bg-indigo text-white border-indigo shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-border dark:border-slate-700 text-textSecondary dark:text-slate-300 hover:border-indigo/40'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo h-full rounded-full transition-all duration-1000 ease-linear" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="flex justify-between text-[11px] font-bold text-textSecondary dark:text-slate-400">
                <span>Progress</span>
                <span>{progressPct}% Complete</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              {activeSession.isRunning ? (
                <button onClick={pauseSession} className="py-3 px-5 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 text-textPrimary dark:text-slate-200 font-bold text-xs rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
                  <Pause className="w-4 h-4 text-textSecondary dark:text-slate-400" /> Pause
                </button>
              ) : (
                <button onClick={resumeSession} className="py-3 px-5 bg-teal text-white font-bold text-xs rounded-2xl hover:bg-teal-600 transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer">
                  <Play className="w-4 h-4" /> Resume
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleMarkComplete}
            className="w-full py-3.5 px-6 bg-indigo text-white font-bold text-sm rounded-2xl hover:bg-indigo-dark transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-300" /> Mark this block complete
          </button>
          <p className="text-[11px] text-textSecondary dark:text-slate-500 text-center">
            Studied elsewhere? You can still mark it complete — it updates your timetable and progress.
          </p>
        </aside>
      </main>
    </div>
  );
}

export default function AdultFocusSessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg dark:bg-[#0b0f17]" />}>
      <FocusSessionInner />
    </Suspense>
  );
}
