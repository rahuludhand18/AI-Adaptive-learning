'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, FileText, Download, CheckCircle, Clock } from 'lucide-react';

export default function AdultReports() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/adult/dashboard')}
              className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-500 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="bg-primary/5 text-primary p-3 rounded-2xl border border-primary/10">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Academic & Focus Reports</h1>
              <p className="text-xs font-bold text-primary/70 uppercase tracking-widest">
                Compile, preview, and download study summary sheets
              </p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-primary text-white py-3 px-5 rounded-full font-bold text-sm hover:bg-primary/95 transition-all shadow-sm cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export Monthly PDF
          </button>
        </div>

        {/* 12-Column Grid */}
        <div className="grid grid-cols-12 gap-5">
          {/* Main reports overview (Col span 8) */}
          <div className="col-span-12 lg:col-span-8 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Monthly Productivity Summary</h3>
            <div className="space-y-4">
              <div className="border border-slate-100 bg-slate-50/40 rounded-2xl p-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Task Completion Rate</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Percentage of scheduled tasks completed successfully</p>
                  </div>
                </div>
                <span className="text-xl font-extrabold text-slate-800">88.5%</span>
              </div>

              <div className="border border-slate-100 bg-slate-50/40 rounded-2xl p-5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Focus Session Length Average</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Average uninterrupted study duration (minutes)</p>
                  </div>
                </div>
                <span className="text-xl font-extrabold text-slate-800">38.4 Mins</span>
              </div>
            </div>
          </div>

          {/* Quick analysis insights (Col span 4) */}
          <div className="col-span-12 lg:col-span-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800">AI Insight</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                You work most efficiently in the morning (8 AM - 11 AM) with an average focus score of 92/100.
                Consider scheduling high-priority subjects during these hours to maximize memory retention.
              </p>
            </div>
            <div className="border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400">
              FocusPath AI Advisor • Version 1.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
