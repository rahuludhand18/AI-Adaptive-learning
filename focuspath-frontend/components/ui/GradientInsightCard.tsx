'use client';

import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';

interface GradientInsightCardProps {
  title: string;
  body: string;
  btnText?: string;
  onBtnClick?: () => void;
  icon?: LucideIcon;
  variant?: 'indigo' | 'teal' | 'darkIndigo';
  isLoading?: boolean;
}

export const GradientInsightCard: React.FC<GradientInsightCardProps> = ({
  title,
  body,
  btnText,
  onBtnClick,
  icon: Icon = Sparkles,
  variant = 'indigo',
  isLoading = false,
}) => {
  const gradientStyles = {
    indigo: 'bg-gradient-to-br from-indigo to-indigo-dark text-white',
    teal: 'bg-gradient-to-br from-teal to-emerald-600 text-white',
    darkIndigo: 'bg-gradient-to-br from-indigo-dark via-indigo to-indigo-dark text-white',
  };

  return (
    <div className={`rounded-2xl p-6 shadow-lg flex flex-col justify-between ${gradientStyles[variant]} relative overflow-hidden`}>
      {/* Decorative background glow circle */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-white" />
        </div>

        <h3 className="text-lg font-bold tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-white/90 leading-relaxed font-normal">{body}</p>
      </div>

      {btnText && (
        <div className="mt-6">
          <button
            onClick={onBtnClick}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white text-indigo font-semibold text-sm rounded-xl hover:bg-white/90 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-indigo border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{btnText}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
