'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTabTracker } from '@/hooks/useTabTracker';
import { ArrowLeft, Play, Award } from 'lucide-react';

export default function KidStories() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Track tab changes
  useTabTracker();

  const [step, setStep] = useState(3);

  const handleNext = () => {
    if (step < 5) {
      setStep(prev => prev + 1);
    } else {
      alert("Quest Completed! You earned 150 Points!");
      router.push('/kid/dashboard');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans antialiased text-slate-800 flex flex-col justify-between">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-150 p-4 sticky top-0 z-50">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/kid/dashboard')}
              className="p-2 rounded-full hover:bg-slate-50 text-indigo-600 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="font-extrabold text-indigo-600 text-base">Reading Quest</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold py-1.5 px-3.5 rounded-full">
              Step {step} of 5
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">
              {user.username.slice(0,2).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Global Progress bar at bottom of navbar */}
        <div className="w-full bg-slate-100 h-1 absolute left-0 bottom-0">
          <div className="bg-indigo-600 h-1 transition-all" style={{ width: `${(step / 5) * 100}%` }}></div>
        </div>
      </div>

      {/* Main Quest Container */}
      <main className="flex-1 mx-auto max-w-3xl w-full p-6 flex flex-col justify-center">
        
        {/* Main Card */}
        <div className="bg-white rounded-[32px] border border-slate-200/80 p-8 shadow-sm space-y-6">
          
          {/* Stylized CSS Illustration Frame */}
          <div className="w-full h-[260px] rounded-2xl border border-slate-100 bg-emerald-50/40 relative overflow-hidden flex items-center justify-center">
            
            {/* Winding road SVG illustration */}
            <svg viewBox="0 0 100 60" className="w-full h-full absolute inset-0">
              <defs>
                <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0.4"/>
                </linearGradient>
              </defs>
              <rect width="100" height="60" fill="url(#sky)" />
              {/* Forest trees */}
              <circle cx="10" cy="40" r="15" fill="#059669" opacity="0.3" />
              <circle cx="90" cy="38" r="18" fill="#059669" opacity="0.3" />
              <circle cx="25" cy="42" r="12" fill="#047857" opacity="0.4" />
              <circle cx="78" cy="40" r="14" fill="#047857" opacity="0.4" />
              {/* Golden winding path */}
              <path d="M 50 60 C 45 45, 15 35, 40 25 C 60 18, 50 10, 50 0" stroke="#f59e0b" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.8" />
              <path d="M 50 60 C 45 45, 15 35, 40 25 C 60 18, 50 10, 50 0" stroke="#fbbf24" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
              
              {/* Little Owl mascot sitting on branch */}
              <g transform="translate(62, 12) scale(0.24)">
                <ellipse cx="50" cy="55" rx="30" ry="34" fill="#fbbf24" />
                <ellipse cx="50" cy="55" rx="20" ry="24" fill="#ffffff" />
                <circle cx="40" cy="42" r="7" fill="#1e293b" />
                <circle cx="40" cy="40" r="2.5" fill="#ffffff" />
                <circle cx="60" cy="42" r="7" fill="#1e293b" />
                <circle cx="60" cy="40" r="2.5" fill="#ffffff" />
                <polygon points="47,48 53,48 50,55" fill="#f97316" />
                <path d="M 32 30 C 25 20, 42 16, 42 26 Z" fill="#f59e0b" />
                <path d="M 68 30 C 75 20, 58 16, 58 26 Z" fill="#f59e0b" />
              </g>
            </svg>
            
          </div>

          {/* Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 leading-tight">
              Leo the Owl found a hidden path in the woods.
            </h3>
            <h4 className="text-base font-bold text-indigo-600">
              What do you think he saw?
            </h4>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Tap on the picture to look closer, or press the huge button below to continue the quest!
            </p>
          </div>

        </div>

      </main>

      {/* Bottom Bar Controls */}
      <footer className="bg-white border-t border-slate-100 p-6 z-10">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          
          {/* Coral Next Button */}
          <button
            onClick={handleNext}
            className="bg-red-400 hover:bg-red-500 text-white font-extrabold text-sm py-4 px-8 rounded-2xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            NEXT
            <span>➔</span>
          </button>

          {/* Points Pill and Speech Bubble */}
          <div className="flex items-center gap-4">
            {/* Speech bubble */}
            <div className="relative bg-slate-50 border border-slate-100 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-700 max-w-xs shadow-sm hidden md:block">
              Keep going, {user.username}! You got it!
              <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 border-8 border-transparent border-l-slate-50"></div>
            </div>

            {/* Points pill */}
            <div className="bg-indigo-50 border border-indigo-150 text-indigo-600 font-bold text-xs py-3 px-6 rounded-2xl shadow-sm flex items-center gap-2">
              <span>★ 150 Points</span>
              <span>|</span>
              <span className="flex items-center gap-1">🏅 Explorer Badge</span>
            </div>

            {/* Buddy Mascot */}
            <div className="w-12 h-12">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <ellipse cx="50" cy="55" rx="30" ry="34" fill="#a7f3d0" />
                <ellipse cx="50" cy="55" rx="22" ry="25" fill="#ffffff" />
                <path d="M 28 32 C 20 22, 38 18, 38 28 Z" fill="#6ee7b7" />
                <path d="M 72 32 C 80 22, 62 18, 62 28 Z" fill="#6ee7b7" />
                <circle cx="40" cy="42" r="7" fill="#1e293b" />
                <circle cx="60" cy="42" r="7" fill="#1e293b" />
                <polygon points="46,48 54,48 50,56" fill="#fb923c" />
              </svg>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
