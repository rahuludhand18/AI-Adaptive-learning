'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useTabTracker } from '@/hooks/useTabTracker';
import {
  Brain,
  Bell,
  Settings,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const mockTrendData = [
  { name: 'Day 1', score: 30 },
  { name: 'Day 5', score: 45 },
  { name: 'Day 10', score: 40 },
  { name: 'Day 15', score: 55 },
  { name: 'Day 20', score: 42 },
  { name: 'Day 25', score: 85 },
  { name: 'Today', score: 60 },
];

export default function PerformanceAnalytics() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  // Track browser focus
  useTabTracker();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans antialiased text-slate-800">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/focuspath_logo.png"
              alt="FocusPath Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="font-bold text-base text-slate-800 tracking-tight">FocusPath</span>
          </div>

          <nav className="flex items-center gap-8 h-full">
            <button onClick={() => router.push('/adult/dashboard')} className="h-16 flex items-center text-sm font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-600 cursor-pointer">
              Dashboard
            </button>
            <button onClick={() => router.push('/adult/planner')} className="h-16 flex items-center text-sm font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-600 cursor-pointer">
              Schedule
            </button>
            <button className="h-16 flex items-center text-sm font-semibold border-b-2 border-indigo-600 text-indigo-600 px-1 cursor-pointer">
              Insights
            </button>
            <button onClick={() => router.push('/adult/reports')} className="h-16 flex items-center text-sm font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-600 cursor-pointer">
              Community
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <Bell className="h-5 w-5" />
            </button>
            <button onClick={() => router.push('/parent/restrictions')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <Settings className="h-5 w-5" />
            </button>
            <button 
              onClick={() => { logout(); router.push('/auth/login'); }}
              className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 cursor-pointer"
            >
              {user.username.slice(0,2).toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl space-y-6 p-6">
        
        {/* Title */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">
              ADULT MODE • ANALYTICS
            </span>
            <h2 className="text-2xl font-bold text-slate-900">Performance Deep-Dive</h2>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Timeframe:</span>
            <select className="border border-slate-200 rounded-xl text-xs font-bold py-1.5 px-3 bg-white text-slate-500 outline-none">
              <option>Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Top 3 Cards Row */}
        <div className="grid grid-cols-12 gap-5">
          
          {/* Card 1: Total Deep Work (Col 3) */}
          <div className="col-span-12 md:col-span-3 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Deep Work
            </span>
            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-slate-800">124h</div>
              <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                12% from last month
              </span>
            </div>
          </div>

          {/* Card 2: Avg Daily Focus (Col 3) */}
          <div className="col-span-12 md:col-span-3 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Avg. Daily Focus
            </span>
            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-slate-800">4.2h</div>
              <span className="text-[9px] font-semibold text-slate-400 block">
                ⏱ Peak performance: 10AM
              </span>
            </div>
          </div>

          {/* Card 3: 14 Day Streak Card (Col 6) */}
          <div className="col-span-12 md:col-span-6 rounded-[32px] border border-transparent bg-indigo-600 text-white p-6 shadow-sm flex items-center justify-between min-h-[140px] relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center">
              <Settings className="w-32 h-32 text-white" />
            </div>
            
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2">
                <Flame className="h-6 w-6 text-white fill-white" />
                <span className="text-lg font-bold">14 Day Streak</span>
              </div>
              <p className="text-xs text-white/80 font-semibold leading-relaxed max-w-sm">
                You're in the top 5% of learners this week. Keep the momentum going!
              </p>
            </div>
          </div>

          {/* Wave Chart: Focus Score Trend (Col span 12) */}
          <div className="col-span-12 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">Focus Score Trend</h3>
                <p className="text-xs text-slate-400 font-semibold">Measured peak cognitive state performance</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <span>Focus Index</span>
              </div>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockTrendData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight={600} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3.5} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject-wise Completion (Col span 7) */}
          <div className="col-span-12 md:col-span-7 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Subject-wise Completion</h3>
            
            <div className="space-y-4">
              {[
                { name: 'Mathematics', percent: 82 },
                { name: 'Cognitive Psychology', percent: 64 },
                { name: 'Data Science', percent: 41 },
                { name: 'Behavioral Economics', percent: 92 },
              ].map((sub, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{sub.name}</span>
                    <span>{sub.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${sub.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Focus AI Suggestion & Next Up (Col span 5) */}
          <div className="col-span-12 md:col-span-5 flex flex-col gap-5">
            
            {/* AI Suggestion Card */}
            <div className="rounded-[32px] border border-slate-200 bg-indigo-50/50 p-8 shadow-sm flex flex-col justify-between items-center text-center space-y-4 min-h-[220px]">
              <div className="bg-white p-2.5 rounded-full shadow-sm w-fit border border-indigo-100">
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-slate-800">Focus AI Suggestion</h4>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  Based on your trend, morning sessions yield 15% more productivity.
                </p>
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-sm cursor-pointer transition-colors">
                Schedule Morning Focus
              </button>
            </div>

            {/* Next Up Card */}
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="bg-teal-50 text-teal-600 p-3 rounded-2xl">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">NEXT UP</span>
                  <h4 className="text-xs font-bold text-slate-800">Neural Networks Part 2</h4>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Starts in 15m</span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </div>

          </div>

        </div>
      </main>

    </div>
  );
}
