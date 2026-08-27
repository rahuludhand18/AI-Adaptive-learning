'use client';

import { useEffect, useRef, useState } from 'react';
import { useTabTracker } from '@/hooks/useTabTracker';
import { useAuthStore } from '@/store/authStore';
import { apiRequest } from '@/lib/api';
import { Eye, Moon, Lock } from 'lucide-react';
import PlayfulBackground from '@/components/kid/PlayfulBackground';

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
      {isKid && <PlayfulBackground />}
      {children}

      {/* Locked by parent / expired temporary session (top priority) */}
      {isKid && lockedRef.current && (
        <div className="fixed inset-0 z-[120] bg-rose-600 text-white flex flex-col items-center justify-center gap-4 p-8 text-center">
          <Lock className="w-16 h-16" />
          <h2 className="text-3xl font-extrabold">Locked 🔒</h2>
          <p className="max-w-md font-semibold text-rose-50">
            Ask a parent to unlock FocusPath so you can keep learning.
          </p>
        </div>
      )}

      {/* Daily screen-time reached (unskippable) */}
      {isKid && limitReachedRef.current && (
        <div className="fixed inset-0 z-[110] bg-slate-900 text-white flex flex-col items-center justify-center gap-4 p-8 text-center">
          <Moon className="w-16 h-16 text-indigo-300" />
          <h2 className="text-3xl font-extrabold">Great work today! 🌙</h2>
          <p className="max-w-md font-semibold text-slate-200">
            You&apos;ve reached today&apos;s screen-time limit. Time to rest — come back tomorrow, or ask a parent.
          </p>
        </div>
      )}

      {/* Unskippable eye-break overlay */}
      {isKid && !limitReachedRef.current && onBreakRef.current && (
        <div className="fixed inset-0 z-[100] bg-indigo-600 text-white flex flex-col items-center justify-center gap-4 p-8 text-center">
          <Eye className="w-16 h-16" />
          <h2 className="text-3xl font-extrabold">Eye-Break Time! 👀</h2>
          <p className="max-w-md font-semibold text-indigo-50">
            Look at something about 20 feet away for 20 seconds to rest your eyes.
          </p>
          <div className="text-6xl font-black tabular-nums">{breakRef.current}</div>
          <p className="text-sm text-indigo-100/90">This break can&apos;t be skipped 💙</p>
        </div>
      )}
    </>
  );
}
