'use client';

import React from 'react';

export default function DashboardBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden transition-colors duration-700"
      aria-hidden="true"
    >
      {/* Light Mode: Soft orange -> peach -> sun-yellow diagonal gradient wash */}
      {/* Dark Mode: Deep navy -> indigo night sky gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/80 via-amber-50/70 to-yellow-100/60 dark:from-[#0b0f17] dark:via-[#131b2a] dark:to-[#0f172a]" />

      {/* Drifting SVG Blobs Layer */}
      <svg className="absolute -top-32 -right-32 w-[600px] h-[600px] opacity-40 dark:opacity-20 animate-kid-float" viewBox="0 0 200 200">
        <path
          d="M44.7,-76.4C58.8,-69.3,71.8,-58.5,79.6,-44.7C87.4,-30.9,90,-14.1,88.4,2.1C86.8,18.3,81,33.9,71.8,47C62.6,60.1,50.1,70.7,35.8,77.1C21.5,83.5,5.5,85.7,-10.8,84C-27.1,82.3,-43.7,76.7,-57.4,66.8C-71.1,56.9,-81.9,42.7,-86.3,26.8C-90.7,10.9,-88.7,-6.7,-82.4,-22.4C-76.1,-38.1,-65.5,-51.9,-52,-59.5C-38.5,-67.1,-22.1,-68.5,-5.8,-60.5C10.5,-52.5,30.6,-83.5,44.7,-76.4Z"
          transform="translate(100 100)"
          className="fill-orange-300 dark:fill-orange-500"
        />
      </svg>

      <svg className="absolute -bottom-40 -left-40 w-[650px] h-[650px] opacity-35 dark:opacity-15 animate-kid-bob" viewBox="0 0 200 200" style={{ animationDelay: '1s' }}>
        <path
          d="M41.5,-71.3C53.7,-64.2,63.7,-53.4,70.9,-40.7C78.1,-28,82.5,-13.4,81.4,0.6C80.3,14.6,73.7,28,64.9,39.6C56.1,51.2,45.1,61,32.4,67.6C19.7,74.2,5.3,77.6,-8.7,76.1C-22.7,74.6,-36.3,68.2,-48.2,59.3C-60.1,50.4,-70.3,39,-75.6,25.4C-80.9,11.8,-81.3,-4,-76.4,-18.2C-71.5,-32.4,-61.3,-45,-49.2,-52.5C-37.1,-60,-23.1,-62.4,-8.6,-61.1C5.9,-59.8,29.3,-78.4,41.5,-71.3Z"
          transform="translate(100 100)"
          className="fill-amber-300 dark:fill-amber-500"
        />
      </svg>

      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-25 dark:opacity-10 blur-3xl" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" className="fill-yellow-300 dark:fill-yellow-500" />
      </svg>

      {/* Sparse Scattered Sparkle / Star Dot Pattern Overlay */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20 select-none">
        <div className="absolute top-[6%] left-[8%] text-2xl animate-kid-float">⭐</div>
        <div className="absolute top-[14%] right-[12%] text-xl animate-kid-bob" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute top-[40%] left-[4%] text-lg animate-kid-wiggle" style={{ animationDelay: '1.2s' }}>🌟</div>
        <div className="absolute top-[65%] right-[6%] text-2xl animate-kid-float" style={{ animationDelay: '0.8s' }}>✨</div>
        <div className="absolute bottom-[10%] left-[15%] text-xl animate-kid-bob" style={{ animationDelay: '1.5s' }}>⭐</div>
        <div className="absolute bottom-[18%] right-[25%] text-lg animate-kid-wiggle" style={{ animationDelay: '0.3s' }}>🌟</div>
      </div>
    </div>
  );
}
