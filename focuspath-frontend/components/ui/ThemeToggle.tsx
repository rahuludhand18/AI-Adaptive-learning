'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

interface ThemeToggleProps {
  variant?: 'icon' | 'pill' | 'compact';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  className = '',
  showLabel = false,
}) => {
  const { theme, toggleTheme, isMounted } = useTheme();

  if (!isMounted) {
    // Avoid layout shift during hydration
    return (
      <div
        className={`w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/90 p-1 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${className}`}
      >
        <span
          className={`pointer-events-none flex h-6 w-6 transform items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-sm ring-0 transition duration-200 ease-in-out ${
            isDark ? 'translate-x-8 text-indigo-400' : 'translate-x-0 text-amber-500'
          }`}
        >
          {isDark ? (
            <Moon className="h-3.5 w-3.5 transition-transform duration-300 rotate-0" />
          ) : (
            <Sun className="h-3.5 w-3.5 transition-transform duration-300 rotate-0" />
          )}
        </span>
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`group relative flex items-center justify-center gap-2 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 transition-all duration-200 shadow-xs cursor-pointer active:scale-95 ${
        variant === 'compact' ? 'w-8 h-8 rounded-lg p-1.5' : 'w-9 h-9'
      } ${className}`}
    >
      <div className="relative w-4.5 h-4.5 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4.5 h-4.5 text-indigo-400 group-hover:text-indigo-300 transition-transform duration-300 group-hover:-rotate-12" />
        ) : (
          <Sun className="w-4.5 h-4.5 text-amber-500 group-hover:text-amber-600 transition-transform duration-300 group-hover:rotate-45" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
};
