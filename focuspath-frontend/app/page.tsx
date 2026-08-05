'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Brain, Target, Shield, Award, Users, BookOpen } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50/60 font-sans antialiased text-slate-800">
      {/* Top Navbar */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/focuspath_logo.png"
              alt="FocusPath Logo"
              className="h-12 w-auto object-contain"
            />
            <span className="font-bold text-lg text-slate-800 tracking-tight">FocusPath AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-semibold hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="bg-primary text-white hover:bg-primary/90 text-sm font-semibold py-2.5 px-5 rounded-full transition-all shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl space-y-8 p-6 py-12">
        {/* Hero Section Card (Bento Card) */}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 lg:col-span-8 rounded-[32px] border border-slate-200 bg-white p-8 md:p-12 shadow-sm flex flex-col justify-between min-h-[350px]">
            <div className="space-y-4 max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 bg-primary/5 px-3.5 py-1.5 rounded-full border border-primary/10">
                AI Adaptive Scheduling
              </span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                Unlock your productivity with adaptive, AI-driven study plans.
              </h1>
              <p className="text-slate-500 font-medium text-base md:text-lg">
                Rebuild your schedule automatically when you miss tasks, track focus, block distractions, and gamify academic success.
              </p>
            </div>
            <div className="pt-6 flex flex-wrap gap-4">
              <Link href="/auth/register" className="flex items-center gap-2 bg-primary text-white hover:bg-primary/95 font-semibold text-sm py-3 px-6 rounded-full transition-all shadow-sm group">
                Create Free Account
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Quick Info Bento Card */}
          <div className="col-span-12 lg:col-span-4 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between bg-gradient-to-br from-primary/5 to-transparent">
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Platform Statistics
              </span>
              <div className="space-y-2">
                <div className="text-5xl font-semibold tracking-tight text-slate-800">94.8%</div>
                <div className="text-sm font-semibold text-slate-500">Average Focus Score Improvement</div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Utilizing state-of-the-art Pomodoro sessions and intelligent tab tracking to keep you aligned with your weekly targets.
              </p>
            </div>
            <div className="border-t border-slate-200/60 pt-4 flex justify-between text-slate-500 text-xs font-semibold">
              <span>Web Portal Only</span>
              <span>•</span>
              <span>100% Data Protection</span>
            </div>
          </div>

          {/* Mode Selector Header */}
          <div className="col-span-12 text-center py-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
              Three Specialized Interfaces
            </span>
            <h2 className="text-2xl font-bold text-slate-800 mt-1">Explore FocusPath Modes</h2>
          </div>

          {/* Mode Cards - Adult Mode */}
          <div className="col-span-12 md:col-span-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all duration-300 group">
            <div className="space-y-4">
              <div className="bg-primary/5 text-primary p-3 rounded-2xl w-fit group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Adult Mode</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Perfect for professionals and self-directed students. Create schedules, launch focus timers, track tab behavior metrics, and generate AI schedules.
              </p>
            </div>
            <Link href="/auth/login?role=ADULT" className="text-xs font-bold text-primary flex items-center gap-1.5 pt-6 group-hover:underline">
              Enter Adult Portal
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Parent Mode Card */}
          <div className="col-span-12 md:col-span-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-indigo-600/30 transition-all duration-300 group">
            <div className="space-y-4">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Parent Mode</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Manage your child's limits. View analytics, authorize logins, lock down apps and blacklisted sites, and grant temporary access window.
              </p>
            </div>
            <Link href="/auth/login?role=PARENT" className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 pt-6 group-hover:underline">
              Enter Parent Portal
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Kid Mode Card */}
          <div className="col-span-12 md:col-span-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-emerald-600/30 transition-all duration-300 group">
            <div className="space-y-4">
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Kid Mode</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Gamified space for younger learners. Complete quest schedules, follow custom restrictions, read stories, unlock badges, and redeem stars.
              </p>
            </div>
            <Link href="/auth/login?role=KID" className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 pt-6 group-hover:underline">
              Enter Kid Portal
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Platform Core Benefits Row */}
          <div className="col-span-12 md:col-span-6 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm flex items-start gap-4">
            <div className="bg-primary/5 p-3 rounded-2xl text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800">Collaborative Ecosystem</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Parents easily build timetables, verify kids progress reports, and approve login lockouts instantly via real-time alerts.
              </p>
            </div>
          </div>

          <div className="col-span-12 md:col-span-6 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm flex items-start gap-4">
            <div className="bg-primary/5 p-3 rounded-2xl text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800">Gamified Reading Quests</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Encourage children to follow through with schedules using story-based quest progression that unlocks badges and star credits.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8 text-center text-xs text-slate-400 font-semibold">
        <p>&copy; {new Date().getFullYear()} FocusPath AI. Designed for Enterprise-grade Productivity Management.</p>
      </footer>
    </div>
  );
}
