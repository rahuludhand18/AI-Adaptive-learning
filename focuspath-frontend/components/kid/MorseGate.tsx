'use client';

import { useState } from 'react';
import { Lock, Sparkles, Delete, LogOut } from 'lucide-react';
import { verifyMorsePattern } from '@/lib/kidApi';

interface MorseGateProps {
  onSuccess: () => void;
  onCancel: () => void; // logs the kid back out
}

// Full-screen "ask a parent" gate shown right after a Kid logs in. A parent taps the
// short/long pattern they configured in Restrictions before the session actually starts —
// this is the enforcement point for "only a parent can start a kid session."
export default function MorseGate({ onSuccess, onCancel }: MorseGateProps) {
  const [taps, setTaps] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [shake, setShake] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const tap = (symbol: '•' | '—') => {
    if (checking) return;
    setTaps((prev) => [...prev, symbol]);
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(symbol === '•' ? 40 : 120);
    }
  };

  const backspace = () => setTaps((prev) => prev.slice(0, -1));

  const handleSubmit = async () => {
    if (taps.length === 0 || checking) return;
    setChecking(true);
    setInfo(null);
    try {
      const res = await verifyMorsePattern(taps.join(''));
      if (!res.configured) {
        setInfo("No parent code is set up yet — go to Restrictions to add one.");
        onSuccess(); // don't lock the kid out just because nothing is configured
        return;
      }
      if (res.correct) {
        onSuccess();
      } else {
        setShake(true);
        setTaps([]);
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setInfo('Could not check the code — try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 overflow-hidden select-none">
      {/* Soft Ambient Floating decoration */}
      <span className="absolute text-5xl top-[8%] left-[10%] animate-kid-float opacity-70">🦁</span>
      <span className="absolute text-4xl top-[12%] right-[10%] animate-kid-bob opacity-70">🐧</span>
      <span className="absolute text-4xl bottom-[10%] left-[12%] animate-kid-wiggle opacity-70">🦋</span>
      <span className="absolute text-5xl bottom-[8%] right-[12%] animate-kid-float opacity-70">🐘</span>

      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[36px] p-7 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200 border-4 border-white/40 dark:border-slate-800">
        <div className="w-18 h-18 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 dark:from-amber-600 dark:to-amber-400 text-amber-950 flex items-center justify-center shadow-lg border-2 border-white animate-kid-bob">
          <Lock className="h-9 w-9" />
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-3 py-1 rounded-full border border-violet-200 dark:border-violet-800">
            Parent Verification
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">Ask a Parent! 🔐</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            A parent needs to tap the secret pattern to start this session.
          </p>
        </div>

        {/* Tapped sequence display (glowing decoded pattern trail) */}
        <div className={`bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-violet-500/10 dark:bg-slate-800/90 border-2 border-orange-200 dark:border-slate-700 rounded-3xl py-4 px-4 min-h-[68px] flex items-center justify-center gap-2 flex-wrap transition-all shadow-inner ${shake ? 'animate-shake' : ''}`}>
          {taps.length > 0 ? (
            taps.map((t, i) => (
              <span key={i} className="text-xl font-extrabold text-amber-950 dark:text-amber-100 bg-gradient-to-b from-amber-300 to-amber-400 dark:from-amber-500 dark:to-amber-700 w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-800 animate-kid-count-up">
                {t}
              </span>
            ))
          ) : (
            <span className="text-xs font-bold text-amber-700/60 dark:text-slate-400 uppercase tracking-wider">Tap secret pattern below</span>
          )}
        </div>

        {info && (
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400">{info}</p>
        )}

        {/* Tactile Circular Tap Pad */}
        <div className="grid grid-cols-2 gap-4 py-1">
          <button
            onClick={() => tap('•')}
            className="h-24 rounded-full bg-gradient-to-b from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 text-white font-extrabold text-3xl shadow-lg hover:shadow-sky-500/30 active:scale-90 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border-4 border-sky-200/50 group"
          >
            <span className="group-hover:animate-kid-wiggle">•</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-sky-100">Dot</span>
          </button>
          <button
            onClick={() => tap('—')}
            className="h-24 rounded-full bg-gradient-to-b from-orange-400 to-amber-600 hover:from-orange-500 hover:to-amber-700 text-white font-extrabold text-3xl shadow-lg hover:shadow-orange-500/30 active:scale-90 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border-4 border-amber-200/50 group"
          >
            <span className="group-hover:animate-kid-wiggle">—</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-100">Dash</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={backspace}
            disabled={taps.length === 0 || checking}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
            title="Remove last tap"
          >
            <Delete className="h-4 w-4" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={taps.length === 0 || checking}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {checking ? 'Checking…' : "Let's Go!"}
          </button>
        </div>

        <button
          onClick={onCancel}
          className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex items-center justify-center gap-1.5 mx-auto cursor-pointer pt-1"
        >
          <LogOut className="h-3.5 w-3.5" /> Not now, log out
        </button>
      </div>
    </div>
  );
}
