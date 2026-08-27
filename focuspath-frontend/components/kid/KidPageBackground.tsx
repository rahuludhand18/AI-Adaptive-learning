'use client';

import React from 'react';

export type KidTheme = 'orange' | 'sky' | 'grass' | 'bubblegum' | 'sun' | 'violet';

interface KidPageBackgroundProps {
  theme?: KidTheme;
  quiet?: boolean;
}

const THEME_CONFIGS: Record<KidTheme, {
  bgLight: string;
  bgDark: string;
  blob1Light: string;
  blob1Dark: string;
  blob2Light: string;
  blob2Dark: string;
  blob3Light: string;
  blob3Dark: string;
  patternEmoji: string[];
}> = {
  orange: {
    bgLight: 'from-orange-100/70 via-amber-50/50 to-kid-cream/90',
    bgDark: 'from-[#0b0f17] via-[#1a130f] to-[#121620]',
    blob1Light: '#ffedd5', // orange-100
    blob1Dark: 'rgba(249, 115, 22, 0.12)',
    blob2Light: '#fef3c7', // amber-100
    blob2Dark: 'rgba(245, 158, 11, 0.10)',
    blob3Light: '#fed7aa', // orange-200
    blob3Dark: 'rgba(234, 88, 12, 0.08)',
    patternEmoji: ['☁️', '✨', '⭐', '🎈'],
  },
  sky: {
    bgLight: 'from-sky-100/70 via-blue-50/50 to-indigo-50/40',
    bgDark: 'from-[#0b0f17] via-[#0f172a] to-[#111c33]',
    blob1Light: '#e0f2fe', // sky-100
    blob1Dark: 'rgba(56, 189, 248, 0.12)',
    blob2Light: '#dbeafe', // blue-100
    blob2Dark: 'rgba(59, 130, 246, 0.10)',
    blob3Light: '#bae6fd', // sky-200
    blob3Dark: 'rgba(14, 165, 233, 0.08)',
    patternEmoji: ['☁️', '🌤️', '✨', '⭐'],
  },
  grass: {
    bgLight: 'from-emerald-100/70 via-teal-50/50 to-lime-50/40',
    bgDark: 'from-[#0b0f17] via-[#0c1f19] to-[#10241b]',
    blob1Light: '#d1fae5', // emerald-100
    blob1Dark: 'rgba(74, 222, 128, 0.12)',
    blob2Light: '#ccfbf1', // teal-100
    blob2Dark: 'rgba(20, 184, 166, 0.10)',
    blob3Light: '#a7f3d0', // emerald-200
    blob3Dark: 'rgba(16, 185, 129, 0.08)',
    patternEmoji: ['🍃', '🌿', '🌱', '✨'],
  },
  bubblegum: {
    bgLight: 'from-pink-100/70 via-rose-50/50 to-purple-50/40',
    bgDark: 'from-[#0b0f17] via-[#20101a] to-[#1b1224]',
    blob1Light: '#fce7f3', // pink-100
    blob1Dark: 'rgba(244, 114, 182, 0.12)',
    blob2Light: '#ffe4e6', // rose-100
    blob2Dark: 'rgba(244, 63, 94, 0.10)',
    blob3Light: '#fbcfe8', // pink-200
    blob3Dark: 'rgba(236, 72, 153, 0.08)',
    patternEmoji: ['🌸', '✨', '💖', '⭐'],
  },
  sun: {
    bgLight: 'from-amber-100/70 via-yellow-50/60 to-orange-50/40',
    bgDark: 'from-[#0b0f17] via-[#1c180e] to-[#171b24]',
    blob1Light: '#fef3c7', // amber-100
    blob1Dark: 'rgba(250, 204, 21, 0.12)',
    blob2Light: '#fef9c3', // yellow-100
    blob2Dark: 'rgba(245, 158, 11, 0.10)',
    blob3Light: '#fde68a', // amber-200
    blob3Dark: 'rgba(217, 119, 6, 0.08)',
    patternEmoji: ['⭐', '🌟', '✨', '☀️'],
  },
  violet: {
    bgLight: 'from-purple-100/70 via-violet-50/60 to-indigo-50/40',
    bgDark: 'from-[#0b0f17] via-[#18112b] to-[#121629]',
    blob1Light: '#f3e8ff', // purple-100
    blob1Dark: 'rgba(167, 139, 250, 0.12)',
    blob2Light: '#ede9fe', // violet-100
    blob2Dark: 'rgba(139, 92, 246, 0.10)',
    blob3Light: '#e9d5ff', // purple-200
    blob3Dark: 'rgba(124, 58, 237, 0.08)',
    patternEmoji: ['🔮', '✨', '⭐', '🌙'],
  },
};

export default function KidPageBackground({ theme = 'orange', quiet = false }: KidPageBackgroundProps) {
  const config = THEME_CONFIGS[theme] || THEME_CONFIGS.orange;

  if (quiet) {
    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden transition-colors duration-500"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-indigo-50/30 to-slate-50 dark:from-[#0b0f17] dark:via-[#0f172a] dark:to-[#0b0f17]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-sky-200/20 dark:bg-sky-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-indigo-200/20 dark:bg-indigo-500/5 blur-3xl" />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden transition-colors duration-500"
      aria-hidden="true"
    >
      {/* Base Gradient backdrop */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgLight} dark:${config.bgDark}`} />

      {/* Layered SVG Blob Shapes */}
      <svg className="absolute -top-24 -right-24 w-[550px] h-[550px] opacity-70 dark:opacity-60 transition-all duration-700" viewBox="0 0 200 200">
        <path
          d="M39.9,-67.7C50.8,-59.8,58.3,-46.8,65.4,-33.5C72.5,-20.2,79.2,-6.6,78.5,6.8C77.8,20.2,69.7,33.4,59.8,44.2C49.9,55,38.2,63.4,24.8,68.2C11.4,73,-3.7,74.2,-18.2,70.9C-32.7,67.6,-46.6,59.8,-57.1,48.5C-67.6,37.2,-74.7,22.4,-76.3,6.7C-77.9,-9,-74.1,-25.6,-64.8,-37.9C-55.5,-50.2,-40.7,-58.2,-26.7,-64.4C-12.7,-70.6,0.5,-75,14.2,-73.2C27.9,-71.4,29,-75.6,39.9,-67.7Z"
          transform="translate(100 100)"
          className="fill-[var(--blob1)]"
          style={{
            ['--blob1' as string]: config.blob1Light,
          }}
        />
      </svg>

      <svg className="absolute -bottom-32 -left-28 w-[600px] h-[600px] opacity-60 dark:opacity-50 transition-all duration-700" viewBox="0 0 200 200">
        <path
          d="M48.2,-73.6C60.6,-64.8,67.6,-48.1,72.4,-31.8C77.2,-15.5,79.8,0.4,76.5,15.2C73.2,30,64,43.7,52.3,53.8C40.6,63.9,26.4,70.4,10.6,73.5C-5.2,76.6,-22.6,76.3,-37.2,69.4C-51.8,62.5,-63.6,49,-70.8,33.4C-78,17.8,-80.6,0.1,-77.2,-16.1C-73.8,-32.3,-64.4,-47,-51.6,-56.3C-38.8,-65.6,-22.6,-69.5,-4.8,-68.8C13,-68.1,35.8,-82.4,48.2,-73.6Z"
          transform="translate(100 100)"
          className="fill-[var(--blob2)]"
          style={{
            ['--blob2' as string]: config.blob2Light,
          }}
        />
      </svg>

      <svg className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-40 dark:opacity-30 blur-2xl transition-all duration-700" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" fill={config.blob3Light} />
      </svg>

      {/* Soft Floating Decorative Pattern Overlay */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <div className="absolute top-[8%] left-[12%] text-2xl animate-kid-float">{config.patternEmoji[0]}</div>
        <div className="absolute top-[18%] right-[15%] text-xl animate-kid-bob" style={{ animationDelay: '0.4s' }}>{config.patternEmoji[1]}</div>
        <div className="absolute bottom-[25%] left-[8%] text-xl animate-kid-wiggle" style={{ animationDelay: '0.8s' }}>{config.patternEmoji[2]}</div>
        <div className="absolute bottom-[12%] right-[10%] text-2xl animate-kid-float" style={{ animationDelay: '1.2s' }}>{config.patternEmoji[3]}</div>
      </div>
    </div>
  );
}
