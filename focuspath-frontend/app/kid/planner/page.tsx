'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import KidLayout from '@/components/layout/KidLayout';
import KidPageBackground from '@/components/kid/KidPageBackground';
import { PageContainer } from '@/components/layout/PageContainer';
import { useFocusStore } from '@/store/useFocusStore';
import { TimeBlock } from '@/services/focusApi';
import { listSessions, updateSession, sessionToTimeBlock } from '@/lib/plannerApi';
import { apiRequest } from '@/lib/api';
import {
  CheckCircle2,
  Circle,
  Play,
  Coffee,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

// Helper to parse time string ("08:00" or "03:00 PM" or "16:00") into minutes of day
function parseMinutes(timeStr: string): number {
  const m = timeStr.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return 0;
  let hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const ap = m[3]?.toUpperCase();
  if (ap === 'PM' && hh < 12) hh += 12;
  if (ap === 'AM' && hh === 12) hh = 0;
  return hh * 60 + mm;
}

// "HH:MM - HH:MM" -> duration in minutes
function blockMinutes(timeRange: string): number {
  const [start, end] = timeRange.split('-');
  if (!start || !end) return 0;
  return Math.max(0, parseMinutes(end) - parseMinutes(start));
}

// start / end minutes-of-day from a "HH:MM - HH:MM" range
function rangeStartMin(timeRange: string): number {
  const [start] = timeRange.split('-');
  return start ? parseMinutes(start) : 0;
}
function rangeEndMin(timeRange: string): number {
  const [, end] = timeRange.split('-');
  return end ? parseMinutes(end) : 0;
}

export default function KidPlannerPage() {
  const router = useRouter();
  const { startSession } = useFocusStore();

  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [stars, setStars] = useState(0);

  const loadBlocks = async () => {
    try {
      const [sessions, wallet] = await Promise.all([
        listSessions(),
        apiRequest<{ balance: number }>('/api/rewards/wallet/').catch(() => ({ balance: 0 })),
      ]);
      setBlocks(sessions.map(sessionToTimeBlock));
      setStars(wallet.balance ?? 0);
    } catch {
      // leave defaults
    }
  };

  useEffect(() => {
    loadBlocks();
    const onFocus = () => loadBlocks();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  const toggleComplete = async (block: TimeBlock, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = block.status === 'completed' ? false : true;
    try {
      await updateSession(Number(block.id), { is_completed: nextStatus });
      await loadBlocks();
    } catch {}
  };

  const totalBlocks = blocks.length;
  const completedBlocks = blocks.filter((b) => b.status === 'completed').length;
  const scheduledHours = (blocks.reduce((sum, b) => sum + blockMinutes(b.timeRange), 0) / 60).toFixed(1);

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const overdueBlocks = blocks
    .filter((b) => b.dateKey && b.dateKey < todayKey && b.status !== 'completed')
    .sort((a, b) => (a.dateKey || '').localeCompare(b.dateKey || ''));

  const prettyDate = (key?: string) => {
    if (!key) return '';
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => (new Date().getDay() + 6) % 7);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const startBlock = (block: TimeBlock, e: React.MouseEvent) => {
    e.stopPropagation();
    startSession(block.id);
    const params = new URLSearchParams({ task: block.id, title: block.title, topic: block.subtitle });
    router.push(`/kid/focus?${params.toString()}`);
  };

  const days = (() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const abbr = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    return abbr.map((d, i) => {
      const dt = new Date(monday);
      dt.setDate(monday.getDate() + i);
      const dateKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      return { day: d, date: String(dt.getDate()), index: i, dateKey };
    });
  })();

  const renderBlockRow = (block: TimeBlock) => {
    const isCompleted = block.status === 'completed';
    const isActive = block.status === 'active';
    const subjectColors: Record<string, string> = {
      Math: 'border-l-sky-500 bg-sky-50/70 dark:bg-sky-950/30',
      Science: 'border-l-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30',
      Reading: 'border-l-pink-500 bg-pink-50/70 dark:bg-pink-950/30',
      Art: 'border-l-amber-500 bg-amber-50/70 dark:bg-amber-950/30',
    };
    const accentClass = subjectColors[block.moduleTitle || 'Math'] || 'border-l-sky-500 bg-sky-50/70 dark:bg-sky-950/30';

    return (
      <div
        key={block.id}
        className={`flex items-center gap-4 px-5 py-4 transition-all border-l-4 ${accentClass} ${
          isActive
            ? 'animate-kid-pulse-glow border-2 border-orange-400 dark:border-orange-500 rounded-2xl my-1 shadow-md'
            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
        } ${isCompleted ? 'opacity-70' : ''}`}
      >
        <div className={`w-28 shrink-0 text-xs font-extrabold flex items-center gap-1.5 ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400'}`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{block.timeRange}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className={`text-sm font-extrabold truncate ${isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
              {block.title}
            </h4>
            {block.moduleTitle && (
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${isCompleted ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700' : 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/60 dark:text-sky-300 dark:border-sky-800'}`}>
                {block.moduleTitle}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-bold">{block.subtitle}</p>
        </div>

        {isActive && (
          <span className="text-[9px] font-extrabold bg-orange-500 text-white px-2.5 py-0.5 rounded-full uppercase shrink-0 shadow-xs animate-pulse">NOW ⚡</span>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={(e) => startBlock(block, e)} title="Start focus session" className="p-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:scale-108 active:scale-95 transition-all cursor-pointer group">
            <Play className="w-4 h-4 fill-white group-hover:animate-kid-wiggle" />
          </button>
          <button onClick={(e) => toggleComplete(block, e)} title={isCompleted ? 'Mark as not done' : 'Mark as completed'} className="p-1 hover:scale-110 transition-transform cursor-pointer">
            {isCompleted ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-500 fill-emerald-100 dark:fill-emerald-950 animate-kid-bounce-subtle" />
            ) : (
              <Circle className="w-7 h-7 text-slate-300 dark:text-slate-600 hover:text-emerald-500" />
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderDayList = (dayBlocks: TimeBlock[]) => (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {dayBlocks.map((block, i) => {
        const next = dayBlocks[i + 1];
        const gap = next ? rangeStartMin(next.timeRange) - rangeEndMin(block.timeRange) : 0;
        return (
          <React.Fragment key={block.id}>
            {renderBlockRow(block)}
            {next && gap >= 10 && gap <= 60 && (
              <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/20 dark:to-orange-950/20 border-y-2 border-dashed border-amber-200 dark:border-amber-900/40">
                <div className="w-28 shrink-0" />
                <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-sm animate-kid-bounce-subtle">
                  <Coffee className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold text-amber-900 dark:text-amber-300">
                  {gap}-min break & snack time 🌤️
                </span>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <KidLayout starsCount={stars}>
      {/* BACKGROUND LAYER */}
      <KidPageBackground theme="sky" />

      {/* PAGE CONTENT */}
      <div className="relative z-10 space-y-6">

        {/* Top Header & View Toggle Track */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-sky-100/80 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-sky-200 dark:border-sky-800">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>Interactive Schedule</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              My Schedule 🗓️
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
              Here is your daily study timetable!
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <div className="flex items-center space-x-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-1.5 rounded-full border-2 border-sky-200 dark:border-slate-800 shadow-sm">
              {(['day', 'week', 'month'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold capitalize transition-all cursor-pointer ${
                    viewMode === mode ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md shadow-sky-500/25 scale-105' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Day Selector Pills */}
        {viewMode === 'day' && (
          <div className="grid grid-cols-7 gap-2.5">
            {days.map((item) => {
              const isSelected = selectedDayIndex === item.index;
              const count = blocks.filter((b) => b.dateKey === item.dateKey).length;
              return (
                <button
                  key={item.day}
                  onClick={() => setSelectedDayIndex(item.index)}
                  className={`relative py-4 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-gradient-to-b from-sky-400 to-sky-500 text-white border-sky-300 shadow-lg shadow-sky-500/25 scale-105 -translate-y-1'
                      : 'bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 border-sky-100 dark:border-slate-800 hover:border-sky-300'
                  }`}
                >
                  <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-80">{item.day}</span>
                  <span className="text-xl font-extrabold mt-0.5">{item.date}</span>
                  {count > 0 && (
                    <span className={`mt-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/30 text-white' : 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400'}`}>
                      {count} {count === 1 ? 'block' : 'blocks'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Soft Coral Overdue Banner */}
        {overdueBlocks.length > 0 && (
          <div className="bg-gradient-to-r from-rose-50/90 via-orange-50/70 to-rose-50/90 dark:from-rose-950/40 dark:to-orange-950/40 rounded-3xl border-2 border-rose-300 dark:border-rose-900/50 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-rose-200 dark:border-rose-900/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center animate-kid-bob">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-rose-900 dark:text-rose-200">
                  Catch-up Time! You have {overdueBlocks.length} earlier block{overdueBlocks.length > 1 ? 's' : ''} to complete
                </h3>
              </div>
            </div>
            <div className="divide-y divide-rose-200/60 dark:divide-rose-900/30">
              {overdueBlocks.map((block) => (
                <div key={block.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="w-32 shrink-0 text-[11px] font-extrabold text-rose-800 dark:text-rose-400">
                    {prettyDate(block.dateKey)} · {block.timeRange}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">{block.title}</h4>
                      {block.moduleTitle && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800">
                          {block.moduleTitle}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-bold">{block.subtitle}</p>
                  </div>
                  <button
                    onClick={(e) => toggleComplete(block, e)}
                    title="Mark as completed"
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Circle className="w-6 h-6 text-rose-400 hover:text-rose-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day View Content Container */}
        {viewMode === 'day' && (() => {
          const selected = days[selectedDayIndex];
          const dayBlocks = blocks
            .filter((b) => b.dateKey === selected?.dateKey)
            .sort((a, b) => rangeStartMin(a.timeRange) - rangeStartMin(b.timeRange));
          return (
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[32px] border-2 border-sky-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100 dark:border-slate-800 bg-sky-50/70 dark:bg-slate-800/50">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {fullDayNames[selectedDayIndex]}
                  <span className="text-slate-500 dark:text-slate-400 font-bold"> · {selected?.date}</span>
                </h3>
                <span className="text-xs font-extrabold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60 px-3.5 py-1 rounded-full border border-sky-200 dark:border-sky-800">
                  {dayBlocks.filter((b) => b.status === 'completed').length}/{dayBlocks.length} Completed
                </span>
              </div>
              {dayBlocks.length > 0 ? (
                renderDayList(dayBlocks)
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-16 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-slate-800 text-sky-400 flex items-center justify-center animate-kid-bob">
                    <CalendarX className="w-8 h-8" />
                  </div>
                  <span className="text-base font-extrabold text-slate-700 dark:text-slate-300">No study blocks this day</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">Your parent hasn&apos;t added any schedule for today!</span>
                </div>
              )}
            </div>
          );
        })()}

        {/* Week View Content Container */}
        {viewMode === 'week' && (
          <div className="space-y-4">
            {days.map((day) => {
              const dayBlocks = blocks
                .filter((b) => b.dateKey === day.dateKey)
                .sort((a, b) => rangeStartMin(a.timeRange) - rangeStartMin(b.timeRange));
              return (
                <div key={day.day} className="bg-white/90 dark:bg-slate-900/90 rounded-[28px] border-2 border-sky-100 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-sky-100 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-800/40">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      {fullDayNames[day.index]}
                      <span className="text-slate-500 dark:text-slate-400 font-bold"> · {day.date}</span>
                    </h3>
                    <span className="text-[11px] font-extrabold text-sky-600 dark:text-sky-400">
                      {dayBlocks.filter((b) => b.status === 'completed').length}/{dayBlocks.length} done
                    </span>
                  </div>
                  {dayBlocks.length > 0 ? (
                    renderDayList(dayBlocks)
                  ) : (
                    <div className="px-5 py-5 text-center text-xs font-bold text-slate-400 dark:text-slate-500">No study blocks</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Month View Content Container */}
        {viewMode === 'month' && (() => {
          const now = new Date();
          const year = currentMonth.getFullYear();
          const month = currentMonth.getMonth();
          const monthLabel = currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
          const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const counts: Record<string, number> = {};
          blocks.forEach((b) => { if (b.dateKey) counts[b.dateKey] = (counts[b.dateKey] || 0) + 1; });
          const cells: (number | null)[] = [];
          for (let i = 0; i < startOffset; i++) cells.push(null);
          for (let d = 1; d <= daysInMonth; d++) cells.push(d);
          return (
            <div className="bg-white/90 dark:bg-slate-900/90 rounded-[32px] border-2 border-sky-100 dark:border-slate-800 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{monthLabel}</h3>
                <div className="flex items-center space-x-1">
                  <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-2 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-2 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div key={d} className="text-center text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 pb-1">{d}</div>
                ))}
                {cells.map((d, i) => {
                  if (d === null) return <div key={`empty-${i}`} />;
                  const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  const c = counts[key] || 0;
                  const isToday = key === todayKey;
                  return (
                    <div key={key} className={`aspect-square rounded-2xl border-2 p-2 flex flex-col ${isToday ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/40 shadow-xs' : 'border-sky-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60'}`}>
                      <span className={`text-xs font-extrabold ${isToday ? 'text-sky-600 dark:text-sky-400' : 'text-slate-900 dark:text-slate-200'}`}>{d}</span>
                      {c > 0 && (
                        <span className="mt-auto text-[9px] font-extrabold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/80 rounded-full px-1.5 py-0.5 self-start">{c} block{c > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

      </div>
    </KidLayout>
  );
}
