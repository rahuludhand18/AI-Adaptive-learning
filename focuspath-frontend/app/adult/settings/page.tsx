'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/layout/TopNav';
import { useAuthStore } from '@/store/authStore';
import { useFocusStore } from '@/store/useFocusStore';
import {
  User,
  Settings,
  Shield,
  Clock,
  Bell,
  Sparkles,
  Lock,
  ArrowRight,
  Check,
  RotateCcw,
  Volume2
} from 'lucide-react';

export default function AdultSettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { user: focusUser } = useFocusStore();

  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [autoRebuild, setAutoRebuild] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans antialiased text-slate-800">
      <TopNav />

      <main className="mx-auto max-w-7xl space-y-6 p-6">
        
        {/* Page Header Card */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600/80">
              Workspace Preferences
            </span>
            <h1 className="text-2xl font-bold text-slate-800">Adult Account Settings</h1>
            <p className="text-xs text-slate-500 font-semibold">
              Customize your focus timers, adaptive AI scheduler, and workspace preferences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-full flex items-center gap-1 animate-in fade-in duration-200">
                <Check className="w-3.5 h-3.5" />
                Settings Saved
              </span>
            )}
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-5 rounded-full transition-all shadow-sm cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* 12-Column Grid */}
        <div className="grid grid-cols-12 gap-5">
          
          {/* Account Profile Details (Col span 6) */}
          <div className="col-span-12 lg:col-span-6 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Account Profile</h3>
                <p className="text-xs text-slate-400 font-semibold">Your workspace identity details</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Username
                </label>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-700">
                  {user?.username || focusUser?.name || 'Adult User'}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-700">
                  {user?.email || 'user@focuspath.ai'}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Active Mode Role
                </label>
                <div className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/30 p-3 text-xs font-bold text-indigo-600">
                  <span>Adult Workspace Mode</span>
                  <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Focus & Timer Customization (Col span 6) */}
          <div className="col-span-12 lg:col-span-6 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Focus Timer Settings</h3>
                <p className="text-xs text-slate-400 font-semibold">Configure Pomodoro intervals</p>
              </div>
            </div>

            <div className="space-y-5 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Pomodoro Duration</span>
                  <span className="text-indigo-600">{pomodoroMinutes} mins</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={60}
                  step={5}
                  value={pomodoroMinutes}
                  onChange={(e) => setPomodoroMinutes(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Short Break Duration</span>
                  <span className="text-indigo-600">{shortBreakMinutes} mins</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={15}
                  step={1}
                  value={shortBreakMinutes}
                  onChange={(e) => setShortBreakMinutes(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <span>Timer Sound Notifications</span>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    soundEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      soundEnabled ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* AI Scheduler & Rebuilder Bento Card (Col span 12) */}
          <div className="col-span-12 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">AI Adaptive Scheduler</h3>
                <p className="text-xs text-slate-400 font-semibold">Automatic timetable recalculation logic</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/40">
                <div className="space-y-1 max-w-md">
                  <h4 className="text-xs font-bold text-slate-800">Auto-rebuild schedule on missed tasks</h4>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    Automatically redistribute uncompleted syllabus items when study sessions expire.
                  </p>
                </div>
                <button
                  onClick={() => setAutoRebuild(!autoRebuild)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    autoRebuild ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      autoRebuild ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/40 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Priority Shift Weight</span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    Balanced Rebuild
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  FocusPath dynamically optimizes daily workloads based on your historical focus scores.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
