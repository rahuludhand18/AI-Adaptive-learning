'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useFocusStore } from '@/store/useFocusStore';
import { COPY } from '@/constants/copy';
import { TimeBlock } from '@/services/focusApi';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Edit2,
  CalendarX,
  X,
  UploadCloud,
} from 'lucide-react';

export default function AdultPlannerPage() {
  const router = useRouter();
  const { timetable, addTimeBlock, startSession } = useFocusStore();

  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form state
  const [blockTitle, setBlockTitle] = useState('');
  const [blockSubtitle, setBlockSubtitle] = useState('');
  const [blockTime, setBlockTime] = useState('03:00 PM - 04:30 PM');
  const [blockType, setBlockType] = useState<TimeBlock['type']>('default');

  const days = [
    { day: 'MON', date: '12', index: 0 },
    { day: 'TUE', date: '13', index: 1 },
    { day: 'WED', date: '14', index: 2 },
    { day: 'THU', date: '15', index: 3 },
    { day: 'FRI', date: '16', index: 4 },
    { day: 'SAT', date: '17', index: 5 },
    { day: 'SUN', date: '18', index: 6 },
  ];

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTitle.trim()) return;
    addTimeBlock({
      timeRange: blockTime,
      title: blockTitle.trim(),
      subtitle: blockSubtitle.trim() || 'Custom session',
      status: 'upcoming',
      type: blockType,
      dayIndex: selectedDayIndex,
    });
    setBlockTitle('');
    setBlockSubtitle('');
    setIsModalOpen(false);
  };

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
            
            {/* Upload Syllabus Link Button */}
            <Link
              href="/adult/onboarding"
              className="py-2 px-3.5 bg-indigo-light dark:bg-indigo-950/50 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/50 text-indigo dark:text-indigo-400 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5 border border-indigo/20 shadow-sm"
            >
              <UploadCloud className="w-4 h-4 text-indigo dark:text-indigo-400" />
              <span>Upload Syllabus</span>
            </Link>

            {/* Week / Month View Toggle */}
            <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-border dark:border-slate-800 shadow-sm">
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'week' ? 'bg-indigo text-white shadow-sm' : 'text-textSecondary dark:text-slate-400 hover:text-textPrimary dark:hover:text-slate-100'
                }`}
              >
                Week View
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'month' ? 'bg-indigo text-white shadow-sm' : 'text-textSecondary dark:text-slate-400 hover:text-textPrimary dark:hover:text-slate-100'
                }`}
              >
                Month View
              </button>
            </div>
          </div>
        </div>

        {/* 7-Day Date Strip Header Buttons */}
        <div className="grid grid-cols-7 gap-3">
          {days.map((item) => {
            const isSelected = selectedDayIndex === item.index;
            return (
              <button
                key={item.day}
                onClick={() => setSelectedDayIndex(item.index)}
                className={`py-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo text-white shadow-md shadow-indigo/20'
                    : 'bg-white dark:bg-slate-900 text-textPrimary dark:text-slate-200 border border-border dark:border-slate-800 hover:border-indigo/40'
                }`}
              >
                <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-80">{item.day}</span>
                <span className="text-xl font-extrabold mt-0.5">{item.date}</span>
              </button>
            );
          })}
        </div>

        {/* 7-Column Day Grid (Per-Day Stacked Cards) */}
        {viewMode === 'week' ? (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 pt-2">
            {days.map((dayItem) => {
              const dayBlocks = timetable.filter((b) => b.dayIndex === dayItem.index);

              return (
                <div key={dayItem.day} className="space-y-3">
                  {/* Top Day Header Bar Indicator */}
                  <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full mb-1" />

                  {dayBlocks.length > 0 ? (
                    dayBlocks.map((block) => {
                      const isCompleted = block.status === 'completed';
                      const isActive = block.status === 'active';
                      const isSpecial = block.type === 'special';
                      const isWarm = block.type === 'warm';

                      return (
                        <div
                          key={block.id}
                          onClick={() => {
                            startSession(block.id);
                            router.push('/adult/focus');
                          }}
                          className={`rounded-2xl p-3.5 border shadow-sm transition-all cursor-pointer relative flex flex-col justify-between min-h-[120px] ${
                            isActive
                              ? 'bg-white dark:bg-slate-900 border-l-4 border-l-indigo border-indigo/30 ring-2 ring-indigo/10 shadow-md'
                              : isSpecial
                              ? 'bg-teal-light/80 dark:bg-teal-950/40 border-teal/40 dark:border-teal-800/40'
                              : isWarm
                              ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40'
                              : isCompleted
                              ? 'bg-indigo-light/40 dark:bg-indigo-950/30 border-indigo-light dark:border-indigo-900/30'
                              : 'bg-white dark:bg-slate-900 border-border dark:border-slate-800 hover:border-indigo/40'
                          }`}
                        >
                          {/* Time & Completed Check / CURRENT badge */}
                          <div className="flex items-center justify-between text-[11px] font-bold text-textSecondary dark:text-slate-400 mb-1.5">
                            <span className={isActive ? 'text-indigo dark:text-indigo-400' : ''}>{block.timeRange}</span>
                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo shrink-0" />
                            ) : isActive ? (
                              <span className="text-[9px] font-black bg-indigo text-white px-1.5 py-0.5 rounded uppercase">
                                CURRENT
                              </span>
                            ) : null}
                          </div>

                          {/* Title & Subtitle */}
                          <div>
                            <h4 className="text-xs font-bold text-textPrimary dark:text-slate-100 leading-snug">
                              {block.title}
                            </h4>
                            <p className="text-[10px] text-textSecondary dark:text-slate-400 mt-0.5 leading-tight">
                              {block.subtitle}
                            </p>
                          </div>

                          {/* Active Progress Bar at Bottom of Card */}
                          {isActive && (
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mt-2.5 overflow-hidden">
                              <div className="bg-indigo h-full w-3/4 rounded-full animate-pulse" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    /* Weekend Flex / Rest Day Placeholder Card */
                    <div className="rounded-2xl p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 flex flex-col items-center justify-center text-center space-y-1.5 min-h-[140px]">
                      <CalendarX className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                        {dayItem.index === 5 ? 'Flex Day' : 'Rest Day'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-border dark:border-slate-800 shadow-card text-center space-y-3">
            <CalendarIcon className="w-10 h-10 text-indigo mx-auto" />
            <h3 className="text-lg font-bold text-textPrimary dark:text-slate-100">Month Overview Calendar</h3>
            <p className="text-xs text-textSecondary dark:text-slate-400 max-w-md mx-auto">
              Your overall workload is evenly balanced across the month.
            </p>
          </div>
        )}

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
                  <span className="text-[10px] font-bold text-textSecondary dark:text-slate-400 uppercase block">TOTAL HOURS</span>
                  <span className="text-lg font-black text-textPrimary dark:text-slate-100 mt-0.5 block">24.5</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-border dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] font-bold text-textSecondary dark:text-slate-400 uppercase block">FOCUS SCORE</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">92%</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-border dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] font-bold text-textSecondary dark:text-slate-400 uppercase block">COMPLETED</span>
                  <span className="text-lg font-black text-textPrimary dark:text-slate-100 mt-0.5 block">18/24</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-border dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] font-bold text-textSecondary dark:text-slate-400 uppercase block">STREAK</span>
                  <span className="text-lg font-black text-amber-700 dark:text-amber-400 mt-0.5 block">12 Days</span>
                </div>
              </div>
            </div>

            {/* Right Large Circular Gauge Ring Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-border dark:border-slate-800 shadow-sm flex flex-col items-center justify-center shrink-0">
              <ProgressRing
                value={64}
                label="Progress"
                color="#4F46E5"
                size={120}
                strokeWidth={10}
              />
            </div>

          </div>
        </div>

      </PageContainer>

      {/* Floating Edit Pencil FAB Bottom-Right */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo text-white rounded-full shadow-2xl hover:bg-indigo-dark hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-40 cursor-pointer"
        title="Add / Edit Block"
      >
        <Edit2 className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-border dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border dark:border-slate-800">
              <h3 className="text-base font-bold text-textPrimary dark:text-slate-100">Add Study Time Block</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-textSecondary dark:text-slate-400 hover:text-textPrimary dark:hover:text-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-textPrimary dark:text-slate-200 uppercase block mb-1">
                  Block Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems"
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-xs text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-textPrimary dark:text-slate-200 uppercase block mb-1">
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Raft Consensus Protocol"
                  value={blockSubtitle}
                  onChange={(e) => setBlockSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-xs text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-textPrimary dark:text-slate-200 uppercase block mb-1">
                    Time Window
                  </label>
                  <input
                    type="text"
                    value={blockTime}
                    onChange={(e) => setBlockTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-xs text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-textPrimary dark:text-slate-200 uppercase block mb-1">
                    Card Style
                  </label>
                  <select
                    value={blockType}
                    onChange={(e) => setBlockType(e.target.value as TimeBlock['type'])}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-xs text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo font-medium cursor-pointer"
                  >
                    <option value="default">Standard</option>
                    <option value="special">Mentorship (Teal)</option>
                    <option value="warm">Yoga / Recovery (Warm)</option>
                  </select>
                </div>
              </div>

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
                  Save Time Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
