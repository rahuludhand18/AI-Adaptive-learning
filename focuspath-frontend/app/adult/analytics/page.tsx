'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatCard } from '@/components/ui/StatCard';
import { SUBJECT_COMPLETIONS } from '@/services/focusApi';
import { Flame, Sparkles, ArrowRight, Cpu } from 'lucide-react';

const INSIGHTS_TREND = [
  { day: 'Day 1', score: 68 },
  { day: 'Day 5', score: 76 },
  { day: 'Day 10', score: 82 },
  { day: 'Day 15', score: 74 },
  { day: 'Day 20', score: 89 },
  { day: 'Day 25', score: 96 },
  { day: 'Today', score: 94 },
];

export default function AdultAnalyticsPage() {
  const [timeframe, setTimeframe] = useState('Last 30 Days');

  return (
    <div className="min-h-screen bg-bg dark:bg-[#0b0f17] flex flex-col font-sans antialiased text-textPrimary dark:text-slate-100 transition-colors">
      <TopNav />

      <PageContainer>
        {/* Top Eyebrow & Heading Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <span className="text-[11px] font-extrabold text-indigo dark:text-indigo-400 uppercase tracking-widest block mb-1">
              ADULT MODE • ANALYTICS
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-textPrimary dark:text-slate-100 tracking-tight">
              Performance Deep-Dive
            </h1>
          </div>

          {/* Timeframe Dropdown */}
          <div className="flex items-center space-x-2 text-xs font-semibold text-textSecondary dark:text-slate-400 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-border dark:border-slate-800 shadow-sm self-start sm:self-auto">
            <span>Timeframe :</span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="font-bold text-textPrimary dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
            >
              <option className="dark:bg-slate-900">Last 30 Days</option>
              <option className="dark:bg-slate-900">Last 7 Days</option>
              <option className="dark:bg-slate-900">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Row of 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Total Deep Work */}
          <StatCard
            title="Total Deep Work"
            value="124h"
            trend={{ value: "12% from last month", isUp: true }}
          />

          {/* Card 2: Avg. Daily Focus */}
          <StatCard
            title="Avg. Daily Focus"
            value="4.2h"
            subtitle="⏱ Peak performance: 10AM"
          />

          {/* Card 3: 14 Day Streak Card */}
          <div className="bg-indigo text-white rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
            {/* Gear/Brain outline decorative background */}
            <div className="absolute -right-6 -bottom-6 w-36 h-36 opacity-15 pointer-events-none">
              <svg viewBox="0 0 100 100" fill="currentColor">
                <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="8" fill="none" />
                <path d="M50 10 L50 90 M10 50 L90 50" stroke="white" strokeWidth="6" />
              </svg>
            </div>

            <div className="flex items-center space-x-3 z-10">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-300" />
              </div>
              <h3 className="text-lg font-extrabold tracking-tight">14 Day Streak</h3>
            </div>

            <p className="text-xs text-white/90 leading-relaxed mt-4 max-w-xs z-10">
              You're in the top 5% of learners this week. Keep the momentum going!
            </p>
          </div>

        </div>

        {/* Focus Score Trend Line Chart Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-border dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-textPrimary dark:text-slate-100">
                Focus Score Trend
              </h3>
              <p className="text-xs text-textSecondary dark:text-slate-400">
                Measured peak cognitive state performance
              </p>
            </div>

            {/* Legend dot */}
            <div className="flex items-center space-x-2 text-xs font-semibold text-textPrimary dark:text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo inline-block" />
              <span>Focus Index</span>
            </div>
          </div>

          {/* Smooth Recharts Curve */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={INSIGHTS_TREND} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={false} domain={[50, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#purpleGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row: Subject-wise Completion (Left) vs Focus AI Suggestion & Next Up (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Subject-wise Completion (7 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-border dark:border-slate-800 shadow-card space-y-6">
            <h3 className="text-base font-bold text-textPrimary dark:text-slate-100">
              Subject-wise Completion
            </h3>

            <div className="space-y-5 pt-1">
              {SUBJECT_COMPLETIONS.map((item) => (
                <div key={item.subject} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-textPrimary dark:text-slate-200">
                    <span>{item.subject}</span>
                    <span className="text-indigo dark:text-indigo-400">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-indigo h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: AI Suggestion Card + NEXT UP Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
            
            {/* Focus AI Suggestion Card */}
            <div className="bg-indigo-light/70 dark:bg-indigo-950/40 rounded-2xl p-6 border border-indigo/20 shadow-sm text-center flex flex-col items-center justify-between min-h-[220px]">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-indigo dark:text-indigo-400 flex items-center justify-center shadow-sm mb-3">
                <Sparkles className="w-5 h-5" />
              </div>

              <div className="space-y-1 mb-4">
                <h3 className="text-base font-bold text-textPrimary dark:text-slate-100">
                  Focus AI Suggestion
                </h3>
                <p className="text-xs text-textSecondary dark:text-slate-400 leading-relaxed max-w-xs">
                  Based on your trend, morning sessions yield 15% more productivity.
                </p>
              </div>

              <button
                onClick={() => alert('Morning Focus Scheduled!')}
                className="w-full py-3 px-4 bg-indigo text-white font-bold text-xs rounded-xl hover:bg-indigo-dark transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Schedule Morning Focus
              </button>
            </div>

            {/* NEXT UP Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border dark:border-slate-800 shadow-card flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-light dark:bg-teal-950/50 text-teal flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-textSecondary dark:text-slate-400 uppercase tracking-wider block">
                    NEXT UP
                  </span>
                  <h4 className="text-xs font-bold text-textPrimary dark:text-slate-100">Neural Networks Part 2</h4>
                  <p className="text-[11px] text-textSecondary dark:text-slate-400 mt-0.5">Starts in 15m</p>
                </div>
              </div>

              <Link
                href="/adult/focus"
                className="p-2 text-indigo dark:text-indigo-400 hover:text-indigo-dark transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

          </div>

        </div>

      </PageContainer>
    </div>
  );
}
