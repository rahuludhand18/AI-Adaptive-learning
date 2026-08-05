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
  Trophy,
  CheckSquare,
  Square,
  Plus,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface Task {
  id: number;
  title: string;
  sub: string;
  completed: boolean;
}

export default function DailyReview() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  // Track visibility states
  useTabTracker();

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Email Triage', sub: 'Cleared priority inbox (30 mins)', completed: true },
    { id: 2, title: 'Architecture Docs', sub: 'Finalized cloud infrastructure diagram', completed: true },
    { id: 3, title: 'Team Sync', sub: 'Discussion on Q3 deliverables', completed: false },
    { id: 4, title: 'Focus Session: Deep Work', sub: '90 minutes achieved', completed: true },
    { id: 5, title: 'Review Pull Requests', sub: '3 pending reviews', completed: false },
  ]);

  const [reflection, setReflection] = useState('');

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleSave = () => {
    alert('Plan and reflection saved successfully!');
    router.push('/adult/dashboard');
  };

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
            <button onClick={() => router.push('/adult/analytics')} className="h-16 flex items-center text-sm font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-600 cursor-pointer">
              Insights
            </button>
            <button className="h-16 flex items-center text-sm font-semibold border-b-2 border-indigo-600 text-indigo-600 px-1 cursor-pointer">
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
        
        {/* Title and Streak badge */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">How did today go?</h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Take a moment to reflect on your progress and calibrate for tomorrow.
            </p>
          </div>
          
          <span className="bg-sky-50 border border-sky-100 text-sky-600 text-xs font-bold py-2.5 px-5 rounded-2xl flex items-center gap-2 shadow-sm">
            <Trophy className="h-4.5 w-4.5" />
            4 Day Streak!
          </span>
        </div>

        {/* Weekly Goal Completion card */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span className="uppercase tracking-wider">Weekly Goal Completion</span>
            <span className="text-indigo-600">82%</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '82%' }}></div>
          </div>

          {/* Days Row */}
          <div className="flex justify-between text-center pt-2">
            {[
              { name: 'MON', active: true },
              { name: 'TUE', active: true },
              { name: 'WED', active: true },
              { name: 'THU', active: true },
              { name: 'FRI', active: false },
              { name: 'SAT', active: false },
              { name: 'SUN', active: false },
            ].map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 w-16">
                <span className="text-[10px] font-bold text-slate-400">{day.name}</span>
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                  day.active
                    ? 'bg-indigo-600 border-transparent'
                    : 'bg-white border-slate-300'
                }`}>
                  {day.active && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 12-Column Layout */}
        <div className="grid grid-cols-12 gap-5">
          
          {/* Daily Tasks List (Col span 7) */}
          <div className="col-span-12 md:col-span-7 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Daily Tasks</h3>
              <span className="text-xs text-slate-400 font-semibold">
                {tasks.filter(t => t.completed).length} of {tasks.length} completed
              </span>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="w-full text-left bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-4 flex items-start gap-3.5 transition-all cursor-pointer"
                >
                  <span className="mt-0.5 shrink-0">
                    {task.completed ? (
                      <CheckSquare className="h-5 w-5 text-indigo-600 fill-indigo-50" />
                    ) : (
                      <Square className="h-5 w-5 text-slate-300" />
                    )}
                  </span>
                  <div>
                    <h4 className={`text-sm font-bold ${task.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-800'}`}>
                      {task.title}
                    </h4>
                    <p className={`text-xs ${task.completed ? 'line-through text-slate-300' : 'text-slate-400 font-medium'} mt-0.5`}>
                      {task.sub}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <button className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1.5 cursor-pointer pt-2">
              <Plus className="h-4 w-4" />
              Add a task you did that wasn't planned
            </button>
          </div>

          {/* Side Panels (Col span 5) */}
          <div className="col-span-12 md:col-span-5 flex flex-col gap-5">
            
            {/* Well Done! Card */}
            <div className="rounded-[32px] border border-transparent bg-indigo-600 text-white p-8 shadow-sm space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl font-bold">Well Done!</h3>
                <p className="text-xs text-white/80 font-semibold leading-relaxed">
                  You hit your primary focus targets today. Consistency is your superpower.
                </p>
              </div>

              <div className="grid grid-cols-2 border-t border-white/10 pt-4 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider block">Focus Score</span>
                  <span className="text-3xl font-extrabold">94</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider block">Efficiency</span>
                  <span className="text-3xl font-extrabold">+12%</span>
                </div>
              </div>
            </div>

            {/* Daily Reflection Card */}
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Daily Reflection</h3>
              <textarea
                placeholder="What was your biggest win or obstacle today?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 py-3.5 px-4 text-xs font-medium outline-none focus:border-indigo-600/40 bg-slate-50/20 min-h-[90px] resize-none"
              />
            </div>

            {/* Pro Tip Card */}
            <div className="rounded-[24px] border border-transparent bg-teal-50/40 p-5 flex items-start gap-3">
              <div className="bg-teal-50 border border-teal-100 text-teal-600 p-2 rounded-xl">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-teal-600 uppercase tracking-wider block">Pro Tip</span>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  Most of your tasks were completed in the morning.
                </p>
              </div>
            </div>

            {/* Save & Update Plan Action */}
            <button
              onClick={handleSave}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-4 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              Save & Update Plan
              <ArrowRight className="h-4.5 w-4.5" />
            </button>

          </div>

        </div>
      </main>

    </div>
  );
}
