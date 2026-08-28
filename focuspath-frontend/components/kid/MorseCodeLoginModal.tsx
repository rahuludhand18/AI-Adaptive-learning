'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { setCookie } from '@/lib/api';

// Helper for cookie setup if needed
const setCookieValue = (name: string, value: string, days = 7) => {
  if (typeof window !== 'undefined') {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
  }
};

const MORSE_CODE_ALPHABET: Record<string, string> = {
  A: '• —', B: '— • • •', C: '— • — •', D: '— • •',
  E: '•', F: '• • — •', G: '— — •', H: '• • • •',
  I: '• •', J: '• — — —', K: '— • —', L: '• — • •',
  M: '— —', N: '— •', O: '— — —', P: '• — — •',
  Q: '— — • —', R: '• — •', S: '• • •', T: '—',
  U: '• • —', V: '• • • —', W: '• — —', X: '— • • —',
  Y: '— • — —', Z: '— — • •',
};

interface MorseCodeLoginModalProps {
  child: any;
  onClose: () => void;
}

export default function MorseCodeLoginModal({ child, onClose }: MorseCodeLoginModalProps) {
  const router = useRouter();
  const [taps, setTaps] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(false);

  const pin = (child.kid_pin_plain || child.pin || '').toUpperCase();
  const targetMorse = pin.split('').map((char: string) => (MORSE_CODE_ALPHABET[char] || '').replace(/ /g, '')).join('');

  const handleTap = (symbol: '•' | '—') => {
    if (checking || error || taps.length >= targetMorse.length) return;
    
    const newTaps = [...taps, symbol];
    setTaps(newTaps);
    setError(false);
    
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(symbol === '•' ? 40 : 120);
    }
    
    const currentPattern = newTaps.join('');
    
    if (currentPattern === targetMorse) {
      setChecking(true);
      setCookieValue('activeRole', 'child');
      if (typeof window !== 'undefined') {
        localStorage.setItem('activeChildId', child.id.toString());
        localStorage.setItem('activeChildProfile', JSON.stringify(child));
      }
      // NOTE: Do NOT call setAuth(child,...) here — that would overwrite the parent's
      // JWT user cookie with the child's KID profile, breaking the parent's next login.
      setTimeout(() => {
        router.push('/kid/dashboard');
      }, 500);
    } else if (!targetMorse.startsWith(currentPattern)) {
      setError(true);
      setTimeout(() => {
        setTaps([]);
        setError(false);
      }, 500);
    }
  };

  // Render the alphabet grid
  const letters = Object.keys(MORSE_CODE_ALPHABET);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-hidden select-none">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 flex gap-8">
        
        {/* Left Side - Interactive Login */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative min-h-[400px]">
          <button
            onClick={onClose}
            className="absolute top-0 left-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-500 text-3xl font-bold mb-4 shadow-sm border border-emerald-100">
            {child.username ? child.username.charAt(0).toUpperCase() : 'C'}
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">
            Welcome, {child.username}!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-12">
            Enter your secret 3-letter password to play!
          </p>

          <div className="flex flex-wrap justify-center items-center gap-2 w-full max-w-[320px] mx-auto mb-8">
            {Array.from({ length: Math.max(1, targetMorse.length) }).map((_, i) => (
              <div 
                key={i}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center font-extrabold text-xl shadow-sm transition-all ${
                  taps[i] 
                    ? 'bg-emerald-500 border-emerald-500 text-white animate-in zoom-in' 
                    : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400'
                } ${error ? 'border-rose-400 bg-rose-50 text-rose-500 animate-shake' : ''}`}
              >
                {taps[i] || ''}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 w-full px-4">
            <button
              onClick={() => handleTap('•')}
              className="flex-1 h-20 rounded-[28px] bg-[#0ea5e9] hover:bg-[#0284c7] active:scale-95 text-white font-extrabold text-lg shadow-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border-b-4 border-[#0369a1]"
            >
              <span className="text-3xl mt-2">•</span>
              <span className="text-[10px] tracking-widest uppercase">Short</span>
            </button>
            <button
              onClick={() => handleTap('—')}
              className="flex-1 h-20 rounded-[28px] bg-[#f97316] hover:bg-[#ea580c] active:scale-95 text-white font-extrabold text-lg shadow-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border-b-4 border-[#c2410c]"
            >
              <span className="text-3xl mt-2">—</span>
              <span className="text-[10px] tracking-widest uppercase">Long</span>
            </button>
          </div>
        </div>

        {/* Right Side - Morse Code Grid */}
        <div className="w-[380px] bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/50 flex flex-col">
          <h3 className="text-center font-bold text-slate-800 dark:text-slate-200 text-sm mb-6 uppercase tracking-wider">
            Morse Code Alphabet
          </h3>
          <div className="grid grid-cols-4 gap-y-6 gap-x-2">
            {letters.map((letter) => (
              <div key={letter} className="flex flex-col items-center justify-center text-center w-full gap-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">{letter}</span>
                <div className="whitespace-nowrap tracking-widest text-slate-600 dark:text-slate-400 font-bold text-xs md:text-sm">
                  {MORSE_CODE_ALPHABET[letter]}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
