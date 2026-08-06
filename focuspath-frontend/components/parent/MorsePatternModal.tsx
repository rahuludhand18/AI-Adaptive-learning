'use client';

import { useState } from 'react';
import { X, Smartphone, CheckCircle, RefreshCw, Volume2 } from 'lucide-react';

interface MorsePatternModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPattern?: string;
  onSavePattern: (pattern: string) => void;
}

export default function MorsePatternModal({
  isOpen,
  onClose,
  currentPattern = '••—•',
  onSavePattern,
}: MorsePatternModalProps) {
  const [pattern, setPattern] = useState(currentPattern);
  const [recording, setRecording] = useState(false);
  const [taps, setTaps] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTap = (type: '.' | '-') => {
    const symbol = type === '.' ? '•' : '—';
    const newTaps = [...taps, symbol];
    setTaps(newTaps);

    // Play quick feedback sound effect / vibration if supported
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(type === '.' ? 50 : 150);
    }
  };

  const handleClear = () => {
    setTaps([]);
    setFeedback(null);
  };

  const handleSave = () => {
    const finalPattern = taps.length > 0 ? taps.join('') : pattern;
    onSavePattern(finalPattern);
    setFeedback('Morse pattern updated successfully!');
    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-[32px] p-6 max-w-md w-full shadow-lg space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Morse Code Pattern</h3>
              <p className="text-xs text-slate-400 font-medium">Tactile restriction bypass</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Current / Active Pattern Display */}
        <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-5 text-center space-y-2">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">
            Recorded Sequence
          </span>
          <div className="text-3xl font-black tracking-widest text-amber-900 min-h-[40px] flex items-center justify-center gap-2 font-mono">
            {taps.length > 0 ? (
              taps.map((t, idx) => (
                <span key={idx} className="bg-white px-2 py-1 rounded-lg border border-amber-200 shadow-2xs">
                  {t}
                </span>
              ))
            ) : (
              <span className="text-slate-400 font-normal text-sm">
                Tap short (•) or long (—) below
              </span>
            )}
          </div>
        </div>

        {/* Tap Controls */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTap('.')}
            className="py-4 px-4 rounded-2xl border-2 border-amber-200 bg-white hover:bg-amber-50/50 text-amber-900 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
          >
            <span className="text-xl font-black font-mono">•</span>
            <span>Short Tap (Dot)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTap('-')}
            className="py-4 px-4 rounded-2xl border-2 border-amber-200 bg-white hover:bg-amber-50/50 text-amber-900 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
          >
            <span className="text-xl font-black font-mono">—</span>
            <span>Long Tap (Dash)</span>
          </button>
        </div>

        {feedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {feedback}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleClear}
            className="py-3 px-4 text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={taps.length === 0}
            className="flex-1 py-3 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-2xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            Save Morse Pattern
          </button>
        </div>

      </div>
    </div>
  );
}
