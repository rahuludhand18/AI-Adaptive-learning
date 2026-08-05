'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { useTabTracker } from '@/hooks/useTabTracker';
import { apiRequest } from '@/lib/api';
import {
  Bell,
  Settings,
  Brain,
  Sparkles,
  CheckCircle,
  Circle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Timer,
  ChevronRight,
  CornerDownRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

const mockWeeklyTrend = [
  { name: 'MON', score: 70 },
  { name: 'TUE', score: 80 },
  { name: 'WED', score: 95 },
  { name: 'THU', score: 60 },
  { name: 'FRI', score: 85 },
  { name: 'SAT', score: 40 },
  { name: 'SUN', score: 50 },
];

export default function AdultDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  // Track tab switches for this workspace
  useTabTracker();

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const res = await apiRequest('/api/planner/tasks/');
      setTasks(res.filter((t: any) => t.status !== 'ARCHIVED'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOptimizePath = () => {
    router.push('/adult/planner');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans antialiased text-slate-800">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src="/focuspath_logo.png"
              alt="FocusPath Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="font-bold text-base text-slate-800 tracking-tight">FocusPath</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-8 h-full">
            {['Dashboard', 'Schedule', 'Insights', 'Community'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'Schedule') router.push('/adult/planner');
                  if (tab === 'Insights') router.push('/adult/analytics');
                  if (tab === 'Community') router.push('/adult/reports');
                }}
                className={`h-16 flex items-center text-sm font-semibold border-b-2 px-1 transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Right Profile / Controls */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-500">Good Morning, {user.username}</span>
            <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => router.push('/parent/restrictions')}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button 
              onClick={() => { logout(); router.push('/auth/login'); }}
              className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 cursor-pointer hover:bg-slate-200"
              title="Logout"
            >
              {user.username.slice(0,2).toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl space-y-6 p-6">
        
        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">Daily Overview</h2>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            Your productivity is peaking today. Stay on track with these insights.
          </p>
        </div>

        {/* 12-Column Grid */}
        <div className="grid grid-cols-12 gap-5">
          
          {/* Focus Score Radial Card (Col span 4) */}
          <div className="col-span-12 md:col-span-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-between min-h-[340px]">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 self-start">
              FOCUS SCORE
            </span>
            
            {/* SVG Radial Progress */}
            <div className="relative flex items-center justify-center my-4">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  className="stroke-slate-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  className="stroke-indigo-600"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 62}
                  strokeDashoffset={2 * Math.PI * 62 * (1 - 0.85)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-4xl font-extrabold text-slate-800">85</span>
                <span className="text-xs font-semibold text-slate-400 block mt-0.5">Optimal</span>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-500 text-center leading-relaxed">
              Above <span className="text-indigo-600 font-bold">92%</span> of your weekly average performance.
            </p>
          </div>

          {/* AI Suggestion Purple Card (Col span 4) */}
          <div className="col-span-12 md:col-span-4 rounded-[32px] border border-transparent bg-indigo-600 text-white p-8 shadow-sm flex flex-col justify-between min-h-[340px]">
            <div className="space-y-4">
              <div className="bg-white/10 p-2.5 rounded-2xl w-fit">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold leading-tight">AI Suggestion</h3>
              <p className="text-white/80 font-medium text-sm leading-relaxed">
                You're most productive at <span className="text-white font-bold underline">10 AM</span> — shift <span className="italic font-bold">Advanced Mathematics</span> here for better retention?
              </p>
            </div>
            
            <button
              onClick={handleOptimizePath}
              className="w-full bg-white hover:bg-white/95 text-indigo-600 font-bold text-xs py-3.5 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
            >
              Optimize Path
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          {/* Today's Timetable Card (Col span 4) */}
          <div className="col-span-12 md:col-span-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between min-h-[340px]">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Today's Timetable
                </span>
                <button onClick={() => router.push('/adult/planner')} className="text-xs font-bold text-indigo-600 hover:underline">
                  View All
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="bg-slate-50/50 rounded-2xl p-3 flex items-center justify-between border border-slate-100/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-50 text-teal-600 p-2 rounded-xl">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Deep Work: History</h4>
                      <span className="text-[9px] font-semibold text-slate-400">08:00 AM - 09:30 AM</span>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-emerald-500 fill-emerald-50" />
                </div>

                <div className="bg-slate-50/50 rounded-2xl p-3 flex items-center justify-between border border-indigo-600/20">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                      <Brain className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-indigo-600">Advanced Math</h4>
                      <span className="text-[9px] font-semibold text-slate-400">10:00 AM - 11:30 AM</span>
                    </div>
                  </div>
                  <Circle className="h-5 w-5 text-indigo-600 fill-indigo-50 stroke-[3]" />
                </div>

                <div className="bg-slate-50/50 rounded-2xl p-3 flex items-center justify-between border border-slate-100/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-50 text-amber-700 p-2 rounded-xl">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Language Lab</h4>
                      <span className="text-[9px] font-semibold text-slate-400">01:00 PM - 02:00 PM</span>
                    </div>
                  </div>
                  <Clock className="h-5 w-5 text-slate-300" />
                </div>
              </div>
            </div>

            {/* Timetable completion progress */}
            <div className="space-y-1.5 pt-4">
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '33%' }}></div>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 block text-right">
                1 of 3 blocks completed
              </span>
            </div>
          </div>

          {/* Weekly Concentration Trend Chart (Col span 7) */}
          <div className="col-span-12 md:col-span-7 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">Weekly Concentration Trend</h3>
                <p className="text-xs text-slate-400 font-semibold">Your peak focus hours over the last 7 days.</p>
              </div>
              <select className="border border-slate-200 rounded-xl text-xs font-bold py-1.5 px-3 bg-white text-slate-500 outline-none">
                <option>Last 7 Days</option>
              </select>
            </div>

            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockWeeklyTrend}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} fontWeight={700} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Total Study Hours & Deep Sessions stats (Col span 5) */}
          <div className="col-span-12 md:col-span-5 flex flex-col gap-5">
            
            {/* Total Study Hours */}
            <div className="rounded-[32px] border border-slate-200 bg-indigo-50/40 p-6 shadow-sm flex items-center justify-between flex-1">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  Total Study Hours
                </span>
                <div className="text-3xl font-extrabold text-slate-800">32.4h</div>
              </div>
              <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold py-1 px-3 rounded-full flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                12%
              </span>
            </div>

            {/* Deep Sessions */}
            <div className="rounded-[32px] border border-slate-200 bg-indigo-50/40 p-6 shadow-sm flex items-center justify-between flex-1">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  Deep Sessions
                </span>
                <div className="text-3xl font-extrabold text-slate-800">14</div>
              </div>
              <span className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold py-1 px-3 rounded-full flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3" />
                2
              </span>
            </div>
          </div>

          {/* Pro Tip Banner Card (Col span 12) */}
          <div className="col-span-12 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm grid grid-cols-12 gap-6 items-center">
            
            {/* Desktop illustration styled in CSS/Bento */}
            <div className="col-span-12 md:col-span-4 bg-slate-50 border border-slate-200/60 rounded-2xl h-[160px] flex items-center justify-center p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent"></div>
              {/* Simple stylized desk SVG */}
              <svg className="w-32 h-24 text-slate-400 relative z-10" fill="none" viewBox="0 0 100 80">
                <rect x="15" y="45" width="70" height="4" rx="2" fill="#94a3b8" />
                <line x1="20" y1="49" x2="20" y2="70" stroke="#94a3b8" strokeWidth="3" />
                <line x1="80" y1="49" x2="80" y2="70" stroke="#94a3b8" strokeWidth="3" />
                {/* Laptop */}
                <rect x="35" y="32" width="30" height="13" rx="1.5" fill="#64748b" />
                <line x1="30" y1="45" x2="70" y2="45" stroke="#475569" strokeWidth="2.5" />
                {/* Lamp */}
                <path d="M 75 45 L 75 25 L 70 25" stroke="#cbd5e1" strokeWidth="2" />
                <circle cx="70" cy="25" r="4" fill="#fbbf24" />
              </svg>
            </div>

            {/* Pro Tip details */}
            <div className="col-span-12 md:col-span-8 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 border border-indigo-100 py-1.5 px-3.5 rounded-full w-fit block">
                Pro Tip
              </span>
              <h3 className="text-xl font-bold text-slate-800 leading-snug">
                Optimize your environment for cognitive comfort.
              </h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Recent data shows your focus is 15% higher when you work in naturally lit environments. Consider taking your "Deep Work: History" session near a window today.
              </p>
              
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-sm cursor-pointer">
                Explore Ergonomic Guides
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Floating Timer Button */}
      <button
        onClick={() => router.push('/adult/focus')}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 cursor-pointer z-50"
      >
        <Timer className="h-6 w-6" />
      </button>
    </div>
  );
}
