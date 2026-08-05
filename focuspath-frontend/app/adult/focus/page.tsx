'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useTabTracker } from '@/hooks/useTabTracker';
import { apiRequest } from '@/lib/api';
import {
  Brain,
  LogOut,
  CheckCircle,
  Pause,
  Play,
  Cpu,
  User,
  Users
} from 'lucide-react';

export default function FocusTimer() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Track tab switches and trigger locking
  useTabTracker();

  const [secs, setSecs] = useState(1453); // 24:13 (1453 seconds)
  const [isRunning, setIsRunning] = useState(true);
  const [activeSession, setActiveSession] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user]);

  useEffect(() => {
    let t: any = null;
    if (isRunning && secs > 0) {
      t = setInterval(() => setSecs(prev => prev - 1), 1000);
    }
    return () => clearInterval(t);
  }, [isRunning, secs]);

  const handleComplete = async () => {
    try {
      await apiRequest('/api/focus/session/end/', { method: 'POST' });
      alert('Focus session completed successfully! Great job!');
      router.push('/adult/dashboard');
    } catch (err) {
      console.error(err);
      router.push('/adult/dashboard');
    }
  };

  const handlePauseToggle = () => {
    setIsRunning(!isRunning);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col justify-between p-8 font-sans antialiased relative">
      
      {/* Background circle blobs */}
      <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-indigo-100 opacity-40 blur-3xl -z-10 transform translate-x-20 -translate-y-20"></div>

      {/* Header */}
      <div className="flex items-center justify-between">
        {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src="/focuspath_logo.png"
              alt="FocusPath Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="font-bold text-base text-slate-800 tracking-tight">FocusPath</span>
          </div>

        {/* Exit Session */}
        <button
          onClick={() => router.push('/adult/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 py-2.5 px-5 rounded-full font-semibold text-xs transition-all cursor-pointer shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          Exit Session
        </button>
      </div>

      {/* Main Focus Center */}
      <div className="flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto w-full">
        
        {/* Focus Active Badge */}
        <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold py-1.5 px-4 rounded-full flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
          FOCUS TRACKING ACTIVE
        </span>

        {/* Current subject details */}
        <div className="text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            CURRENT SESSION
          </span>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
            Advanced Mathematics II – Linear Algebra
          </h2>
        </div>

        {/* Timer Card */}
        <div className="w-full bg-white rounded-[32px] border border-slate-200/80 p-10 shadow-sm flex flex-col items-center justify-center gap-6">
          <div className="text-8xl font-semibold tracking-tighter text-indigo-600 font-mono">
            {formatTime(secs)}
          </div>
          
          {/* Progress Indicator */}
          <div className="w-full space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '81%' }}></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Progress</span>
              <span>81% Complete</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-3">
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 px-6 rounded-2xl transition-all shadow-sm cursor-pointer"
          >
            <CheckCircle className="h-4.5 w-4.5" />
            Mark Complete
          </button>
          
          <button
            onClick={handlePauseToggle}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs py-3.5 px-6 rounded-2xl transition-all shadow-sm cursor-pointer"
          >
            {isRunning ? (
              <>
                <Pause className="h-4.5 w-4.5" />
                Pause Session
              </>
            ) : (
              <>
                <Play className="h-4.5 w-4.5 fill-slate-700" />
                Resume Session
              </>
            )}
          </button>
        </div>

      </div>

      {/* Footer / Status Indicators */}
      <div className="flex justify-between items-end">
        <div></div>
        
        <div className="flex flex-col items-end gap-3">
          {/* Brain State Indicator */}
          <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
            <div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">BRAIN STATE</span>
              <h4 className="text-xs font-bold text-slate-800">Deep Work Stage 2</h4>
            </div>
            <div className="bg-teal-100/50 text-teal-600 p-2 rounded-xl">
              <Cpu className="h-5 w-5" />
            </div>
          </div>

          {/* Users selectors pill */}
          <div className="bg-slate-100 border border-slate-200/60 p-1.5 rounded-full flex gap-1 shadow-sm">
            <button className="bg-indigo-600 text-white p-1 rounded-full"><User className="h-3.5 w-3.5" /></button>
            <button className="text-slate-400 p-1 rounded-full"><Users className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

    </div>
  );
}
