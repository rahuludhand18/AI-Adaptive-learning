'use client';

import { useEffect, useRef, useState } from 'react';
import { useTabTracker } from '@/hooks/useTabTracker';
import { useAuthStore } from '@/store/authStore';
import { apiRequest } from '@/lib/api';
import { Eye, Moon, Lock, Sparkles, Clock, ShieldAlert } from 'lucide-react';
import KidPageBackground from '@/components/kid/KidPageBackground';

// 20-20-20 rule default; overridden by the parent's configured interval.
const DEFAULT_EYE_BREAK_MIN = 20;
const BREAK_SECONDS = 20;

// Wraps every /kid/* page: tab-switch lockout + unskippable eye-break + daily
// screen-time enforcement (all driven by the child's restriction settings).
// Renders children unchanged.
export default function KidModeLayout({ children }: { children: React.ReactNode }) {
  useTabTracker();

  const { user } = useAuthStore();
  const isKid = user?.role === 'KID';

  const onBreakRef = useRef(false);
  const breakRef = useRef(BREAK_SECONDS);
  const eyeIntervalSecRef = useRef(DEFAULT_EYE_BREAK_MIN * 60);
  const secsRef = useRef(DEFAULT_EYE_BREAK_MIN * 60); // seconds until next break
  const screenSecsRef = useRef(0); // cumulative screen time this session
  const dailyLimitSecRef = useRef<number | null>(null); // null = no limit
  const limitReachedRef = useRef(false);
  const lockedRef = useRef(false); // parent lock / expired temporary session
  const tempUntilRef = useRef<number | null>(null); // ms timestamp a temp approval ends
  const [, force] = useState(0); // re-render each tick

  // load this child's restriction (screen-time limit + eye-break interval)
  useEffect(() => {
    if (!isKid) return;
    apiRequest<{
      daily_screen_time_limit: number; eye_break_interval: number;
      is_locked: boolean; temporary_session_until: string | null;
    }>('/api/kids/my-settings/')
      .then((s) => {
        if (s.eye_break_interval > 0) {
          eyeIntervalSecRef.current = s.eye_break_interval * 60;
          secsRef.current = s.eye_break_interval * 60;
        }
        if (s.daily_screen_time_limit > 0) {
          dailyLimitSecRef.current = s.daily_screen_time_limit * 60;
        }
        if (s.is_locked) lockedRef.current = true;
        if (s.temporary_session_until) tempUntilRef.current = Date.parse(s.temporary_session_until);
        force((n) => n + 1);
      })
      .catch(() => {});
  }, [isKid]);

  useEffect(() => {
    if (!isKid) return;
    const id = setInterval(() => {
      // 0) re-lock when a temporary parent approval has expired
      if (tempUntilRef.current && Date.now() > tempUntilRef.current) {
        lockedRef.current = true;
      }
      if (lockedRef.current) {
        force((n) => n + 1);
        return;
      }
      // 1) daily screen-time limit -> full-screen rest overlay (stops everything)
      screenSecsRef.current += 1;
      if (dailyLimitSecRef.current && screenSecsRef.current >= dailyLimitSecRef.current) {
        limitReachedRef.current = true;
        force((n) => n + 1);
        return;
      }
      // 2) eye-break cycle
      if (onBreakRef.current) {
        breakRef.current -= 1;
        if (breakRef.current <= 0) {
          onBreakRef.current = false;
          secsRef.current = eyeIntervalSecRef.current;
          breakRef.current = BREAK_SECONDS;
        }
      } else {
        secsRef.current -= 1;
        if (secsRef.current <= 0) {
          onBreakRef.current = true;
          breakRef.current = BREAK_SECONDS;
        }
      }
      force((n) => n + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isKid]);

  return (
    <>
      {children}

      {/* Locked by parent / expired temporary session (top priority - kid-violet identity) */}
      {isKid && lockedRef.current && (
        <div className="fixed inset-0 z-[120] bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 text-white flex flex-col items-center justify-center gap-6 p-8 text-center animate-in fade-in duration-300">
          <div className="w-28 h-28 rounded-full bg-violet-800/60 border-4 border-violet-400/40 flex items-center justify-center shadow-2xl animate-kid-float relative">
            <span className="text-5xl">😴</span>
            <span className="absolute -bottom-1 -right-1 text-2xl">🔒</span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300 bg-violet-900/90 px-4 py-1.5 rounded-full border border-violet-700/80 shadow-xs flex items-center gap-1.5 mx-auto w-fit">
              <ShieldAlert className="w-3.5 h-3.5 text-violet-300" />
              Grown-up Notice
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Paused by a Grown-Up 🔒</h2>
          </div>

          <div className="max-w-md w-full bg-violet-900/40 backdrop-blur-md p-6 rounded-3xl border border-violet-700/60 space-y-3 text-center shadow-xl">
            <p className="font-medium text-violet-200 text-xs sm:text-sm leading-relaxed">
              Ask a parent or teacher to enter their PIN and unlock FocusPath so you can keep exploring!
            </p>
          </div>
        </div>
      )}

      {/* Daily screen-time reached (warm sunset theme - positive wrap-up) */}
      {isKid && limitReachedRef.current && (
        <div className="fixed inset-0 z-[110] bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-white flex flex-col items-center justify-center gap-6 p-8 text-center animate-in fade-in duration-300">
          <div className="w-28 h-28 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center shadow-2xl animate-kid-bob relative">
            <Moon className="w-14 h-14 text-amber-100" />
            <span className="absolute top-0 right-0 text-2xl animate-kid-wiggle">⭐</span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white/20 text-white px-4 py-1.5 rounded-full border border-white/30 shadow-xs flex items-center gap-1.5 mx-auto w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              Daily Mission Completed!
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Time to Recharge! 🌅</h2>
          </div>

          <div className="max-w-md w-full bg-white/15 backdrop-blur-md p-6 rounded-3xl border border-white/30 space-y-3 text-left shadow-xl">
            <div className="flex items-center justify-between text-xs font-bold text-amber-100 border-b border-white/20 pb-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-200" />
                Today&apos;s Adventure Summary
              </span>
              <span className="bg-amber-300 text-amber-950 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black">⭐ Star Collector</span>
            </div>
            <p className="text-sm font-medium text-white/90 leading-relaxed">
              Awesome job learning today! You&apos;ve reached your daily screen-time limit. Time to play outside or rest your eyes. See you tomorrow!
            </p>
          </div>
        </div>
      )}

      {/* Unskippable eye-break overlay (soft sky-to-lavender gradient) */}
      {isKid && !limitReachedRef.current && onBreakRef.current && (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-500 text-white flex flex-col items-center justify-center gap-6 p-8 text-center animate-in fade-in duration-300">
          <div className="w-28 h-28 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center shadow-2xl animate-kid-pulse-glow relative">
            <Eye className="w-14 h-14 text-sky-100" />
            <span className="absolute -top-1 -right-1 text-2xl animate-kid-bob">🦉</span>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white/20 text-white px-4 py-1.5 rounded-full border border-white/30 shadow-xs">
              Rest Your Eyes
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Eye-Break Time! 👀</h2>
          </div>

          <p className="max-w-md font-medium text-sky-100 text-sm leading-relaxed bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            Look away from the screen at something far across the room for 20 seconds.
          </p>

          <div className="text-7xl font-extrabold tracking-tight tabular-nums bg-white/20 px-10 py-5 rounded-3xl border border-white/30 shadow-inner">
            {breakRef.current}
          </div>

          <p className="text-xs font-bold text-white/90 uppercase tracking-wider bg-white/15 px-4 py-1.5 rounded-full border border-white/20">
            Resting eyes keeps your mind sharp 💙
          </p>
        </div>
      )}
    </>
  );
}
