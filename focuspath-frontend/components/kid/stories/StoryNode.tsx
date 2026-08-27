'use client';

import React from 'react';
import { Lock, Play, Check, Star, CheckCircle2 } from 'lucide-react';

export interface StoryNodeProps {
  id: number;
  title: string;
  icon: string;
  difficulty: 1 | 2 | 3;
  rewardStars: number;
  status: 'locked' | 'current' | 'completed';
  themeColor: 'pink' | 'sky' | 'grass' | 'violet';
  onPlay: () => void;
}

export default function StoryNode({
  id,
  title,
  icon,
  difficulty,
  rewardStars,
  status,
  themeColor,
  onPlay,
}: StoryNodeProps) {
  const isLocked = status === 'locked';
  const isCurrent = status === 'current';
  const isCompleted = status === 'completed';

  // Theme color maps for nodes and badges
  const borderColors = {
    pink: 'border-pink-400 dark:border-pink-500',
    sky: 'border-sky-400 dark:border-sky-500',
    grass: 'border-emerald-400 dark:border-emerald-500',
    violet: 'border-purple-400 dark:border-purple-500',
  };

  const nodeBgColors = {
    pink: 'bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300',
    sky: 'bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300',
    grass: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300',
    violet: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300',
  };

  const statusPills = {
    pink: 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-950 border-pink-300',
    sky: 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950 border-sky-300',
    grass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 border-emerald-300',
    violet: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950 border-purple-300',
  };

  return (
    <div className="flex flex-col items-center text-center space-y-3 relative z-10 my-4 select-none">
      
      {/* Node Button & Mascot Overlay */}
      <div className="relative group">
        
        {/* Buddy Owl Mascot next to CURRENT Node */}
        {isCurrent && (
          <div className="absolute -top-12 -left-12 z-20 animate-kid-bob flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-300 shadow-md">
            <span className="text-2xl">🦉</span>
            <span className="text-[9px] font-extrabold text-amber-950 dark:text-amber-200">Start Here!</span>
          </div>
        )}

        {/* Circular Node Ring Frame */}
        <button
          disabled={isLocked}
          onClick={onPlay}
          className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 p-2 bg-white dark:bg-slate-900 shadow-xl transition-all duration-300 relative flex flex-col items-center justify-center ${
            isLocked
              ? 'border-slate-300 dark:border-slate-700 opacity-60 grayscale cursor-not-allowed'
              : isCurrent
              ? `${borderColors[themeColor]} cursor-pointer animate-kid-pulse-glow hover:scale-110 shadow-2xl`
              : `${borderColors[themeColor]} cursor-pointer hover:scale-105 shadow-md animate-kid-shine`
          }`}
        >
          <div className={`w-full h-full rounded-full flex flex-col items-center justify-center ${nodeBgColors[themeColor]}`}>
            <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform">{icon}</span>
          </div>

          {/* Badge Overlay (Lock vs Play vs Checkmark) */}
          {isLocked ? (
            <div className="absolute inset-0 rounded-full bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center">
              <Lock className="h-7 w-7 text-white" />
            </div>
          ) : isCurrent ? (
            <div className="absolute -top-1 -right-1 w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg group-hover:scale-115 transition-all border-2 border-white animate-pulse">
              <Play className="h-5 w-5 fill-white ml-0.5" />
            </div>
          ) : (
            <div className="absolute -top-1 -right-1 w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white animate-kid-bounce-subtle">
              <Check className="h-6 w-6 stroke-[3]" />
            </div>
          )}

          {/* Star Bounty Token Chip */}
          <div className="absolute -bottom-2 bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-950 text-[10px] font-extrabold px-3 py-0.5 rounded-full border border-amber-300 shadow-sm flex items-center gap-0.5">
            <span>+</span>
            <span>{rewardStars}★</span>
          </div>
        </button>

      </div>

      {/* Node Info: Title, Status Pill, & Difficulty Stars */}
      <div className="space-y-1 max-w-[200px]">
        <h3 className={`text-sm font-extrabold ${isLocked ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
          {title}
        </h3>

        {/* Status Pill */}
        <div>
          {isCompleted ? (
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-300">
              <CheckCircle2 className="h-3 w-3" /> COMPLETED ✓
            </span>
          ) : isCurrent ? (
            <span className={`text-[10px] font-extrabold tracking-wider uppercase inline-block px-2.5 py-0.5 rounded-full border ${statusPills[themeColor]}`}>
              READY TO PLAY
            </span>
          ) : (
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase inline-block bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
              LOCKED
            </span>
          )}
        </div>

        {/* Difficulty Indicator Stars (1-3) */}
        <div className="flex items-center justify-center gap-0.5 pt-0.5">
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={`w-3 h-3 ${
                starIdx <= difficulty
                  ? 'fill-amber-400 text-amber-500'
                  : 'text-slate-300 dark:text-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
