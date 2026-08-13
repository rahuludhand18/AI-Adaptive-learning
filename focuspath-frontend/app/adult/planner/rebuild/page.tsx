'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { COPY } from '@/constants/copy';
import { rebuildSchedule, acceptRebuild, RebuiltTask } from '@/lib/plannerApi';
import {
  CheckCircle2,
  XCircle,
  ChevronsRight,
  RotateCcw,
  Calendar,
  Lightbulb,
  Loader2,
} from 'lucide-react';

// Format an ISO start/end pair as "Mon, Jul 14, 02:00 PM - 03:30 PM"
function fmtRange(startISO: string, endISO: string): string {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const day = s.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const t = (d: Date) => d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${t(s)} - ${t(e)}`;
}

export default function RebuildPlanPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<RebuiltTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [noMissed, setNoMissed] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState('');

  // run the real rebuild on mount: detect missed tasks + get the proposed plan
  useEffect(() => {
    (async () => {
      try {
        const res = await rebuildSchedule();
        const rt = (res.rebuilt_tasks || []).filter((t) => t.achievable);
        setTasks(rt);
        if (!res.rebuilt_tasks || res.rebuilt_tasks.length === 0) setNoMissed(true);
      } catch {
        setError('Could not run the schedule rebuild. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAcceptNewPlan = async () => {
    setIsAccepting(true);
    setError('');
    try {
      await acceptRebuild(
        tasks.map((t) => ({ task_id: t.task_id, proposed_start: t.proposed_start, proposed_end: t.proposed_end }))
      );
      router.push('/adult/planner');
    } catch {
      setError('Could not apply the new plan. Please try again.');
      setIsAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg dark:bg-[#0b0f17] flex flex-col font-sans antialiased text-textPrimary dark:text-slate-100 transition-colors">
      <TopNav />

      <PageContainer>
        {/* Top Header */}
        <div className="space-y-1 mb-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-textPrimary dark:text-slate-100 tracking-tight">
            {COPY.rebuild.heading}
          </h1>
          <p className="text-sm text-textSecondary dark:text-slate-400 font-normal">
            {COPY.rebuild.subheading}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 text-textSecondary dark:text-slate-400 font-semibold py-16">
            <Loader2 className="w-5 h-5 animate-spin" /> Checking your schedule…
          </div>
        ) : noMissed ? (
          /* Nothing missed — schedule already up to date */
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-border dark:border-slate-800 shadow-card text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-textPrimary dark:text-slate-100">You&apos;re all caught up!</h3>
            <p className="text-xs text-textSecondary dark:text-slate-400 max-w-md mx-auto">
              No missed sessions were detected, so your schedule is already up to date.
            </p>
            <button
              onClick={() => router.push('/adult/planner')}
              className="mt-2 py-2.5 px-6 bg-indigo text-white font-bold text-xs rounded-xl hover:bg-indigo-dark transition-all cursor-pointer"
            >
              Back to Planner
            </button>
          </div>
        ) : (
          <>
            {/* Teal Banner */}
            <div className="bg-teal-light dark:bg-teal-950/40 border border-teal/30 dark:border-teal-800/40 text-teal-900 dark:text-teal-300 rounded-2xl p-4 shadow-sm flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-teal-800 dark:text-teal-200">
                {COPY.rebuild.banner}
              </span>
            </div>

            {/* Two-Column Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-start">

              {/* Original Plan Column (5 cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border dark:border-slate-800 shadow-card space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/60 dark:border-slate-800">
                  <h3 className="text-base font-bold text-textSecondary dark:text-slate-400">
                    {COPY.rebuild.originalTitle}
                  </h3>
                  <span className="text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full uppercase">
                    MISSED
                  </span>
                </div>

                <div className="space-y-4">
                  {tasks.map((t, i) => (
                    <div key={t.task_id} className={`flex items-start space-x-3 text-xs ${i > 0 ? 'pt-3 border-t border-slate-100 dark:border-slate-800' : ''}`}>
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-textPrimary dark:text-slate-100">{t.title}</h4>
                        <p className="text-textSecondary dark:text-slate-400 text-[11px]">{fmtRange(t.original_start, t.original_end)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center Connector Icon (1 col) */}
              <div className="lg:col-span-1 flex justify-center py-4 lg:py-16">
                <div className="w-12 h-12 rounded-full bg-indigo text-white flex items-center justify-center shadow-lg shadow-indigo/20">
                  <ChevronsRight className="w-6 h-6" />
                </div>
              </div>

              {/* Rebuilt Plan Column (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-indigo dark:border-indigo-500 shadow-card space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border/60 dark:border-slate-800">
                    <h3 className="text-base font-bold text-indigo dark:text-indigo-400">
                      {COPY.rebuild.rebuiltTitle}
                    </h3>
                    <span className="text-[10px] font-extrabold bg-indigo text-white px-2.5 py-0.5 rounded-full uppercase shadow-sm">
                      OPTIMAL
                    </span>
                  </div>

                  <div className="space-y-4">
                    {tasks.map((t, i) => (
                      <div key={t.task_id} className={`flex items-start justify-between text-xs ${i > 0 ? 'pt-3 border-t border-slate-100 dark:border-slate-800' : ''}`}>
                        <div className="flex items-start space-x-3">
                          {i === 0 ? (
                            <RotateCcw className="w-4 h-4 text-indigo dark:text-indigo-400 shrink-0 mt-0.5" />
                          ) : (
                            <Calendar className="w-4 h-4 text-indigo dark:text-indigo-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <h4 className="font-bold text-textPrimary dark:text-slate-100">{t.title}</h4>
                            <p className="text-indigo dark:text-indigo-400 font-medium text-[11px]">{fmtRange(t.proposed_start, t.proposed_end)}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-extrabold bg-teal text-white px-2 py-0.5 rounded-md uppercase shrink-0">
                          RE-SCHEDULED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety Margin Maintained Card */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border dark:border-slate-800 shadow-card flex items-center space-x-4">
                  <ProgressRing value={100} color="#4F46E5" size={56} strokeWidth={6} />
                  <div>
                    <h4 className="text-xs font-bold text-textPrimary dark:text-slate-100">{COPY.rebuild.safetyTitle}</h4>
                    <p className="text-[11px] text-textSecondary dark:text-slate-400 mt-0.5">{COPY.rebuild.safetyDesc}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Centered Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 py-4">
              <button
                onClick={handleAcceptNewPlan}
                disabled={isAccepting}
                className="py-3 px-8 bg-indigo text-white font-bold text-xs rounded-xl hover:bg-indigo-dark transition-all shadow-md active:scale-95 disabled:opacity-50 min-w-[160px] cursor-pointer"
              >
                {isAccepting ? 'Applying...' : COPY.rebuild.acceptBtn}
              </button>

              <button
                onClick={() => router.push('/adult/planner')}
                className="py-3 px-8 bg-white dark:bg-slate-800 border-2 border-indigo/40 dark:border-indigo-500/40 text-indigo dark:text-indigo-400 font-bold text-xs rounded-xl hover:bg-indigo-light/50 dark:hover:bg-indigo-950/50 transition-colors min-w-[160px] cursor-pointer"
              >
                {COPY.rebuild.adjustBtn}
              </button>
            </div>

            {/* Tip Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-card border border-border dark:border-slate-800 h-48 flex items-end">
              <img
                src="https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&auto=format&fit=crop&q=80"
                alt="Workspace desk with tablet and coffee"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
              <div className="relative z-10 p-6 text-white flex items-center space-x-3">
                <Lightbulb className="w-5 h-5 text-amber-300 shrink-0" />
                <p className="text-xs sm:text-sm font-semibold text-white/95">{COPY.rebuild.tipBody}</p>
              </div>
            </div>
          </>
        )}
      </PageContainer>
    </div>
  );
}
