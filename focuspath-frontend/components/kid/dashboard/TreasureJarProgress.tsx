'use client';

import React from 'react';

interface TreasureJarProgressProps {
  level: number;
  currentStars: number;
  nextLevelStars?: number;
}

export default function TreasureJarProgress({
  level,
  currentStars,
  nextLevelStars = 50,
}: TreasureJarProgressProps) {
  const percentage = Math.min(100, Math.round((currentStars % nextLevelStars / nextLevelStars) * 100));

  return (
    <div className="relative w-20 h-20 shrink-0 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full border-2 border-white/40 p-1 shadow-inner group cursor-pointer hover:scale-105 transition-transform">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-white/20"
          strokeWidth="3.5"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="text-amber-300 transition-all duration-1000 ease-out"
          strokeDasharray={`${percentage}, 100`}
          strokeWidth="3.5"
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-100">LVL</span>
        <span className="text-lg font-black text-white leading-none animate-kid-count-up">{level}</span>
      </div>
    </div>
  );
}
