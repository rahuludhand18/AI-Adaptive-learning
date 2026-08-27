'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { GradientInsightCard } from '@/components/ui/GradientInsightCard';
import { StatCard } from '@/components/ui/StatCard';
import { useFocusStore } from '@/store/useFocusStore';
import { COPY } from '@/constants/copy';
import { WEEKLY_TREND, TimeBlock } from '@/services/focusApi';
import { apiRequest } from '@/lib/api';
import { listSessions, sessionToTimeBlock, listSubjects, Subject } from '@/lib/plannerApi';
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  Sparkles,
  Timer,
  Plus,
  Trophy,
  ArrowRight,
  Lightbulb,
  Moon,
  Sun,
} from 'lucide-react';

export default function AdultDashboardPage() {
  const router = useRouter();
  const {
    timetable,
    startSession,
    dashboardView,
    setDashboardView,
    dailyTasks,
    toggleTask,
    addTask,
    reflectionText,
    setReflectionText,
  } = useFocusStore();

  // real data for the dashboard: today's blocks + weekly focus trend
  const [todayBlocks, setTodayBlocks] = useState<TimeBlock[]>([]);
  const [activeSubjects, setActiveSubjects] = useState<Subject[]>([]);
  const [trend, setTrend] = useState(WEEKLY_TREND);
  const [analytics, setAnalytics] = useState<{ avg_focus_score: number; total_study_minutes: number; sessions: number; completion_rate: number } | null>(null);

  useEffect(() => {
    const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0..Sun=6
    listSessions()
      .then((ts) =>
        setTodayBlocks(
          ts.map(sessionToTimeBlock).filter((b) => b.dayIndex === todayIdx),
        ),
      )
      .catch(() => {});
    listSubjects()
      .then((subs) => setActiveSubjects(subs))
      .catch(() => {});
    apiRequest<{ weekly_focus: { day: string; score: number }[]; avg_focus_score: number; total_study_minutes: number; sessions: number; completion_rate: number }>('/api/analytics/adult/')
      .then((a) => {
        if (a.weekly_focus?.length) setTrend(a.weekly_focus);
        setAnalytics({ avg_focus_score: a.avg_focus_score, total_study_minutes: a.total_study_minutes, sessions: a.sessions, completion_rate: a.completion_rate });
      })
      .catch(() => {});
  }, []);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);


  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle.trim(), 'Unplanned activity');
    setNewTaskTitle('');
    setShowAddForm(false);
  };

  const handleSaveReflection = () => {
    router.push('/adult/progress');
  };

  const completedBlocks = todayBlocks.filter((b) => b.status === 'completed').length;
  const totalBlocks = todayBlocks.length;
  const completedTasksCount = dailyTasks.filter((t) => t.completed).length;
  const totalTasksCount = dailyTasks.length;
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="min-h-screen bg-bg dark:bg-[#0b0f17] flex flex-col font-sans antialiased text-textPrimary dark:text-slate-100 transition-colors">
      <TopNav />

      <PageContainer>
        {/* Morning / Evening View Switcher Banner */}
        <div className="flex items-center justify-between pb-2 border-b border-border dark:border-slate-800">
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-border dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setDashboardView('morning')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                dashboardView === 'morning'
                  ? 'bg-indigo text-white shadow-sm'
                  : 'text-textSecondary dark:text-slate-400 hover:text-textPrimary dark:hover:text-slate-100'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Daily Overview</span>
            </button>
            <button
              onClick={() => setDashboardView('evening')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                dashboardView === 'evening'
                  ? 'bg-indigo text-white shadow-sm'
                  : 'text-textSecondary dark:text-slate-400 hover:text-textPrimary dark:hover:text-slate-100'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Evening Reflection</span>
            </button>
          </div>

        </div>

        {dashboardView === 'morning' ? (
          /* --- MORNING VIEW --- */
          <div className="space-y-6">
            {/* Header Info */}
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold text-textPrimary dark:text-slate-100 tracking-tight">
                {COPY.dashboardMorning.heading}
              </h1>
              <p className="text-sm text-textSecondary dark:text-slate-400 font-normal">
                {COPY.dashboardMorning.subheading}
              </p>
            </div>

            {/* Row of 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Focus Score ProgressRing */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-border dark:border-slate-800 shadow-card flex flex-col items-center justify-between text-center min-h-[280px]">
                <span className="text-xs font-bold text-textSecondary dark:text-slate-400 uppercase tracking-wider">
                  {COPY.dashboardMorning.focusScoreTitle}
                </span>

                <div className="my-2">
                  <ProgressRing
                    value={analytics?.avg_focus_score ?? 0}
                    label={COPY.dashboardMorning.focusScoreStatus}
                    color="#4F46E5"
                    size={150}
                    strokeWidth={12}
                  />
                </div>

                <p className="text-xs text-textSecondary dark:text-slate-400 font-normal max-w-[200px]">
                  Average of your recent focus sessions.
                </p>
              </div>

              {/* Card 2: Total Subjects Overview */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-border dark:border-slate-800 shadow-card flex flex-col items-center justify-center text-center min-h-[280px]">
                <span className="text-xs font-bold text-textSecondary dark:text-slate-400 uppercase tracking-wider mb-4">
                  Subject Overview
                </span>
                
                <div className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo flex items-center justify-center border-4 border-indigo-100 dark:border-indigo-800 mb-4">
                  <span className="text-3xl font-black">{activeSubjects.length}</span>
                </div>
                
                <h3 className="text-lg font-bold text-textPrimary dark:text-slate-100">
                  Active Subjects
                </h3>
                <p className="text-xs text-textSecondary dark:text-slate-400 font-medium max-w-[200px] mt-2">
                  You are currently tracking and studying {activeSubjects.length} subjects.
                </p>
                <button
                  onClick={() => router.push('/adult/onboarding')}
                  className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
                >
                  Manage Subjects
                </button>
              </div>

              {/* Card 3: Today's Timetable List */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-border dark:border-slate-800 shadow-card flex flex-col justify-between min-h-[280px]">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border dark:border-slate-800">
                    <h3 className="text-base font-bold text-textPrimary dark:text-slate-100">
                      {COPY.dashboardMorning.timetableTitle}
                    </h3>
                    <Link
                      href="/adult/planner"
                      className="text-xs font-semibold text-indigo hover:underline"
                    >
                      {COPY.dashboardMorning.timetableLink}
                    </Link>
                  </div>

                  {/* List of 3 blocks */}
                  <div className="space-y-2.5">
                    {todayBlocks.length === 0 && (
                      <p className="text-xs text-textSecondary dark:text-slate-400 py-3 text-center">
                        No blocks scheduled for today.
                      </p>
                    )}
                    {todayBlocks.slice(0, 3).map((block) => (
                      <div
                        key={block.id}
                        onClick={() => {
                          startSession(block.id);
                          router.push('/adult/focus');
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          block.status === 'completed'
                            ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                            : block.status === 'active'
                            ? 'bg-indigo-light/60 border-indigo text-indigo font-medium shadow-sm'
                            : 'bg-white dark:bg-slate-800/40 border-border dark:border-slate-800 hover:border-indigo/40 text-textPrimary dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {block.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : block.status === 'active' ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo animate-pulse shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-textSecondary dark:text-slate-400 shrink-0" />
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-xs font-bold text-textPrimary dark:text-slate-100">{block.title}</h4>
                              {block.moduleTitle && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                                  {block.moduleTitle}
                                </span>
                              )}
                              {block.plan_type && (
                                <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                  block.plan_type.toLowerCase() === 'study' 
                                    ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' 
                                    : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
                                }`}>
                                  {block.plan_type}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-textSecondary dark:text-slate-400 line-clamp-1 mt-0.5 font-medium">{block.subtitle}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">{block.timeRange}</p>
                          </div>
                        </div>

                        <PlayCircle className="w-4 h-4 text-indigo hover:scale-110 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 pt-3 border-t border-border dark:border-slate-800 space-y-1.5">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo h-full rounded-full transition-all duration-500"
                      style={{ width: `${totalBlocks ? (completedBlocks / totalBlocks) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-textSecondary dark:text-slate-400 text-right font-medium">
                    {completedBlocks} of {totalBlocks} blocks completed
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Row: Concentration Trend Chart (Left) + Stat Cards Stacked (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Weekly Concentration Trend Chart (8 cols) */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-border dark:border-slate-800 shadow-card flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-textPrimary dark:text-slate-100">
                      {COPY.dashboardMorning.trendTitle}
                    </h3>
                    <p className="text-xs text-textSecondary dark:text-slate-400">
                      {COPY.dashboardMorning.trendSubtitle}
                    </p>
                  </div>

                  <select className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-xs font-semibold text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo">
                    <option>Last 7 Days</option>
                    <option>Last 14 Days</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>

                {/* Recharts Area Chart */}
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} domain={[60, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#4F46E5"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#indigoGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Stacked Stat Cards Right (4 cols) */}
              <div className="lg:col-span-4 flex flex-col space-y-6 justify-between">
                <StatCard
                  title={COPY.dashboardMorning.statStudyHours}
                  value={analytics ? `${(analytics.total_study_minutes / 60).toFixed(1)}h` : '0h'}
                  subtitle="Target: 35.0h / week"
                  className="flex-1"
                />

                <StatCard
                  title={COPY.dashboardMorning.statDeepSessions}
                  value={analytics ? String(analytics.sessions) : '0'}
                  subtitle="Average length: 45 min"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Bottom Wide Ergonomic Pro Tip Card */}
            <div className="bg-indigo-light/50 dark:bg-indigo-950/30 rounded-2xl p-6 border border-indigo/20 shadow-card flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-64 h-40 rounded-xl overflow-hidden shadow-sm shrink-0 relative bg-slate-200 dark:bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80"
                  alt="Workspace setup"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo text-white shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
                  <span>{COPY.dashboardMorning.proTipBadge}</span>
                </div>

                <h3 className="text-lg font-bold text-textPrimary dark:text-slate-100">
                  {COPY.dashboardMorning.proTipTitle}
                </h3>

                <p className="text-xs text-textSecondary dark:text-slate-400 leading-relaxed">
                  {COPY.dashboardMorning.proTipBody}
                </p>

                <button className="py-2.5 px-5 bg-indigo text-white text-xs font-semibold rounded-xl hover:bg-indigo-dark transition-all shadow-md active:scale-95 cursor-pointer">
                  {COPY.dashboardMorning.proTipBtn}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* --- EVENING REFLECTION VIEW --- */
          <div className="space-y-6">
            {/* Header Info */}
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-textPrimary dark:text-slate-100 tracking-tight">
                {COPY.dashboardEvening.heading}
              </h1>
              <p className="text-sm text-textSecondary dark:text-slate-400 font-normal">
                {COPY.dashboardEvening.subheading}
              </p>
            </div>

            {/* Weekly Goal Completion Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-border dark:border-slate-800 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textSecondary dark:text-slate-400 uppercase tracking-wider">
                  {COPY.dashboardEvening.goalTitle}
                </span>
                <span className="text-base font-extrabold text-indigo">{analytics?.completion_rate ?? 0}%</span>
              </div>

              {/* Solid Blue Horizontal Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo h-full rounded-full transition-all duration-700"
                  style={{ width: `${analytics?.completion_rate ?? 0}%` }}
                />
              </div>

              {/* Day Dot Indicators */}
              <div className="flex justify-between items-center pt-2">
                {weekDays.map((day, idx) => {
                  const isDone = (trend[idx]?.score ?? 0) > 0;
                  return (
                    <div key={day} className="flex flex-col items-center space-y-1.5">
                      <span className="text-[10px] font-bold text-textSecondary dark:text-slate-400">{day}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isDone ? 'bg-indigo' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Daily Tasks Checklist (7 cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-border dark:border-slate-800 shadow-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 mb-4">
                    <h3 className="text-base font-bold text-textPrimary dark:text-slate-100">
                      {COPY.dashboardEvening.tasksTitle}
                    </h3>
                    <span className="text-xs font-bold text-textSecondary dark:text-slate-400">
                      {completedTasksCount} of {totalTasksCount} completed
                    </span>
                  </div>

                  {/* Checklist items */}
                  <div className="space-y-3">
                    {dailyTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center space-x-3.5 ${
                          task.completed
                            ? 'bg-slate-50/50 dark:bg-slate-800/40 border-border dark:border-slate-800 text-slate-400 dark:text-slate-500'
                            : 'bg-white dark:bg-slate-850 border-border dark:border-slate-800 hover:border-indigo/40 text-textPrimary dark:text-slate-200'
                        }`}
                      >
                        <button className="shrink-0 cursor-pointer">
                          {task.completed ? (
                            <div className="w-5 h-5 rounded-md bg-indigo text-white flex items-center justify-center text-xs font-bold">
                              ✓
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600" />
                          )}
                        </button>

                        <div className="flex-1">
                          <h4 className={`text-sm font-bold ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-textPrimary dark:text-slate-200'}`}>
                            {task.title}
                          </h4>
                          {task.subtitle && (
                            <p className={`text-xs mt-0.5 ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-textSecondary dark:text-slate-400'}`}>
                              {task.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add custom task affordance */}
                <div className="mt-6 pt-4 border-t border-border/60 dark:border-slate-800">
                  {showAddForm ? (
                    <form onSubmit={handleAddNewTask} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Task title..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-xs text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo font-medium"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="py-2 px-4 bg-indigo text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Add
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="text-xs font-bold text-indigo hover:underline flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{COPY.dashboardEvening.addTaskBtn}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column (5 cols) */}
              <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
                {/* Well Done! Card */}
                <div className="bg-indigo text-white rounded-2xl p-6 shadow-md space-y-4">
                  <h3 className="text-xl font-bold">Today&apos;s Summary</h3>
                  <p className="text-xs text-white/90 leading-relaxed font-normal">
                    Your focus score and task completion, based on your real study sessions.
                  </p>

                  {/* Stat pair (real) */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="text-[10px] text-white/70 font-bold uppercase block">FOCUS SCORE</span>
                      <span className="text-2xl font-black mt-0.5 block">{analytics?.avg_focus_score ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/70 font-bold uppercase block">COMPLETION</span>
                      <span className="text-2xl font-black mt-0.5 block">{analytics ? `${analytics.completion_rate}%` : '0%'}</span>
                    </div>
                  </div>
                </div>

                {/* Daily Reflection Textarea Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-border dark:border-slate-800 shadow-card space-y-3">
                  <h3 className="text-xs font-bold text-textPrimary dark:text-slate-200">
                    {COPY.dashboardEvening.reflectionTitle}
                  </h3>
                  <textarea
                    rows={4}
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder={COPY.dashboardEvening.reflectionPlaceholder}
                    className="w-full p-3.5 bg-indigo-light/30 dark:bg-slate-800/80 border border-border dark:border-slate-700 rounded-xl text-xs text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo transition-all resize-none font-medium"
                  />
                </div>

                {/* Teal Pro Tip Card with Pinned Save & Update Plan Button */}
                <div className="relative">
                  <div className="bg-teal-light/80 dark:bg-teal-950/40 border border-teal/30 dark:border-teal-800/40 rounded-2xl p-5 shadow-sm space-y-2 pr-28">
                    <div className="flex items-center space-x-2 text-teal-900 dark:text-teal-300 font-bold text-xs">
                      <Lightbulb className="w-4 h-4 text-teal" />
                      <span>{COPY.dashboardEvening.proTipTitle}</span>
                    </div>
                    <p className="text-[11px] text-teal-800 dark:text-teal-300/90 leading-tight">
                      {COPY.dashboardEvening.proTipBody}
                    </p>
                  </div>

                  {/* Pinned Action Button */}
                  <button
                    onClick={handleSaveReflection}
                    className="absolute -bottom-3 right-3 py-3 px-6 bg-indigo text-white font-bold text-xs rounded-xl hover:bg-indigo-dark transition-all shadow-lg active:scale-95 flex items-center space-x-2 z-10 cursor-pointer"
                  >
                    <span>{COPY.dashboardEvening.saveBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Circular Timer Button (Bottom-Right) */}
        <button
          onClick={() => {
            const firstUpcoming = timetable.find((b) => b.status === 'active') || timetable[0];
            if (firstUpcoming) {
              startSession(firstUpcoming.id);
              router.push('/adult/focus');
            }
          }}
          className="fixed bottom-8 right-8 w-14 h-14 bg-indigo text-white rounded-full shadow-2xl hover:bg-indigo-dark hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-40 group cursor-pointer"
          title="Start Active Study Session"
        >
          <Timer className="w-7 h-7 group-hover:rotate-12 transition-transform" />
        </button>
      </PageContainer>
    </div>
  );
}
