'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { COPY } from '@/constants/copy';
import { focusApi } from '@/services/focusApi';
import {
  CheckCircle2,
  XCircle,
  ChevronsRight,
  RotateCcw,
  Zap,
  Calendar,
  Lightbulb,
} from 'lucide-react';

export default function RebuildPlanPage() {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAcceptNewPlan = async () => {
    setIsAccepting(true);
    await focusApi.rebuildPlan();
    setIsAccepting(false);
    router.push('/adult/planner');
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans antialiased text-textPrimary">
      <TopNav />

      <PageContainer>
        {/* Top Header */}
        <div className="space-y-1 mb-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-textPrimary tracking-tight">
            {COPY.rebuild.heading}
          </h1>
          <p className="text-sm text-textSecondary font-normal">
            {COPY.rebuild.subheading}
          </p>
        </div>

        {/* Teal Banner */}
        <div className="bg-teal-light border border-teal/30 text-teal-900 rounded-2xl p-4 shadow-sm flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-teal-800">
            {COPY.rebuild.banner}
          </span>
        </div>

        {/* Two-Column Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-start">
          
          {/* Original Plan Column (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-border shadow-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="text-base font-bold text-textSecondary">
                {COPY.rebuild.originalTitle}
              </h3>
              <span className="text-[10px] font-extrabold bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full uppercase">
                EXPIRED
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-xs">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-textPrimary">Data Structures: Review Trees</h4>
                  <p className="text-textSecondary text-[11px]">Yesterday, 4:00 PM - 5:30 PM</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs pt-3 border-t border-slate-100">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-textPrimary">Calculus III: Practice Set 4</h4>
                  <p className="text-textSecondary text-[11px]">Yesterday, 7:00 PM - 8:30 PM</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs pt-3 border-t border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-textPrimary">Macroeconomics: Quiz prep</h4>
                  <p className="text-textSecondary text-[11px]">Today, 9:00 AM - 10:00 AM</p>
                </div>
              </div>
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
            <div className="bg-white p-6 rounded-2xl border-2 border-indigo shadow-card space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <h3 className="text-base font-bold text-indigo">
                  {COPY.rebuild.rebuiltTitle}
                </h3>
                <span className="text-[10px] font-extrabold bg-indigo text-white px-2.5 py-0.5 rounded-full uppercase shadow-sm">
                  OPTIMAL
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between text-xs">
                  <div className="flex items-start space-x-3">
                    <RotateCcw className="w-4 h-4 text-indigo shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-textPrimary">Data Structures: Review Trees</h4>
                      <p className="text-indigo font-medium text-[11px]">Today, 2:00 PM - 3:30 PM</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-extrabold bg-teal text-white px-2 py-0.5 rounded-md uppercase">
                    RE-SCHEDULED
                  </span>
                </div>

                <div className="flex items-start justify-between text-xs pt-3 border-t border-slate-100">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-4 h-4 text-indigo shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-textPrimary">Calculus III: Practice Set 4</h4>
                      <p className="text-indigo font-medium text-[11px]">Today, 4:00 PM - 5:15 PM (Shortened)</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-extrabold bg-teal text-white px-2 py-0.5 rounded-md uppercase">
                    CONSOLIDATED
                  </span>
                </div>

                <div className="flex items-start space-x-3 text-xs pt-3 border-t border-slate-100">
                  <Calendar className="w-4 h-4 text-textSecondary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-textPrimary">Linear Algebra: Unit 2</h4>
                    <p className="text-textSecondary text-[11px]">Tomorrow, 10:00 AM - 11:30 AM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Margin Maintained Card */}
            <div className="bg-white p-4 rounded-2xl border border-border shadow-card flex items-center space-x-4">
              <ProgressRing
                value={100}
                color="#4F46E5"
                backgroundColor="#EEF2FF"
                size={56}
                strokeWidth={6}
              />
              <div>
                <h4 className="text-xs font-bold text-textPrimary">{COPY.rebuild.safetyTitle}</h4>
                <p className="text-[11px] text-textSecondary mt-0.5">{COPY.rebuild.safetyDesc}</p>
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
            className="py-3 px-8 bg-white border-2 border-indigo/40 text-indigo font-bold text-xs rounded-xl hover:bg-indigo-light/50 transition-colors min-w-[160px] cursor-pointer"
          >
            {COPY.rebuild.adjustBtn}
          </button>
        </div>

        {/* Workspace Desk Photo Card */}
        <div className="relative rounded-2xl overflow-hidden shadow-card border border-border h-48 flex items-end">
          <img
            src="https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&auto=format&fit=crop&q=80"
            alt="Workspace desk with tablet and coffee"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

          <div className="relative z-10 p-6 text-white flex items-center space-x-3">
            <Lightbulb className="w-5 h-5 text-amber-300 shrink-0" />
            <p className="text-xs sm:text-sm font-semibold text-white/95">
              {COPY.rebuild.tipBody}
            </p>
          </div>
        </div>

      </PageContainer>
    </div>
  );
}
