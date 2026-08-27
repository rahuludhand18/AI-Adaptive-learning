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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 overflow-hidden">
      {/* Floating decoration */}
      <span className="absolute text-5xl top-[8%] left-[10%] animate-kid-float opacity-70">🦁</span>
      <span className="absolute text-4xl top-[12%] right-[10%] animate-kid-bob opacity-70">🐧</span>
      <span className="absolute text-4xl bottom-[10%] left-[12%] animate-kid-wiggle opacity-70">🦋</span>
      <span className="absolute text-5xl bottom-[8%] right-[12%] animate-kid-float opacity-70">🐘</span>

      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] p-7 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center animate-kid-bob">
          <Lock className="h-8 w-8" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Ask a Parent! 🔐</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            A parent needs to tap the secret pattern to start this session.
          </p>
        </div>

        {/* Tapped sequence display */}
        <div className={`bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-100 dark:border-indigo-900/40 rounded-2xl py-4 px-3 min-h-[64px] flex items-center justify-center gap-1.5 flex-wrap transition-transform ${shake ? 'animate-shake' : ''}`}>
          {taps.length > 0 ? (
            taps.map((t, i) => (
              <span key={i} className="text-2xl font-black text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm border border-indigo-100 dark:border-indigo-800">
                {t}
              </span>
            ))
          ) : (
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Tap the pattern below</span>
          )}
        </div>

        {info && (
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400">{info}</p>
        )}

        {/* Tap pad */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => tap('•')}
            className="py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-2xl shadow-md active:scale-95 transition-all cursor-pointer flex flex-col items-center gap-1"
          >
            <span>•</span>
            <span className="text-[10px] font-bold uppercase tracking-wide">Short</span>
          </button>
          <button
            onClick={() => tap('—')}
            className="py-5 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black text-2xl shadow-md active:scale-95 transition-all cursor-pointer flex flex-col items-center gap-1"
          >
            <span>—</span>
            <span className="text-[10px] font-bold uppercase tracking-wide">Long</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={backspace}
            disabled={taps.length === 0 || checking}
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
            title="Remove last tap"
          >
            <Delete className="h-4 w-4" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={taps.length === 0 || checking}
            className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {checking ? 'Checking…' : "Let's Go!"}
          </button>
        </div>

        <button
          onClick={onCancel}
          className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" /> Not now, log out
        </button>
      </div>
    </div>
  );
}
