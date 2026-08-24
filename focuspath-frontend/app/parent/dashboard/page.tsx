'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ParentLayout from '@/components/layout/ParentLayout';
import { apiRequest } from '@/lib/api';
import { getChildActivity, ChildActivity } from '@/lib/parentApi';
import {
  Clock,
  Eye,
  Star,
  BookOpen,
  Calculator,
  Globe,
  Shield,
  LogOut,
  AlertCircle,
} from 'lucide-react';

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

const fmtAway = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.round(seconds / 60);
  return `${m} min`;
};

export default function ParentDashboardPage() {
  const router = useRouter();

  // real per-child analytics (first linked child)
  const [child, setChild] = useState<{ avg_focus_score: number; stars: number; study_minutes: number; sessions: number; badges: number } | null>(null);
  useEffect(() => {
    apiRequest<{ children: { avg_focus_score: number; stars: number; study_minutes: number; sessions: number; badges: number }[] }>('/api/analytics/parent/')
      .then((res) => setChild(res.children?.[0] || null))
      .catch(() => {});
  }, []);
  const focus = child?.avg_focus_score ?? 0;
  const stars = child?.stars ?? 0;
  const studyHours = child ? (child.study_minutes / 60).toFixed(1) : '0.0';
  const sessions = child?.sessions ?? 0;
  const badges = child?.badges ?? 0;
  const ringOffset = Math.round(264 * (1 - focus / 100));

  // real "left the app / came back" log, so a parent can see exactly when + how long
  const [activity, setActivity] = useState<ChildActivity | null>(null);
  useEffect(() => {
    apiRequest<{ id: number }[]>('/api/parents/kids/')
      .then((kids) => {
        if (kids.length) return getChildActivity(kids[0].id).then(setActivity);
      })
      .catch(() => {});
  }, []);

  return (
    <ParentLayout pendingRequestsCount={1}>
      <div className="space-y-6">
        
        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Parent Dashboard</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Monitoring your child's learning journey
          </p>
        </div>

        {/* Row 1: Weekly Focus Score Ring & Daily Study Time Chart */}
        <div className="grid grid-cols-12 gap-5">
          
          {/* Card 1: Weekly Focus Score (Col 4) */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 shadow-2xs flex flex-col items-center justify-between min-h-[260px]">
            <div className="relative w-36 h-36 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="text-indigo-600 dark:text-indigo-500"
                  strokeWidth="10"
                  strokeDasharray="264"
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{focus}</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">SCORE</span>
              </div>
            </div>

            <div className="text-center space-y-1 mt-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Weekly Focus</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Average focus score across your child&apos;s recent study sessions.
              </p>
            </div>
          </div>

          {/* Card 2: Daily Study Time (Col 8) */}
          <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 shadow-2xs flex flex-col justify-between min-h-[260px]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Learning Summary</h3>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">All time</span>
            </div>

            {/* Real per-child learning stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="bg-slate-50/60 dark:bg-slate-800/60 rounded-2xl p-5 text-center">
                <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{studyHours}h</div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">Total study time</div>
              </div>
              <div className="bg-slate-50/60 dark:bg-slate-800/60 rounded-2xl p-5 text-center">
                <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{sessions}</div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">Focus sessions</div>
              </div>
              <div className="bg-slate-50/60 dark:bg-slate-800/60 rounded-2xl p-5 text-center">
                <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{badges}</div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">Badges earned</div>
              </div>
            </div>
          </div>

        </div>

        {/* Row 2: Screen Time, Eye Breaks / Stars Earned, Most Used Apps */}
        <div className="grid grid-cols-12 gap-5">
          
          {/* Screen Time vs Daily Limit Card (Col 4) */}
          <div className="col-span-12 lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Study Time</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">total logged</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{studyHours}</span>
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">hours studied</span>
              </div>
            </div>

            {/* Content note */}
            <div className="bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100/70 dark:border-indigo-900/40 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                CONTENT
              </span>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Curated, parent-approved only</p>
            </div>
          </div>

          {/* Stacked Cards: Eye Breaks & Stars Earned (Col 3) */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            
            {/* Eye Breaks */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[24px] p-4 shadow-2xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Eye className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Eye Breaks</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">On</span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">20-20-20</span>
                </div>
              </div>
            </div>

            {/* Stars Earned */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[24px] p-4 shadow-2xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Star className="h-5.5 w-5.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Stars Earned</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{stars}</span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">total</span>
                </div>
              </div>
            </div>

          </div>

          {/* Most Used Learning Apps Card (Col 5) */}
          <div className="col-span-12 lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Learning Overview</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/60">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Focus sessions</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{sessions}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/60">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Total study time</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{studyHours}h</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/60">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Badges earned</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{badges}</span>
              </div>
            </div>
          </div>

        </div>

        {/* App Activity: when the child left FocusPath and for how long */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">App Activity</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">When your child left FocusPath and for how long</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{activity?.switches_today ?? 0}</div>
                <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">today</div>
              </div>
              <div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{activity?.switches_last_7_days ?? 0}</div>
                <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">last 7 days</div>
              </div>
            </div>
          </div>

          {activity?.still_away_since && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 rounded-2xl px-4 py-2.5 text-xs font-bold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Currently away — left at {fmtTime(activity.still_away_since)}
            </div>
          )}

          {activity && activity.sessions.length > 0 ? (
            <div className="max-h-56 overflow-y-auto space-y-2">
              {activity.sessions.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/60 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    Left {fmtTime(s.left_at)} → Back {fmtTime(s.returned_at)}
                  </span>
                  <span className="font-semibold text-slate-400 dark:text-slate-500">away {fmtAway(s.away_seconds)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 text-center py-4">
              No app-switching detected in the last 7 days.
            </p>
          )}
        </div>

        {/* Row 3: Weekly Performance Trends with Overlay Button */}
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Weekly Performance Trends</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Aggregated score based on focus time and curriculum progress.
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500"></span>
                <span className="text-slate-600 dark:text-slate-300">Current</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                <span className="text-slate-400 dark:text-slate-500">Average</span>
              </div>
            </div>
          </div>

          {/* SVG Smooth Curve Line Graph */}
          <div className="w-full h-44 pt-4 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 120" preserveAspectRatio="none">
              {/* Background Gradient Area */}
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              {/* Dotted Average Line */}
              <path
                d="M 10,80 Q 150,75 300,70 T 590,65"
                fill="none"
                stroke="#64748B"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.4"
              />

              {/* Current Trend Filled Area */}
              <path
                d="M 10,80 C 100,78 150,90 220,95 C 290,100 320,30 350,20 C 380,10 400,60 480,15 C 530,-10 570,30 590,20 L 590,120 L 10,120 Z"
                fill="url(#trendGradient)"
              />

              {/* Current Trend Smooth Curve */}
              <path
                d="M 10,80 C 100,78 150,90 220,95 C 290,100 320,30 350,20 C 380,10 400,60 480,15 C 530,-10 570,30 590,20"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data Node Dots */}
              <circle cx="10" cy="80" r="4" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="220" cy="95" r="4" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="350" cy="20" r="5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="480" cy="15" r="5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="590" cy="20" r="5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
            </svg>

            {/* X-Axis Labels */}
            <div className="flex justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 pt-3">
              <span>WK 01</span>
              <span>WK 02</span>
              <span>WK 03</span>
              <span>WK 04</span>
              <span>WK 05</span>
              <span>WK 06</span>
            </div>
          </div>

          {/* Floating Action Button: Manage Restrictions */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={() => router.push('/parent/restrictions')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-6 rounded-full shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Shield className="h-4 w-4 fill-white/20" />
              <span>Manage Restrictions</span>
            </button>
          </div>

        </div>

      </div>
    </ParentLayout>
  );
}
