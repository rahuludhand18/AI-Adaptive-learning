'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Pause, Play, BookOpen, NotebookPen, Sparkles } from 'lucide-react';
import { useFocusStore } from '@/store/useFocusStore';
import { apiRequest } from '@/lib/api';
import { updateTask } from '@/lib/plannerApi';
import KidLayout from '@/components/layout/KidLayout';
import KidPageBackground from '@/components/kid/KidPageBackground';

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
  const [stars, setStars] = useState(0);

  useEffect(() => {
    apiRequest<{ balance: number }>('/api/rewards/wallet/')
      .then((w) => setStars(w.balance ?? 0))
      .catch(() => setStars(0));
  }, []);

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
  const isFinalPhase = progressPct >= 80;

  const handleMarkComplete = async () => {
    if (taskId && /^\d+$/.test(taskId)) {
      try { await updateTask(Number(taskId), { status: 'COMPLETED' }); } catch { /* ignore */ }
    }
    try { await apiRequest('/api/focus/session/end', { method: 'POST' }); } catch { /* ignore */ }
    endSession();
    router.push('/kid/planner');
  };

  return (
    <KidLayout starsCount={stars}>
      {/* BACKGROUND LAYER — Quiet single-tone variant for low visual noise */}
      <KidPageBackground theme="sky" quiet={true} />

      {/* PAGE CONTENT */}
      <main className="max-w-[1100px] w-full mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10 select-none">
        
        {/* Left Section: Study Mission & Notebook */}
        <section className="lg:col-span-3 space-y-4">
          <div className="inline-flex items-center gap-2 bg-sky-100/80 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 font-extrabold text-xs uppercase tracking-wider px-4 py-1.5 rounded-full border border-sky-300 dark:border-sky-800 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            Now studying
          </div>

          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[32px] p-7 border-2 border-sky-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-400 text-white flex items-center justify-center shrink-0 shadow-md">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{subject}</h1>
                <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 mt-0.5">{topic}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-sky-50/70 dark:bg-slate-800/60 border-2 border-sky-200 dark:border-slate-700 p-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-800 dark:text-sky-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" /> Focus Mission
              </h3>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                Spend this focus session on <span className="font-extrabold text-orange-500">{topic}</span> from
                <span className="font-extrabold text-sky-600 dark:text-sky-400"> {subject}</span>.
              </p>
            </div>

            {/* Study Notes Notebook (Low Visual Noise Cream Paper) */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-xs font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  <NotebookPen className="w-4 h-4 text-orange-500 animate-kid-bob" /> Study Notes Notebook 📝
                </label>
                <button
                  onClick={handleSaveNotes}
                  className="text-xs font-extrabold px-4 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  {notesSaved ? 'Saved! ✨' : 'Save Notes'}
                </button>
              </div>
              <div className="relative rounded-3xl border-2 border-amber-200 dark:border-slate-700 bg-[#fffdfa] dark:bg-slate-850 p-2 shadow-xs">
                {/* Spiral Ring Header decoration */}
                <div className="flex items-center justify-around px-4 py-1 border-b border-amber-200/80 dark:border-slate-700 mb-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-2.5 h-3.5 rounded-full bg-amber-300 dark:bg-slate-600 border border-amber-400 dark:border-slate-500 shadow-xs" />
                  ))}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Jot down key points, formulas, or questions here..."
                  rows={6}
                  className="w-full px-4 py-3 bg-transparent border-0 text-sm font-bold text-slate-900 dark:text-slate-100 placeholder-amber-700/40 dark:placeholder-slate-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Right Section: Focus Timer Panel */}
        <aside className="lg:col-span-2 space-y-4">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[32px] p-7 border-2 border-sky-200 dark:border-slate-800 shadow-sm text-center space-y-6">
            
            {/* Clock Circle Frame with Soft Pulse */}
            <div className={`py-6 rounded-full border-4 shadow-inner flex flex-col items-center justify-center transition-colors duration-500 ${
              isFinalPhase 
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400' 
                : 'bg-sky-50 dark:bg-slate-800 border-sky-400 animate-kid-pulse-glow'
            }`}>
              <div className={`text-6xl font-extrabold tracking-tight font-mono drop-shadow-xs transition-colors ${
                isFinalPhase ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-sky-400'
              }`}>
                {formattedTime}
              </div>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">Focus Timer</span>
            </div>

            {/* Time Presets Pill Row */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[15, 25, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => setDuration(m)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer border-2 ${
                    durationMin === m
                      ? 'bg-sky-400 text-white border-sky-300 shadow-md scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-200 dark:border-slate-700">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-linear shadow-xs ${
                    isFinalPhase ? 'bg-amber-400' : 'bg-sky-400'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
                <span>Progress</span>
                <span>{progressPct}% Complete</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-3">
              {activeSession.isRunning ? (
                <button onClick={pauseSession} className="py-3 px-6 bg-amber-400 hover:bg-amber-500 border-2 border-amber-300 text-amber-950 font-extrabold text-xs rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer shadow-xs">
                  <Pause className="w-4 h-4 fill-amber-950" /> Pause Timer
                </button>
              ) : (
                <button onClick={resumeSession} className="py-3 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2 cursor-pointer border-2 border-emerald-400">
                  <Play className="w-4 h-4 fill-white" /> Resume Timer
                </button>
              )}
            </div>
          </div>

          {/* Solid CTA for Mark Complete */}
          <button
            onClick={handleMarkComplete}
            className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm rounded-[24px] shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer border-2 border-emerald-400"
          >
            <CheckCircle2 className="w-5 h-5 text-white" /> Complete Focus Session
          </button>
        </aside>
      </main>
    </KidLayout>
  );
}

export default function KidFocusSessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b0f17]" />}>
      <FocusSessionInner />
    </Suspense>
  );
}
