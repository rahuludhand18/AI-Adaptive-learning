'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogOut, CheckCircle2, Pause, Play, BookOpen, NotebookPen } from 'lucide-react';
import { useFocusStore } from '@/store/useFocusStore';
import { apiRequest } from '@/lib/api';
import { updateTask } from '@/lib/plannerApi';
import KidLayout from '@/components/layout/KidLayout';

function FocusSessionInner() {
  const router = useRouter();
  const params = useSearchParams();

  const taskId = params.get('task') || '';
  const subject = params.get('title') || 'Study Session';
  const topic = params.get('topic') || 'Focused study session';

  const { activeSession, startSession, pauseSession, resumeSession, endSession, tickSession } = useFocusStore();

  const [durationMin, setDurationMin] = useState(25);
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    if (taskId) {
      const saved = localStorage.getItem(`focus_notes_${taskId}`);
      if (saved) setNotes(saved);
    }
  }, [taskId]);

  const handleSaveNotes = () => {
    if (taskId) {
      localStorage.setItem(`focus_notes_${taskId}`, notes);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }
  };

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

  // Pause session when document becomes hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && activeSession.isRunning) {
        pauseSession();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [activeSession.isRunning, pauseSession]);

  const remainingSeconds = Math.max(activeSession.totalSeconds - activeSession.elapsedSeconds, 0);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPct = Math.round((activeSession.elapsedSeconds / (activeSession.totalSeconds || 1)) * 100);

  const handleMarkComplete = async () => {
    if (taskId && /^\d+$/.test(taskId)) {
      try { await updateTask(Number(taskId), { status: 'COMPLETED' }); } catch { /* ignore */ }
    }
    try { await apiRequest('/api/focus/session/end', { method: 'POST' }); } catch { /* ignore */ }
    endSession();
    router.push('/kid/planner');
  };

  return (
    <KidLayout starsCount={250}>
      <main className="max-w-[1100px] w-full mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-3 space-y-4">
          <div className="inline-flex items-center gap-2 bg-indigo-light dark:bg-indigo-950/60 text-indigo dark:text-indigo-400 font-bold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-indigo/20">
            <span className="w-2 h-2 rounded-full bg-indigo animate-pulse" />
            Now studying
          </div>

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
                <span className="font-semibold text-textPrimary dark:text-slate-100"> {subject}</span>.
              </p>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-textSecondary dark:text-slate-400 uppercase">
                  <NotebookPen className="w-3.5 h-3.5" /> Study notes
                </label>
                <button
                  onClick={handleSaveNotes}
                  className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo/10 text-indigo hover:bg-indigo/20 transition-colors cursor-pointer"
                >
                  {notesSaved ? 'Saved!' : 'Save Notes'}
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down key points..."
                rows={6}
                className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-2xl text-sm text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo resize-none"
              />
            </div>
          </div>
        </section>

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
            <CheckCircle2 className="w-5 h-5 text-emerald-300" /> Mark complete
          </button>
        </aside>
      </main>
    </KidLayout>
  );
}

export default function KidFocusSessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0f17]" />}>
      <FocusSessionInner />
    </Suspense>
  );
}
