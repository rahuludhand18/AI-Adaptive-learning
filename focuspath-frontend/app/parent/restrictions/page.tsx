'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { apiRequest } from '@/lib/api';
import {
  Settings,
  Shield,
  LayoutDashboard,
  Lock,
  User,
  Plus,
  Compass,
  FileText,
  Activity,
  Award,
  BookOpen,
  Clock
} from 'lucide-react';

export default function ParentRestrictions() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [khanToggle, setKhanToggle] = useState(true);
  const [wikiToggle, setWikiToggle] = useState(true);
  const [ytToggle, setYtToggle] = useState(false);
  const [filterIntensity, setFilterIntensity] = useState<'Standard' | 'Strict' | 'Curated Only'>('Standard');
  const [timeLimit, setTimeLimit] = useState(3);
  const [eyeBreak, setEyeBreak] = useState(true);

  const handleSave = () => {
    alert('Safety restrictions saved successfully!');
    router.push('/parent/dashboard');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans antialiased text-slate-800 flex">
      
      {/* Left Sidebar Menu */}
      <aside className="w-64 bg-slate-50 border-r border-slate-200/60 flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
        <div className="space-y-8">
          {/* Logo Branding */}
          <div className="space-y-2">
            <img
              src="/focuspath_logo.png"
              alt="FocusPath Logo"
              className="h-12 w-auto object-contain"
            />
            <div className="space-y-0.5">
              <h1 className="text-xl font-bold text-amber-900 tracking-tight">StudyBuddy</h1>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Parent Dashboard
              </div>
              <div className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                Manage Learning
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => router.push('/parent/dashboard')}
              className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-pointer text-left"
            >
              <Activity className="h-4.5 w-4.5" />
              Monitoring
            </button>

            <button className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold bg-white text-indigo-600 border border-slate-200 shadow-sm relative text-left">
              <span className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-r-md"></span>
              <Lock className="h-4.5 w-4.5" />
              Restrictions
            </button>

            <button className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-pointer text-left">
              <User className="h-4.5 w-4.5" />
              Account
            </button>
          </nav>
        </div>

        {/* Bottom Gear Settings */}
        <button className="flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer text-left">
          <Settings className="h-4.5 w-4.5" />
          Settings
        </button>
      </aside>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col justify-between h-screen overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-100 px-8 h-16 flex items-center justify-between shrink-0">
          <nav className="flex items-center gap-8 h-full">
            <button onClick={() => router.push('/parent/dashboard')} className="h-16 flex items-center text-sm font-semibold text-slate-400 hover:text-slate-600 cursor-pointer">
              Home
            </button>
            <button className="h-16 flex items-center text-sm font-semibold text-slate-400 hover:text-slate-600 cursor-pointer">
              Story
            </button>
            <button className="h-16 flex items-center text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600 px-1 cursor-pointer">
              Rewards
            </button>
          </nav>

          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
            {user.username.slice(0,2).toUpperCase()}
          </div>
        </header>

        {/* Inner Content Body */}
        <main className="p-8 space-y-6 flex-1 max-w-5xl w-full mx-auto">
          
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Manage Restrictions</h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Configure safety boundaries and digital well-being for your child's learning journey.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-5">
            
            {/* Allowed Content Bento Box (Col span 7) */}
            <div className="col-span-12 lg:col-span-7 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
              
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-800">Allowed content & websites</h3>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1 cursor-pointer shadow-sm">
                  <Plus className="h-3.5 w-3.5" />
                  Add New
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                
                {/* Khan Academy */}
                <div className="bg-slate-50/40 border border-slate-100/50 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl">
                      <BookOpen className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Khan Academy</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">Educational Platform</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setKhanToggle(!khanToggle)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      khanToggle ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      khanToggle ? 'right-1' : 'left-1'
                    }`}></span>
                  </button>
                </div>

                {/* Wikipedia for Kids */}
                <div className="bg-slate-50/40 border border-slate-100/50 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-50 text-amber-700 p-2.5 rounded-xl">
                      <Compass className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Wikipedia for Kids</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">General Knowledge</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setWikiToggle(!wikiToggle)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      wikiToggle ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      wikiToggle ? 'right-1' : 'left-1'
                    }`}></span>
                  </button>
                </div>

                {/* YouTube Kids */}
                <div className="bg-slate-50/40 border border-slate-100/50 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-50 text-teal-600 p-2.5 rounded-xl">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">YouTube Kids</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">Video Content</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setYtToggle(!ytToggle)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      ytToggle ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      ytToggle ? 'right-1' : 'left-1'
                    }`}></span>
                  </button>
                </div>

              </div>

              {/* Content Filtering Intensity */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700">Content Filtering Intensity</h4>
                
                <div className="grid grid-cols-3 gap-3">
                  {['Standard', 'Strict', 'Curated Only'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFilterIntensity(level as any)}
                      className={`py-3.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        filterIntensity === level
                          ? 'border-indigo-600 bg-indigo-50/30 text-indigo-600'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Limits & Reminders Columns (Col span 5) */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-5">
              
              {/* Daily Time Limit Card */}
              <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="h-4.5 w-4.5 text-slate-400" />
                  Daily time limit
                </h3>

                <div className="space-y-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-indigo-600">{timeLimit}</span>
                    <span className="text-sm font-bold text-slate-500">hours per day</span>
                  </div>
                  
                  {/* Hours slider */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={0}
                      max={12}
                      step={1}
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>0h</span>
                      <span>6h</span>
                      <span>12h</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    The app will automatically lock and display a "Rest Time" screen once the limit is reached.
                  </p>
                </div>
              </div>

              {/* Reminders & Patterns Card */}
              <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6">
                
                {/* Eye break row */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                      20-minute Eye-break reminders
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      Encourages the 20-20-20 rule to reduce digital eye strain.
                    </p>
                  </div>
                  <button
                    onClick={() => setEyeBreak(!eyeBreak)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      eyeBreak ? 'bg-teal-500' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      eyeBreak ? 'right-1' : 'left-1'
                    }`}></span>
                  </button>
                </div>

                {/* Morse code patterns */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800">Set/change Morse code pattern</h4>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      A tactile way for parents to bypass restrictions without using a keyboard.
                    </p>
                  </div>
                  <button className="w-full border-2 border-dashed border-amber-800 text-amber-800 bg-amber-50/20 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-amber-50/50 cursor-pointer">
                    📱 Configure Pattern
                  </button>
                </div>

              </div>

            </div>

          </div>
        </main>

        {/* Action Bottom Bar */}
        <footer className="bg-white border-t border-slate-200/60 p-4 shrink-0 px-8 flex justify-between items-center z-10">
          <button
            onClick={() => router.push('/parent/dashboard')}
            className="py-3.5 px-6 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
          >
            Discard
          </button>
          
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3.5 px-8 rounded-2xl shadow-sm transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </footer>

      </div>

    </div>
  );
}
