'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useFocusStore } from '@/store/useFocusStore';
import { COPY } from '@/constants/copy';
import { TimeBlock } from '@/services/focusApi';
import { apiRequest } from '@/lib/api';
import { listSessions, updateSession, clearSchedule, sessionToTimeBlock, carryOverOverdue, deleteTask, timeBlockToTaskPayload, updateTask, createTask } from '@/lib/plannerApi';
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

export default function AdultPlannerPage() {
  const router = useRouter();
  const { startSession } = useFocusStore();

  // real tasks loaded from the backend, mapped into the UI's TimeBlock shape
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  // real focus/study metrics; 0 until the student actually studies & marks work done
  const [analytics, setAnalytics] = useState<{ avg_focus_score: number; sessions: number } | null>(null);

  const loadBlocks = async () => {
    try {
      const sessions = await listSessions();
      setBlocks(sessions.map(sessionToTimeBlock));
    } catch {
      // leave the grid empty if the request fails
    }
  };

  useEffect(() => {
    loadBlocks();
    apiRequest<{ avg_focus_score: number; sessions: number }>('/api/analytics/adult/')
      .then((a) => setAnalytics({ avg_focus_score: a.avg_focus_score, sessions: a.sessions }))
      .catch(() => setAnalytics(null));
    // reload the timetable whenever the user returns to this tab, so a freshly
    // generated plan shows up in the day/week/month views without a manual refresh
    const onFocus = () => loadBlocks();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  // toggle a block's completion and persist it — completion only ever reflects a real student action
  const toggleComplete = async (block: TimeBlock, e: React.MouseEvent) => {
    e.stopPropagation(); // don't open the focus timer
    const nextStatus = block.status === 'completed' ? false : true;
    try {
      await updateSession(Number(block.id), { is_completed: nextStatus });
      await loadBlocks();
    } catch {
      // ignore; UI stays as-is if the update fails
    }
  };

  // all stats are derived from real task statuses — nothing is "completed" until the student marks it
  const totalBlocks = blocks.length;
  const completedBlocks = blocks.filter((b) => b.status === 'completed').length;
  const scheduledHours = (blocks.reduce((sum, b) => sum + blockMinutes(b.timeRange), 0) / 60).toFixed(1);
  const progressPct = totalBlocks ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

  // overdue = blocks scheduled on a past day that were never completed (carry-over candidates)
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const overdueBlocks = blocks
    .filter((b) => b.dateKey && b.dateKey < todayKey && b.status !== 'completed')
    .sort((a, b) => (a.dateKey || '').localeCompare(b.dateKey || ''));

  // human-friendly date from a 'YYYY-MM-DD' key
  const prettyDate = (key?: string) => {
    if (!key) return '';
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // move all overdue blocks into upcoming free slots (respecting deadlines)
  const handleCarryOver = async () => {
    try {
      await carryOverOverdue();
      await loadBlocks();
    } catch {
      // ignore; list stays as-is on failure
    }
  };

  // delete the whole syllabus plan (empties the timetable)
  const handleClearAll = async () => {
    try {
      await clearSchedule();
      await loadBlocks();
    } catch {
      // ignore
    }
  };

  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => (new Date().getDay() + 6) % 7); // default to today
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  // block currently being edited; null means the modal is in "add new" mode
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);

  // Modal Form state
  const [blockTitle, setBlockTitle] = useState('');
  const [blockSubtitle, setBlockSubtitle] = useState('');
  const [blockType, setBlockType] = useState<TimeBlock['type']>('default');
  // time picked via dropdowns (12-hour)
  const [startHour, setStartHour] = useState('03');
  const [startMin, setStartMin] = useState('00');
  const [startAmPm, setStartAmPm] = useState('PM');
  const [endHour, setEndHour] = useState('04');
  const [endMin, setEndMin] = useState('30');
  const [endAmPm, setEndAmPm] = useState('PM');

  // "HH:MM" 24-hour -> {hour:'01'..'12', min, ap} for the dropdowns
  const to12h = (hhmm24: string) => {
    const m = hhmm24.match(/(\d{1,2}):(\d{2})/);
    if (!m) return { hour: '09', min: '00', ap: 'AM' };
    const h = parseInt(m[1], 10);
    const ap = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return { hour: String(h12).padStart(2, '0'), min: m[2], ap };
  };

  // open the modal to add a brand-new block
  const openAddModal = () => {
    setEditingBlock(null);
    setBlockTitle('');
    setBlockSubtitle('');
    setBlockType('default');
    setStartHour('03'); setStartMin('00'); setStartAmPm('PM');
    setEndHour('04'); setEndMin('30'); setEndAmPm('PM');
    setIsModalOpen(true);
  };

  // open the modal pre-filled to edit/reschedule an existing block
  const openEditModal = (block: TimeBlock, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBlock(block);
    setBlockTitle(block.title);
    setBlockSubtitle(block.subtitle);
    setBlockType(block.type);
    const s = to12h(block.timeRange.split('-')[0] || '');
    const en = to12h(block.timeRange.split('-')[1] || '');
    setStartHour(s.hour); setStartMin(s.min); setStartAmPm(s.ap);
    setEndHour(en.hour); setEndMin(en.min); setEndAmPm(en.ap);
    setIsModalOpen(true);
  };

  // remove a block from the timetable (soft-delete on the backend)
  const handleDeleteBlock = async (block: TimeBlock, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteTask(Number(block.id));
      await loadBlocks();
    } catch {
      // ignore; row stays if delete fails
    }
  };

  // start a focus session for a block — pass its identity so the study screen shows this content
  const startBlock = (block: TimeBlock, e: React.MouseEvent) => {
    e.stopPropagation();
    startSession(block.id);
    const params = new URLSearchParams({ task: block.id, title: block.title, topic: block.subtitle });
    router.push(`/adult/focus?${params.toString()}`);
  };

  // real current week: Monday..Sunday with today's actual dates + date keys
  const days = (() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // back up to Monday
    const abbr = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    return abbr.map((d, i) => {
      const dt = new Date(monday);
      dt.setDate(monday.getDate() + i);
      const dateKey = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      return { day: d, date: String(dt.getDate()), index: i, dateKey };
    });
  })();

  const handleSaveBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTitle.trim()) return;
    // compose the 12-hour range the payload mapper understands
    const blockTime = `${startHour}:${startMin} ${startAmPm} - ${endHour}:${endMin} ${endAmPm}`;
    // build the datetimes/title from the modal input (reuse the day of the block being edited)
    const payload = timeBlockToTaskPayload({
      timeRange: blockTime,
      title: blockTitle.trim(),
      subtitle: blockSubtitle.trim() || 'Custom session',
      status: 'upcoming',
      type: blockType,
      dayIndex: editingBlock?.dayIndex ?? selectedDayIndex,
    });
    try {
      if (editingBlock) {
        // edit/reschedule an existing block
        await updateTask(Number(editingBlock.id), {
          title: payload.title,
          description: payload.description,
          start_time: payload.start_time,
          end_time: payload.end_time,
        });
      } else {
        await createTask(payload);
      }
      await loadBlocks();
    } catch {
      // ignore save errors for now; modal simply closes
    }
    setEditingBlock(null);
    setBlockTitle('');
    setBlockSubtitle('');
    setIsModalOpen(false);
  };

  // one schedule row (time · subject · actions), reused by the day and week views
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
            {block.plan_type && (
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                block.plan_type.toLowerCase() === 'study' 
                  ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' 
                  : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
              }`}>
                {block.plan_type}
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
          <button onClick={(e) => openEditModal(block, e)} title="Edit / reschedule" className="p-1.5 rounded-lg text-textSecondary dark:text-slate-400 hover:text-indigo hover:bg-indigo-light/50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={(e) => handleDeleteBlock(block, e)} title="Delete block" className="p-1.5 rounded-lg text-textSecondary dark:text-slate-400 hover:text-danger dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer">
            <Trash2 className="w-4 h-4" />
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

  // a day's schedule with a small "break" strip shown in the gap between consecutive blocks
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
    <div className="min-h-screen bg-bg dark:bg-[#0b0f17] flex flex-col font-sans antialiased text-textPrimary dark:text-slate-100 transition-colors">
      <TopNav />

      <PageContainer>
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-textPrimary dark:text-slate-100 tracking-tight">
              {COPY.schedule.heading}
            </h1>
            <p className="text-sm text-textSecondary dark:text-slate-400 font-normal">
              {COPY.schedule.subheading}
            </p>
          </div>

          {/* Action Buttons: Upload Syllabus + Week / Month Toggle */}
          <div className="flex items-center space-x-3 self-start sm:self-auto">
            
            {/* Add Subject Link Button */}
            <Link
              href="/adult/onboarding"
              className="py-2 px-3.5 bg-indigo-light dark:bg-indigo-950/50 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/50 text-indigo dark:text-indigo-400 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5 border border-indigo/20 shadow-sm"
            >
              <Plus className="w-4 h-4 text-indigo dark:text-indigo-400" />
              <span>Add Subject</span>
            </Link>

            {/* Delete Syllabus — clears the whole timetable */}
            {totalBlocks > 0 && (
              <button
                onClick={handleClearAll}
                title="Delete syllabus and clear the whole timetable"
                className="py-2 px-3.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-danger dark:text-rose-400 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5 border border-rose-200 dark:border-rose-900/40 shadow-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Syllabus</span>
              </button>
            )}

            {/* Day / Week / Month View Toggle */}
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

        {/* 7-Day Date Strip — Day view only */}
        {viewMode === 'day' && (
          <div className="grid grid-cols-7 gap-3">
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

        {/* Overdue carry-over: incomplete blocks from earlier days, labelled by their date */}
        {overdueBlocks.length > 0 && (
          <div className="bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-amber-200/70 dark:border-amber-900/40">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  {overdueBlocks.length} incomplete block{overdueBlocks.length > 1 ? 's' : ''} from earlier
                </h3>
              </div>
              <button
                onClick={handleCarryOver}
                title="Reschedule these into your upcoming days"
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Carry over to upcoming days
              </button>
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

        {/* DAY VIEW — the selected day's schedule as a clean list */}
        {viewMode === 'day' && (() => {
          const selected = days[selectedDayIndex];
          const dayBlocks = blocks
            .filter((b) => b.dateKey === selected?.dateKey)
            .sort((a, b) => rangeStartMin(a.timeRange) - rangeStartMin(b.timeRange));
          return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border dark:border-slate-800 shadow-card overflow-hidden">
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
                  <span className="text-xs text-textSecondary dark:text-slate-500">Generate a plan from your syllabus, or add a block with the + button.</span>
                </div>
              )}
            </div>
          );
        })()}

        {/* WEEK VIEW — all 7 days stacked as clean sections */}
        {viewMode === 'week' && (
          <div className="space-y-4">
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

        {/* MONTH VIEW — calendar grid with per-day block counts */}
        {viewMode === 'month' && (() => {
          const now = new Date();
          const year = currentMonth.getFullYear();
          const month = currentMonth.getMonth();
          const monthLabel = currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
          const startOffset = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const counts: Record<string, number> = {};
          blocks.forEach((b) => { if (b.dateKey) counts[b.dateKey] = (counts[b.dateKey] || 0) + 1; });
          const cells: (number | null)[] = [];
          for (let i = 0; i < startOffset; i++) cells.push(null);
          for (let d = 1; d <= daysInMonth; d++) cells.push(d);
          return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border dark:border-slate-800 shadow-card p-5">
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

        {/* Bottom Wide Panel: Weekly Cognitive Load */}
        <div className="bg-indigo-light/60 dark:bg-indigo-950/30 rounded-2xl p-6 md:p-8 border border-indigo/20 shadow-card space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left Content */}
            <div className="space-y-4 flex-1">
              <div>
                <h3 className="text-lg font-extrabold text-textPrimary dark:text-slate-100">
                  {COPY.schedule.cognitiveLoadTitle}
                </h3>
                <p className="text-xs text-textSecondary dark:text-slate-400 mt-1">
                  {COPY.schedule.cognitiveLoadSubtitle}
                </p>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-border dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] font-bold text-textSecondary dark:text-slate-400 uppercase block">SCHEDULED HOURS</span>
                  <span className="text-lg font-black text-textPrimary dark:text-slate-100 mt-0.5 block">{scheduledHours}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-border dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] font-bold text-textSecondary dark:text-slate-400 uppercase block">FOCUS SCORE</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{analytics?.avg_focus_score ?? 0}%</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-border dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] font-bold text-textSecondary dark:text-slate-400 uppercase block">COMPLETED</span>
                  <span className="text-lg font-black text-textPrimary dark:text-slate-100 mt-0.5 block">{completedBlocks}/{totalBlocks}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-border dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] font-bold text-textSecondary dark:text-slate-400 uppercase block">SESSIONS</span>
                  <span className="text-lg font-black text-amber-700 dark:text-amber-400 mt-0.5 block">{analytics?.sessions ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Right Large Circular Gauge Ring Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border dark:border-slate-800 shadow-sm flex flex-col items-center justify-center shrink-0">
              <ProgressRing
                value={progressPct}
                label="Progress"
                color="#4F46E5"
                size={120}
                strokeWidth={10}
              />
            </div>

          </div>
        </div>

      </PageContainer>

      {/* Floating Add-Block FAB — stacked above the AI Assistant launcher */}
      <button
        onClick={openAddModal}
        className="fixed bottom-28 right-8 w-14 h-14 bg-teal text-white rounded-full shadow-2xl hover:bg-teal-600 hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-40 cursor-pointer"
        title="Add a study block"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-border dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border dark:border-slate-800">
              <h3 className="text-base font-bold text-textPrimary dark:text-slate-100">{editingBlock ? 'Edit Study Block' : 'Add Study Block'}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-textSecondary dark:text-slate-400 hover:text-textPrimary dark:hover:text-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlock} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-textPrimary dark:text-slate-200 uppercase block mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures"
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-xs text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-textPrimary dark:text-slate-200 uppercase block mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 1: Linked Lists"
                  value={blockSubtitle}
                  onChange={(e) => setBlockSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-xs text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo font-medium"
                />
              </div>

              {/* Start / End time pickers */}
              {([
                { label: 'Start Time', h: startHour, sh: setStartHour, m: startMin, sm: setStartMin, ap: startAmPm, sap: setStartAmPm },
                { label: 'End Time', h: endHour, sh: setEndHour, m: endMin, sm: setEndMin, ap: endAmPm, sap: setEndAmPm },
              ] as const).map((row) => (
                <div key={row.label}>
                  <label className="text-xs font-semibold text-textPrimary dark:text-slate-200 uppercase block mb-1">
                    {row.label}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <select value={row.h} onChange={(e) => row.sh(e.target.value)} className="px-2 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-xs text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo font-medium cursor-pointer">
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <select value={row.m} onChange={(e) => row.sm(e.target.value)} className="px-2 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-xs text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo font-medium cursor-pointer">
                      {['00', '15', '30', '45'].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select value={row.ap} onChange={(e) => row.sap(e.target.value)} className="px-2 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-xs text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo font-medium cursor-pointer">
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              ))}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-textSecondary dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-indigo text-white font-semibold text-xs rounded-xl hover:bg-indigo-dark shadow-md cursor-pointer"
                >
                  {editingBlock ? 'Save Changes' : 'Add Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
