'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, CheckCircle2, Pause, Play, Brain, User, Smile, Users } from 'lucide-react';
import { useFocusStore } from '@/store/useFocusStore';
import { COPY } from '@/constants/copy';
import { apiRequest } from '@/lib/api';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function AdultFocusSessionPage() {
  const router = useRouter();
  const blockId = 'block-1';

  const {
    activeSession,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    tickSession,
  } = useFocusStore();

  // adjustable session length (minutes)
  const [durationMin, setDurationMin] = useState(25);

  // change the timer length; restarts the countdown with the new total
  const setDuration = (mins: number) => {
    const m = Math.max(1, Math.min(180, Math.round(mins || 0)));
    setDurationMin(m);
    startSession(blockId, m);
  };

  // start a real focus session on the backend so tab switches are counted against it
  useEffect(() => {
    apiRequest('/api/focus/session/start', { method: 'POST' }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeSession.blockId) {
      startSession(blockId, durationMin);
    }

    const interval = setInterval(() => {
      tickSession();
    }, 1000);

    return () => clearInterval(interval);
  }, [blockId]);

  const remainingSeconds = Math.max(activeSession.totalSeconds - activeSession.elapsedSeconds, 0);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progressPct = Math.round((activeSession.elapsedSeconds / (activeSession.totalSeconds || 1)) * 100);

  const handleMarkComplete = async () => {
    // end the real focus session on the backend (returns the computed focus score)
    try {
      await apiRequest('/api/focus/session/end', { method: 'POST' });
    } catch {
      // ignore backend errors so the user can always finish the session
    }
    endSession();
    router.push('/adult/dashboard');
  };

  return (
    <div className="min-h-screen bg-bg dark:bg-[#0b0f17] flex flex-col justify-between relative overflow-hidden font-sans antialiased text-textPrimary dark:text-slate-100 transition-colors">
      
      {/* Decorative Soft Indigo Blob Top-Right */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-light/90 dark:bg-indigo-950/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full bg-transparent sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/adult/dashboard" className="flex items-center group">
            <img
              src="/focuspath_logo.png"
              alt="FocusPath"
              className="h-8.5 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => router.push('/adult/planner')}
              className="flex items-center space-x-1.5 text-xs font-semibold text-textPrimary dark:text-slate-300 hover:text-danger dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{COPY.session.exit}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-6 py-8 flex-1 flex flex-col items-center justify-center text-center z-10 w-full">
        
        {/* Active Badge */}
        <div className="inline-flex items-center space-x-2 bg-indigo-light dark:bg-indigo-950/60 text-indigo dark:text-indigo-400 font-bold text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-6 border border-indigo/20">
          <span className="w-2 h-2 rounded-full bg-indigo animate-pulse" />
          <span>{COPY.session.badge}</span>
        </div>

        {/* Current Session Labels */}
        <span className="text-[11px] font-extrabold text-textSecondary dark:text-slate-400 uppercase tracking-widest block mb-1">
          {COPY.session.label}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary dark:text-slate-100 tracking-tight mb-8">
          {COPY.session.title}
        </h1>

        {/* Timer Card */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-border dark:border-slate-800 shadow-xl space-y-6">
          
          {/* Digits Display */}
          <div className="text-7xl sm:text-8xl font-black text-indigo tracking-tight font-mono">
            {formattedTime}
          </div>

          {/* Adjustable session length */}
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
            <div className="flex items-center gap-1.5 pl-1">
              <input
                type="number"
                min={1}
                max={180}
                value={durationMin}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-16 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-xs text-center font-bold text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo"
                aria-label="Custom minutes"
              />
              <span className="text-[11px] font-bold text-textSecondary dark:text-slate-400">min</span>
            </div>
          </div>

          {/* Progress Bar & Label Pair */}
          <div className="space-y-2 pt-2">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo h-full rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-bold text-textSecondary dark:text-slate-400">
              <span>Progress</span>
              <span>{progressPct}% Complete</span>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4 mt-6 w-full max-w-sm">
          <button
            onClick={handleMarkComplete}
            className="flex-1 py-3.5 px-6 bg-indigo text-white font-bold text-xs rounded-2xl hover:bg-indigo-dark transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{COPY.session.completeBtn}</span>
          </button>

          {activeSession.isRunning ? (
            <button
              onClick={pauseSession}
              className="py-3.5 px-6 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 text-textPrimary dark:text-slate-200 font-bold text-xs rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Pause className="w-4 h-4 text-textSecondary dark:text-slate-400" />
              <span>{COPY.session.pauseBtn}</span>
            </button>
          ) : (
            <button
              onClick={resumeSession}
              className="py-3.5 px-6 bg-teal text-white font-bold text-xs rounded-2xl hover:bg-teal-600 transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>{COPY.session.resumeBtn}</span>
            </button>
          )}
        </div>

      </main>

      {/* Bottom-Right BRAIN STATE Mini Card & Icon Pill */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-3 hidden sm:flex">
        {/* Brain State Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-border dark:border-slate-800 shadow-lg flex items-center space-x-3">
          <div>
            <span className="text-[10px] font-bold text-textSecondary dark:text-slate-400 uppercase tracking-wider block">
              {COPY.session.brainStateTitle}
            </span>
            <span className="text-xs font-bold text-textPrimary dark:text-slate-200">
              {COPY.session.brainStateValue}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-teal-light dark:bg-teal-950/50 text-teal flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
        </div>

        {/* 3 Icon Pill */}
        <div className="bg-indigo-light/80 dark:bg-indigo-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo/20 flex items-center space-x-3 text-indigo">
          <User className="w-4 h-4" />
          <Smile className="w-4 h-4" />
          <Users className="w-4 h-4" />
        </div>
      </div>

    </div>
  );
}
