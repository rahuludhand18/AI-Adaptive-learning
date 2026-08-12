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
import { useAuthStore } from '@/store/authStore';
import { COPY } from '@/constants/copy';
import { focusApi, WEEKLY_TREND } from '@/services/focusApi';
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
  const { user } = useAuthStore();
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

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedMsg, setOptimizedMsg] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSavingReflection, setIsSavingReflection] = useState(false);

  useEffect(() => {
    if (!user) {
      useAuthStore.getState().setAuth(
        { id: 1, username: 'Alex', email: 'alex@example.com', role: 'ADULT', is_locked: false, tab_switch_count: 0, temporary_session_until: null },
        'token',
        'refresh'
      );
    }
  }, [user]);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    const res = await focusApi.applyOptimization('sug-1');
    setIsOptimizing(false);
    setOptimizedMsg(res.message);
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle.trim(), 'Unplanned activity');
    setNewTaskTitle('');
    setShowAddForm(false);
  };

  const handleSaveReflection = async () => {
    setIsSavingReflection(true);
    const completedIds = dailyTasks.filter((t) => t.completed).map((t) => t.id);
    const res = await focusApi.saveReflection(reflectionText, completedIds);
    setIsSavingReflection(false);

    if (res.requiresRebuild) {
      router.push('/adult/planner/rebuild');
    } else {
      router.push('/adult/planner');
    }
  };

  const completedBlocks = timetable.filter((b) => b.status === 'completed').length;
  const totalBlocks = timetable.length;
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

          {dashboardView === 'evening' && (
            <div className="inline-flex items-center space-x-2 bg-indigo-light text-indigo font-bold text-xs px-4 py-1.5 rounded-xl border border-indigo/20">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>{COPY.dashboardEvening.streakBadge}</span>
            </div>
          )}
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
                    value={85}
                    label={COPY.dashboardMorning.focusScoreStatus}
                    color="#4F46E5"
                    size={150}
                    strokeWidth={12}
                  />
                </div>

                <p className="text-xs text-textSecondary dark:text-slate-400 font-normal max-w-[200px]">
                  {COPY.dashboardMorning.focusScoreNote}
                </p>
              </div>

              {/* Card 2: AI Suggestion GradientInsightCard */}
              <div className="min-h-[280px] flex">
                <GradientInsightCard
                  title={COPY.dashboardMorning.aiTitle}
                  body={optimizedMsg || COPY.dashboardMorning.aiBody}
                  btnText={COPY.dashboardMorning.aiBtn}
                  onBtnClick={handleOptimize}
                  isLoading={isOptimizing}
                  variant="indigo"
                />
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
                    {timetable.slice(0, 3).map((block) => (
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
                            <h4 className="text-xs font-bold">{block.title}</h4>
                            <p className="text-[11px] opacity-75">{block.timeRange}</p>
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
                      style={{ width: `${(completedBlocks / totalBlocks) * 100}%` }}
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
                    <AreaChart data={WEEKLY_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  value="32.4h"
                  trend={{ value: "12%", isUp: true }}
                  subtitle="Target: 35.0h / week"
                  className="flex-1"
                />

                <StatCard
                  title={COPY.dashboardMorning.statDeepSessions}
                  value="14"
                  trend={{ value: "2", isUp: false }}
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
                <span className="text-base font-extrabold text-indigo">82%</span>
              </div>

              {/* Solid Blue Horizontal Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo h-full rounded-full transition-all duration-700"
                  style={{ width: '82%' }}
                />
              </div>

              {/* Day Dot Indicators */}
              <div className="flex justify-between items-center pt-2">
                {weekDays.map((day, idx) => {
                  const isDone = idx <= 3; // Mon, Tue, Wed, Thu
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
                  <h3 className="text-xl font-bold">{COPY.dashboardEvening.wellDoneTitle}</h3>
                  <p className="text-xs text-white/90 leading-relaxed font-normal">
                    {COPY.dashboardEvening.wellDoneBody}
                  </p>

                  {/* Stat pair */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <span className="text-[10px] text-white/70 font-bold uppercase block">FOCUS SCORE</span>
                      <span className="text-2xl font-black mt-0.5 block">94</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/70 font-bold uppercase block">EFFICIENCY</span>
                      <span className="text-2xl font-black mt-0.5 block">+12%</span>
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
                    disabled={isSavingReflection}
                    className="absolute -bottom-3 right-3 py-3 px-6 bg-indigo text-white font-bold text-xs rounded-xl hover:bg-indigo-dark transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center space-x-2 z-10 cursor-pointer"
                  >
                    {isSavingReflection ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{COPY.dashboardEvening.saveBtn}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
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
