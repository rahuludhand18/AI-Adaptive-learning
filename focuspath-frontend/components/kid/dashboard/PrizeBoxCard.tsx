'use client';

import React from 'react';
import { Gift, CheckCircle2, Sparkles, Trophy } from 'lucide-react';

interface PrizeBoxCardProps {
  title: string;
  badgeTag: string;
  rewardText: string;
  isClaimed: boolean;
  themeColor?: 'violet' | 'coral';
  onClaim: () => void;
  children?: React.ReactNode;
}

export default function PrizeBoxCard({
  title,
  badgeTag,
  rewardText,
  isClaimed,
  themeColor = 'coral',
  onClaim,
  children,
}: PrizeBoxCardProps) {
  const isViolet = themeColor === 'violet';

  const cardBorder = isViolet
    ? 'border-2 border-purple-300 dark:border-purple-800/80'
    : 'border-2 border-rose-300 dark:border-rose-800/80';

  const cardBg = isViolet
    ? 'bg-gradient-to-br from-purple-50/90 via-indigo-50/40 to-white dark:from-[#0f172a] dark:to-[#131b2a]'
    : 'bg-gradient-to-br from-rose-50/90 via-orange-50/40 to-white dark:from-[#0f172a] dark:to-[#131b2a]';

  const tagColor = isViolet
    ? 'text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800'
    : 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';

  return (
    <div className={`rounded-[32px] ${cardBorder} ${cardBg} p-6 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden transition-all duration-300`}>
      
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-extrabold uppercase tracking-[0.2em] px-3 py-0.5 rounded-full border ${tagColor}`}>
            {badgeTag}
          </span>
          <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1 bg-amber-100 dark:bg-amber-950/60 px-3 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            {rewardText}
          </span>
        </div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 pt-1">
          {title}
        </h3>
      </div>

      {/* Optional Interactive Content (e.g. Brain Booster quiz options) */}
      {children}

      {/* Prize Box Visual Ledge & Claim Action */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Prize Box Icon (Closed vs Open) */}
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md transition-all ${
            isClaimed
              ? 'bg-emerald-500 text-white'
              : isViolet
              ? 'bg-purple-500 text-white animate-kid-pulse-glow'
              : 'bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 animate-kid-pulse-glow'
          }`}>
            {isClaimed ? (
              <Trophy className="h-6 w-6 text-white" />
            ) : (
              <Gift className="h-6 w-6 animate-kid-bob" />
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
              {isClaimed ? 'Prize Unlocked!' : 'Reward Chest'}
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              {isClaimed ? 'Added to Star Vault' : 'Tap to open prize box'}
            </span>
          </div>
        </div>

        <button
          disabled={isClaimed}
          onClick={onClaim}
          className={`text-xs font-extrabold py-2.5 px-5 rounded-full transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5 ${
            isClaimed
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 cursor-default'
              : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 border-2 border-amber-300 animate-kid-bounce-subtle'
          }`}
        >
          {isClaimed ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Claimed</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-amber-950" />
              <span>Claim {rewardText}</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
