'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import KidLayout from '@/components/layout/KidLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useFocusStore } from '@/store/useFocusStore';
import { COPY } from '@/constants/copy';
import { TimeBlock } from '@/services/focusApi';
import { apiRequest } from '@/lib/api';
import { listSessions, updateSession, clearSchedule, sessionToTimeBlock } from '@/lib/plannerApi';
import {
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  Play,
  Plus,
  Coffee,
  CalendarX,
  AlertTriangle,
  RotateCcw,
  X,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
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

  const loadBlocks = async () => {
    try {
      const sessions = await listSessions();
      setBlocks(sessions.map(sessionToTimeBlock));
    } catch {
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
  const progressPct = totalBlocks ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

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
    return (
      <div
        key={block.id}
        className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
          isActive ? 'bg-indigo-light/30 dark:bg-indigo-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
      >
        <div className={`w-28 shrink-0 text-xs font-bold ${isActive ? 'text-indigo dark:text-indigo-400' : 'text-textSecondary dark:text-slate-400'}`}>
          {block.timeRange}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className={`text-sm font-bold truncate ${isCompleted ? 'text-textSecondary dark:text-slate-500 line-through' : 'text-textPrimary dark:text-slate-100'}`}>
              {block.title}
            </h4>
            {block.moduleTitle && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${isCompleted ? 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700' : 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800'}`}>
                {block.moduleTitle}
              </span>
            )}
          </div>
          <p className="text-xs text-textSecondary dark:text-slate-400 truncate mt-0.5 font-medium">{block.subtitle}</p>
        </div>
        {isActive && (
          <span className="text-[9px] font-black bg-indigo text-white px-1.5 py-0.5 rounded uppercase shrink-0">CURRENT</span>
        )}
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={(e) => startBlock(block, e)} title="Start focus session" className="p-1.5 rounded-lg text-textSecondary dark:text-slate-400 hover:text-indigo hover:bg-indigo-light/50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer">
            <Play className="w-4 h-4" />
          </button>
          <button onClick={(e) => toggleComplete(block, e)} title={isCompleted ? 'Mark as not done' : 'Mark as completed'} className="p-1 hover:scale-110 transition-transform cursor-pointer">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-indigo" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-indigo" />
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderDayList = (dayBlocks: TimeBlock[]) => (
    <div className="divide-y divide-border dark:divide-slate-800">
      {dayBlocks.map((block, i) => {
        const next = dayBlocks[i + 1];
        const gap = next ? rangeStartMin(next.timeRange) - rangeEndMin(block.timeRange) : 0;
        return (
          <React.Fragment key={block.id}>
            {renderBlockRow(block)}
            {next && gap >= 10 && gap <= 60 && (
              <div className="flex items-center gap-3 px-5 py-1.5 bg-amber-50/50 dark:bg-amber-950/10">
                <div className="w-28 shrink-0" />
                <Coffee className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">{gap}-min break</span>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <KidLayout starsCount={0}>
      <PageContainer>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-textPrimary dark:text-slate-100 tracking-tight">
              My Schedule
            </h1>
            <p className="text-sm text-textSecondary dark:text-slate-400 font-normal">
              Here is your daily study timetable!
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-border dark:border-slate-800 shadow-sm">
              {(['day', 'week', 'month'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    viewMode === mode ? 'bg-indigo text-white shadow-sm' : 'text-textSecondary dark:text-slate-400 hover:text-textPrimary dark:hover:text-slate-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {viewMode === 'day' && (
          <div className="grid grid-cols-7 gap-3 mb-6">
            {days.map((item) => {
              const isSelected = selectedDayIndex === item.index;
              const count = blocks.filter((b) => b.dateKey === item.dateKey).length;
              return (
                <button
                  key={item.day}
                  onClick={() => setSelectedDayIndex(item.index)}
                  className={`relative py-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo text-white shadow-md shadow-indigo/20'
                      : 'bg-white dark:bg-slate-900 text-textPrimary dark:text-slate-200 border border-border dark:border-slate-800 hover:border-indigo/40'
                  }`}
                >
                  <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-80">{item.day}</span>
                  <span className="text-xl font-extrabold mt-0.5">{item.date}</span>
                  {count > 0 && (
                    <span className={`mt-1 text-[9px] font-bold px-1.5 rounded-full ${isSelected ? 'bg-white/25 text-white' : 'bg-indigo-light dark:bg-indigo-950/60 text-indigo dark:text-indigo-400'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {overdueBlocks.length > 0 && (
          <div className="bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40 overflow-hidden mb-6">
            <div className="flex items-center justify-between px-5 py-3 border-b border-amber-200/70 dark:border-amber-900/40">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  {overdueBlocks.length} incomplete block{overdueBlocks.length > 1 ? 's' : ''} from earlier
                </h3>
              </div>
            </div>
            <div className="divide-y divide-amber-200/60 dark:divide-amber-900/30">
              {overdueBlocks.map((block) => (
                <div key={block.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="w-32 shrink-0 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                    {prettyDate(block.dateKey)} · {block.timeRange}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-textPrimary dark:text-slate-100 truncate">{block.title}</h4>
                      {block.moduleTitle && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800">
                          {block.moduleTitle}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-textSecondary dark:text-slate-400 truncate mt-0.5 font-medium">{block.subtitle}</p>
                  </div>
                  <button
                    onClick={(e) => toggleComplete(block, e)}
                    title="Mark as completed"
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Circle className="w-5 h-5 text-amber-400 hover:text-amber-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'day' && (() => {
          const selected = days[selectedDayIndex];
          const dayBlocks = blocks
            .filter((b) => b.dateKey === selected?.dateKey)
            .sort((a, b) => rangeStartMin(a.timeRange) - rangeStartMin(b.timeRange));
          return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border dark:border-slate-800 shadow-card overflow-hidden mb-6">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <h3 className="text-sm font-bold text-textPrimary dark:text-slate-100">
                  {fullDayNames[selectedDayIndex]}
                  <span className="text-textSecondary dark:text-slate-400 font-medium"> · {selected?.date}</span>
                </h3>
                <span className="text-[11px] font-bold text-textSecondary dark:text-slate-400">
                  {dayBlocks.filter((b) => b.status === 'completed').length}/{dayBlocks.length} done
                </span>
              </div>
              {dayBlocks.length > 0 ? (
                renderDayList(dayBlocks)
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-14 space-y-2">
                  <CalendarX className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                  <span className="text-sm font-bold text-slate-400 dark:text-slate-500">No study blocks this day</span>
                  <span className="text-xs text-textSecondary dark:text-slate-500">Your parent hasn't added any schedule for today!</span>
                </div>
              )}
            </div>
          );
        })()}

        {viewMode === 'week' && (
          <div className="space-y-4 mb-6">
            {days.map((day) => {
              const dayBlocks = blocks
                .filter((b) => b.dateKey === day.dateKey)
                .sort((a, b) => rangeStartMin(a.timeRange) - rangeStartMin(b.timeRange));
              return (
                <div key={day.day} className="bg-white dark:bg-slate-900 rounded-2xl border border-border dark:border-slate-800 shadow-card overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-border dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                    <h3 className="text-sm font-bold text-textPrimary dark:text-slate-100">
                      {fullDayNames[day.index]}
                      <span className="text-textSecondary dark:text-slate-400 font-medium"> · {day.date}</span>
                    </h3>
                    <span className="text-[11px] font-bold text-textSecondary dark:text-slate-400">
                      {dayBlocks.filter((b) => b.status === 'completed').length}/{dayBlocks.length} done
                    </span>
                  </div>
                  {dayBlocks.length > 0 ? (
                    renderDayList(dayBlocks)
                  ) : (
                    <div className="px-5 py-5 text-center text-xs font-medium text-textSecondary dark:text-slate-500">No study blocks</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

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
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border dark:border-slate-800 shadow-card p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-textPrimary dark:text-slate-100">{monthLabel}</h3>
                <div className="flex items-center space-x-1">
                  <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-textSecondary dark:text-slate-400 transition-colors cursor-pointer">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-textSecondary dark:text-slate-400 transition-colors cursor-pointer">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold uppercase text-textSecondary dark:text-slate-500 pb-1">{d}</div>
                ))}
                {cells.map((d, i) => {
                  if (d === null) return <div key={`empty-${i}`} />;
                  const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  const c = counts[key] || 0;
                  const isToday = key === todayKey;
                  return (
                    <div key={key} className={`aspect-square rounded-xl border p-1.5 flex flex-col ${isToday ? 'border-indigo bg-indigo-light/30 dark:bg-indigo-950/30' : 'border-border dark:border-slate-800'}`}>
                      <span className={`text-xs font-bold ${isToday ? 'text-indigo dark:text-indigo-400' : 'text-textPrimary dark:text-slate-200'}`}>{d}</span>
                      {c > 0 && (
                        <span className="mt-auto text-[9px] font-bold text-indigo dark:text-indigo-400 bg-indigo-light dark:bg-indigo-950/60 rounded px-1 self-start">{c} block{c > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </PageContainer>
    </KidLayout>
  );
}
