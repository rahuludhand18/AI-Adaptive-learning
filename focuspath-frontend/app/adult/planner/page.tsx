'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useTabTracker } from '@/hooks/useTabTracker';
import {
  Brain,
  CheckCircle2,
  Clock,
  Calendar,
  Settings,
  Bell,
  Plus,
  Compass,
  Zap,
  Coffee,
  Grid
} from 'lucide-react';

export default function WeeklyTimetable() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  // Track tab activity
  useTabTracker();

  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedDay, setSelectedDay] = useState('MON');

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
            <button className="h-16 flex items-center text-sm font-semibold border-b-2 border-indigo-600 text-indigo-600 px-1 cursor-pointer">
              Schedule
            </button>
            <button onClick={() => router.push('/adult/analytics')} className="h-16 flex items-center text-sm font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-600 cursor-pointer">
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
        
        {/* Title and Toggles */}
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Weekly Timetable</h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Manage your cognitive load and structure your learning path.
            </p>
          </div>

          {/* View Toggles */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/40">
            <button
              onClick={() => setViewMode('week')}
              className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'week' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'month' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Month View
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-3">
          {[
            { day: 'MON', date: '12' },
            { day: 'TUE', date: '13' },
            { day: 'WED', date: '14' },
            { day: 'THU', date: '15' },
            { day: 'FRI', date: '16' },
            { day: 'SAT', date: '17' },
            { day: 'SUN', date: '18' },
          ].map((item) => (
            <button
              key={item.day}
              onClick={() => setSelectedDay(item.day)}
              className={`rounded-[24px] border p-4 flex flex-col items-center justify-center gap-1 shadow-sm transition-all cursor-pointer ${
                selectedDay === item.day
                  ? 'border-transparent bg-indigo-600 text-white'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
              }`}
            >
              <span className={`text-[10px] font-bold tracking-wider ${selectedDay === item.day ? 'text-white/70' : 'text-slate-400'}`}>
                {item.day}
              </span>
              <span className="text-xl font-extrabold">{item.date}</span>
            </button>
          ))}
        </div>

        {/* Columns Schedule Grid */}
        <div className="grid grid-cols-7 gap-3.5">
          
          {/* MONDAY COLUMN */}
          <div className="col-span-1 space-y-3">
            <div className="bg-indigo-50/50 border border-indigo-200/50 rounded-2xl p-4 space-y-2 relative">
              <span className="text-[9px] font-bold text-indigo-600 block">08:00 - 09:30</span>
              <h4 className="text-xs font-bold text-indigo-700">Data Structures</h4>
              <p className="text-[10px] text-indigo-500 font-semibold leading-relaxed">Linked Lists & Hash Maps</p>
              <CheckCircle2 className="absolute right-3.5 top-3.5 h-4.5 w-4.5 text-indigo-600" />
            </div>

            <div className="bg-purple-50/50 border border-purple-200/50 rounded-2xl p-4 space-y-2 relative">
              <span className="text-[9px] font-bold text-purple-600 block">10:00 - 11:00</span>
              <h4 className="text-xs font-bold text-purple-700">Break</h4>
              <p className="text-[10px] text-purple-500 font-semibold leading-relaxed">Light Reading / Coffee</p>
              <CheckCircle2 className="absolute right-3.5 top-3.5 h-4.5 w-4.5 text-purple-600" />
            </div>

            <div className="bg-white border-2 border-indigo-600 rounded-2xl p-4 space-y-2 relative shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-indigo-600">11:30 - 13:00</span>
                <span className="text-[8px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 py-0.5 px-2 rounded-full">
                  CURRENT
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800">System Design</h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Scalability Patterns</p>
              <div className="w-full bg-slate-100 rounded-full h-1 mt-2">
                <div className="bg-indigo-600 h-1 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-2xl p-4 space-y-2">
              <span className="text-[9px] font-bold text-emerald-600 block">14:00 - 15:30</span>
              <h4 className="text-xs font-bold text-emerald-700">Project Alpha</h4>
              <p className="text-[10px] text-emerald-500 font-semibold leading-relaxed">Architecture Review</p>
            </div>
          </div>

          {/* TUESDAY COLUMN */}
          <div className="col-span-1 space-y-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="text-[9px] font-bold text-slate-400 block">09:00 - 11:00</span>
              <h4 className="text-xs font-bold text-slate-800">Microservices</h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">gRPC Integration</p>
            </div>

            <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-4 space-y-2">
              <span className="text-[9px] font-bold text-amber-600 block">11:30 - 12:30</span>
              <h4 className="text-xs font-bold text-amber-700">Yoga Flow</h4>
              <p className="text-[10px] text-amber-500 font-semibold leading-relaxed">Active Recovery</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="text-[9px] font-bold text-slate-400 block">14:00 - 16:00</span>
              <h4 className="text-xs font-bold text-slate-800">Cloud Security</h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">IAM Policies</p>
            </div>
          </div>

          {/* WEDNESDAY COLUMN */}
          <div className="col-span-1 space-y-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="text-[9px] font-bold text-slate-400 block">08:30 - 10:30</span>
              <h4 className="text-xs font-bold text-slate-800">Full Stack Dev</h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Component Lifecycle</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="text-[9px] font-bold text-slate-400 block">11:00 - 13:00</span>
              <h4 className="text-xs font-bold text-slate-800">Deep Work</h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Algorithm Practice</p>
            </div>
          </div>

          {/* THURSDAY COLUMN */}
          <div className="col-span-1 space-y-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="text-[9px] font-bold text-slate-400 block">09:00 - 10:30</span>
              <h4 className="text-xs font-bold text-slate-800">API Design</h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">REST vs GraphQL</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="text-[9px] font-bold text-slate-400 block">14:00 - 15:30</span>
              <h4 className="text-xs font-bold text-slate-800">Database</h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Query Optimization</p>
            </div>
          </div>

          {/* FRIDAY COLUMN */}
          <div className="col-span-1 space-y-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="text-[9px] font-bold text-slate-400 block">10:00 - 12:00</span>
              <h4 className="text-xs font-bold text-slate-800">Weekly Review</h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Progress Tracking</p>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-200/50 rounded-2xl p-4 space-y-2">
              <span className="text-[9px] font-bold text-indigo-600 block">13:00 - 15:00</span>
              <h4 className="text-xs font-bold text-indigo-700">Mentorship</h4>
              <p className="text-[10px] text-indigo-500 font-semibold leading-relaxed">Code Reviews</p>
            </div>
          </div>

          {/* SATURDAY COLUMN (FLEX DAY) */}
          <div className="col-span-1">
            <div className="border border-dashed border-slate-300 bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[120px]">
              <Calendar className="h-5 w-5 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Flex Day</span>
            </div>
          </div>

          {/* SUNDAY COLUMN (REST DAY) */}
          <div className="col-span-1">
            <div className="border border-dashed border-slate-300 bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[120px]">
              <Coffee className="h-5 w-5 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Rest Day</span>
            </div>
          </div>

        </div>

        {/* Weekly Cognitive Load Card (Col span 12) */}
        <div className="rounded-[32px] border border-slate-200 bg-indigo-50/30 p-8 shadow-sm grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800">Weekly Cognitive Load</h3>
              <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                You've reached 64% of your study targets for this week. Keep up the momentum!
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/60 p-4 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Hours</span>
                <span className="text-2xl font-extrabold text-slate-800">24.5</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/60 p-4 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Focus Score</span>
                <span className="text-2xl font-extrabold text-emerald-600">92%</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/60 p-4 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
                <span className="text-2xl font-extrabold text-slate-800">18/24</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/60 p-4 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Streak</span>
                <span className="text-2xl font-extrabold text-amber-700">12 Days</span>
              </div>
            </div>
          </div>

          {/* Radial Progress Chart on Right */}
          <div className="col-span-12 lg:col-span-4 flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="50" className="stroke-slate-200" strokeWidth="8" fill="transparent" />
                <circle
                  cx="64"
                  cy="64"
                  r="50"
                  className="stroke-indigo-600"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 * (1 - 0.64)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-slate-800">64%</span>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Progress</span>
              </div>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
