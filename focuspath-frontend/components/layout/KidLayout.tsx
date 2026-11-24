'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useTabTracker } from '@/hooks/useTabTracker';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AiAssistant } from '@/components/AiAssistant';
import { apiRequest } from '@/lib/api';
import {
  Home,
  BookOpen,
  Trophy,
  LogOut,
  GraduationCap,
  Puzzle,
  Users,
  Calendar,
  AlertTriangle,
  School,
  X,
  BookMarked,
  ClipboardList,
  Star,
  User as UserIcon,
  Pencil,
  Check
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface SubjectInfo {
  id: number;
  name: string;
  target_exam_date: string | null;
  color_code?: string;
  difficulty?: string;
}

interface KidProfileInfo {
  id: number;
  username: string;
  grade_level: string;
  age_group: string;
}

// ── Kid Profile Modal ──────────────────────────────────────────────────────────
function KidProfileModal({
  onClose,
  childProfile,
  subjects,
}: {
  onClose: () => void;
  childProfile: KidProfileInfo | null;
  subjects: SubjectInfo[];
}) {
  const childId = childProfile?.id;
  const lsKey = (k: string) => `kid_${k}_${childId}`;

  const [school, setSchool] = useState('');
  const [midterm, setMidterm] = useState('');
  const [editingSchool, setEditingSchool] = useState(false);
  const [editingMidterm, setEditingMidterm] = useState(false);
  const [schoolDraft, setSchoolDraft] = useState('');
  const [midtermDraft, setMidtermDraft] = useState('');

  useEffect(() => {
    if (!childId) return;
    setSchool(localStorage.getItem(lsKey('school')) || 'FocusPath International School');
    setMidterm(localStorage.getItem(lsKey('midterm')) || '');
  }, [childId]);

  const saveSchool = () => {
    const v = schoolDraft.trim() || 'FocusPath International School';
    setSchool(v); localStorage.setItem(lsKey('school'), v); setEditingSchool(false);
  };
  const saveMidterm = () => {
    const v = midtermDraft.trim();
    setMidterm(v); if (v) localStorage.setItem(lsKey('midterm'), v); setEditingMidterm(false);
  };
  const startEditSchool = () => { setSchoolDraft(school); setEditingSchool(true); };
  const startEditMidterm = () => { setMidtermDraft(midterm); setEditingMidterm(true); };

  // Grade — show as "Class 6" (or "Grade 6" if no number)
  const gradeRaw = childProfile?.grade_level || '';
  const gradeDisplay = gradeRaw
    ? gradeRaw.replace(/^Grade\s+(\d)/i, 'Class $1')
    : 'N/A';
  // Separate class number for the big badge
  const classNumber = gradeRaw.match(/\d+/)?.[0] || null;
  const classLabel = classNumber ? `Class ${classNumber}` : gradeDisplay;

  // Age map
  const ageMap: Record<string, string> = {
    '4-6': '4 – 6 yrs', '7-8': '7 – 8 yrs',
    '9-10': '9 – 10 yrs', '11-12': '11 – 12 yrs', '13-15': '13 – 15 yrs',
  };
  const ageDisplay = ageMap[childProfile?.age_group || ''] || (childProfile?.age_group ? childProfile.age_group + ' yrs' : 'N/A');

  // Final exam
  const finalExamDate = subjects.map((s) => s.target_exam_date).filter(Boolean).sort()[0];

  const fmtDate = (d: string | null | undefined) => {
    if (!d) return null;
    try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return d; }
  };

  const subjectColors: Record<string, string> = {
    Maths: 'bg-blue-100 text-blue-700 border-blue-200',
    Mathematics: 'bg-blue-100 text-blue-700 border-blue-200',
    English: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Science: 'bg-violet-100 text-violet-700 border-violet-200',
    History: 'bg-amber-100 text-amber-700 border-amber-200',
    Geography: 'bg-teal-100 text-teal-700 border-teal-200',
    Physics: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    Chemistry: 'bg-rose-100 text-rose-700 border-rose-200',
    Biology: 'bg-lime-100 text-lime-700 border-lime-200',
  };
  const getSubjectColor = (name: string) =>
    subjectColors[name] || 'bg-orange-100 text-orange-700 border-orange-200';

  const initials = childProfile?.username?.slice(0, 2).toUpperCase() ?? 'KD';

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-4">

        {/* ── Close ── */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="h-4 w-4 text-white" />
        </button>

        {/* ── Hero Banner ── */}
        <div className="bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-300 dark:from-orange-600 dark:via-amber-600 dark:to-yellow-500 px-7 pt-9 pb-7 relative overflow-hidden">
          {/* dot pattern */}
          <div className="absolute inset-0 opacity-[0.12]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
          <div className="relative flex items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-3xl bg-white/30 border-2 border-white/50 flex items-center justify-center text-3xl font-bold text-white shadow-xl shrink-0">
              {initials}
            </div>
            {/* Name + grade */}
            <div>
              <h2 className="text-3xl font-bold text-white drop-shadow">{childProfile?.username || 'Student'}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 bg-white/90 text-orange-600 text-sm font-bold px-3 py-1 rounded-full shadow-sm">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {classLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/25 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {gradeRaw || 'Student'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Divider line so orange ends cleanly ── */}
        <div className="h-px bg-orange-100 dark:bg-slate-700" />

        {/* ── Body Cards ── */}
        <div className="px-6 pt-5 pb-7 space-y-4">

          {/* Row 1: Class / Age / School as 3 columns */}
          <div className="grid grid-cols-3 gap-3">
            {/* Class Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex flex-col gap-2">
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Class</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-0.5 leading-tight">{classLabel}</p>
                {classNumber && (
                  <p className="text-[10px] text-slate-400 mt-0.5">{gradeRaw}</p>
                )}
              </div>
            </div>

            {/* Age Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex flex-col gap-2">
              <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Age</p>
                <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5 leading-tight">{ageDisplay}</p>
              </div>
            </div>

            {/* School Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
                  <School className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                {!editingSchool && (
                  <button onClick={startEditSchool} className="text-slate-300 hover:text-sky-500 transition-colors cursor-pointer mt-1">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">School</p>
                {editingSchool ? (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      autoFocus value={schoolDraft}
                      onChange={(e) => setSchoolDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveSchool(); if (e.key === 'Escape') setEditingSchool(false); }}
                      className="text-xs font-semibold w-full bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-700 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-sky-400/40 text-slate-800 dark:text-slate-100"
                    />
                    <button onClick={saveSchool} className="shrink-0 w-6 h-6 bg-sky-500 rounded-lg flex items-center justify-center cursor-pointer">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5 leading-snug break-words">{school}</p>
                )}
              </div>
            </div>
          </div>

          {/* Subjects Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <BookMarked className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Enrolled Subjects</p>
            </div>
            {subjects.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No subjects enrolled yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {subjects.map((s) => (
                  <span key={s.id} className={`px-4 py-2 rounded-xl text-sm font-bold border ${getSubjectColor(s.name)}`}>
                    {s.name}
                    {s.difficulty && <span className="ml-1.5 opacity-60 font-medium text-xs">· {s.difficulty}</span>}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Exam Timelines Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
                <ClipboardList className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Exam Timeline</p>
            </div>
            <div className="space-y-3.5">
              {/* Mid Term */}
              <div className="flex items-center justify-between gap-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mid-Term Exam</span>
                </div>
                {editingMidterm ? (
                  <div className="flex items-center gap-1.5">
                    <input autoFocus type="date" value={midtermDraft}
                      onChange={(e) => setMidtermDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveMidterm(); if (e.key === 'Escape') setEditingMidterm(false); }}
                      className="text-xs border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-amber-400/40 text-slate-800 dark:text-slate-100"
                    />
                    <button onClick={saveMidterm} className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center cursor-pointer shrink-0">
                      <Check className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${midterm ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400 italic text-xs'}`}>
                      {midterm ? fmtDate(midterm) : 'Tap ✏️ to set'}
                    </span>
                    <button onClick={startEditMidterm} className="text-slate-300 hover:text-amber-500 transition-colors cursor-pointer">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              {/* Final Exam */}
              <div className="flex items-center justify-between gap-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Final Exam</span>
                </div>
                <span className={`text-sm font-bold ${finalExamDate ? 'text-rose-700 dark:text-rose-400' : 'text-slate-400 italic text-xs'}`}>
                  {finalExamDate ? fmtDate(finalExamDate) : 'Not set'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KidLayoutProps {
  children: ReactNode;
  starsCount?: number;
}

export default function KidLayout({ children, starsCount }: KidLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetchedStars, setFetchedStars] = useState<number>(0);

  // ── Kid Profile Modal state ────────────────────────────────────────────────
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [kidProfile, setKidProfile] = useState<KidProfileInfo | null>(null);
  const [kidSubjects, setKidSubjects] = useState<SubjectInfo[]>([]);

  // Load active child profile from localStorage (set by MorseCodeLoginModal)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('activeChildProfile');
      if (stored) {
        setKidProfile(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Fetch subjects when profile modal is opened
  useEffect(() => {
    if (!showProfileModal) return;
    apiRequest<SubjectInfo[]>('/api/planner/subjects/')
      .then((data) => setKidSubjects(Array.isArray(data) ? data : []))
      .catch(() => setKidSubjects([]));
  }, [showProfileModal]);

  useEffect(() => {
    if (starsCount === undefined) {
      apiRequest<{ balance: number }>('/api/rewards/wallet/')
        .then((w) => setFetchedStars(w.balance ?? 0))
        .catch(() => setFetchedStars(0));
    }
  }, [starsCount]);

  const displayStars = starsCount !== undefined ? starsCount : fetchedStars;

  // Enable Tab tracking for kids mode and get UI states
  const { showWarning, setShowWarning, isLockedOut, tabSwitchCount } = useTabTracker();

  const topNavItems = [
    { name: 'Home', href: '/kid/dashboard', icon: Home, color: 'text-kid-orange', activeBg: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25' },
    { name: 'Schedule', href: '/kid/planner', icon: Calendar, color: 'text-kid-sky', activeBg: 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md shadow-sky-500/25' },
    { name: 'Learn', href: '/kid/learn', icon: GraduationCap, color: 'text-kid-grass', activeBg: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/25' },
    { name: 'Quests', href: '/kid/quests', icon: Puzzle, color: 'text-amber-500', activeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/25' },
    { name: 'Story', href: '/kid/stories', icon: BookOpen, color: 'text-kid-violet', activeBg: 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-purple-500/25' },
    { name: 'Rewards', href: '/kid/rewards', icon: Trophy, color: 'text-kid-coral', activeBg: 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md shadow-rose-500/25' },
  ];

  const userInitial = user?.username ? user.username.slice(0, 2).toUpperCase() : 'KD';

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 font-sans antialiased flex flex-col transition-colors relative z-10">
      
      {/* Top Navbar — Soft gradient fill instead of flat white */}
      <header className="bg-gradient-to-r from-white via-orange-50/40 to-amber-50/30 dark:from-[#0b0f17] dark:via-[#161220] dark:to-[#0b0f17] backdrop-blur-xl border-b-2 border-orange-100/60 dark:border-slate-800/80 px-4 sm:px-8 h-18 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-xs transition-colors">
        {/* Left: Brand Logo & Mascot Wink */}
        <div className="flex items-center gap-3">
          <Link href="/kid/dashboard" className="flex items-center gap-2.5 group">
            <img
              src="/focuspath_logo.png"
              alt="FocusPath"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-2xl animate-kid-bob">🦉</span>
          </Link>
        </div>

        {/* Center Nav Links with Icons & Bouncy Pills */}
        <nav className="hidden sm:flex items-center gap-1.5 md:gap-2.5 h-full py-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md px-3 rounded-full border border-orange-100/40 dark:border-slate-800/60">
          {topNavItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComp = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`py-2 px-3.5 rounded-full flex items-center gap-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? item.activeBg + ' scale-105'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:scale-102'
                }`}
              >
                <IconComp className={`h-4 w-4 ${isActive ? 'text-white animate-kid-wiggle' : item.color}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Right User Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Star Balance Pill */}
          <button
            onClick={() => router.push('/kid/rewards')}
            className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 border-2 border-amber-300/90 text-amber-950 text-xs font-extrabold py-2 px-3.5 sm:px-4 rounded-full flex items-center gap-2 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Star Balance"
          >
            <span className="text-amber-950 text-base font-extrabold animate-kid-bounce-subtle">⭐</span>
            <span className="tracking-tight animate-kid-count-up">{displayStars} Stars</span>
          </button>

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              suppressHydrationWarning
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 text-white font-extrabold text-xs flex items-center justify-center shadow-md ring-4 ring-orange-400/30 hover:ring-orange-400/60 hover:scale-105 transition-all cursor-pointer"
              title="Kid Profile"
            >
              {userInitial}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-orange-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user?.username || 'Kid Explorer'}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Kid Mode Active
                  </p>
                </div>
                {/* View Profile */}
                <button
                  onClick={() => { setShowDropdown(false); setShowProfileModal(true); }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer text-left"
                >
                  <GraduationCap className="h-4 w-4 text-emerald-500" />
                  View Profile
                </button>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    document.cookie = 'activeRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    router.push('/select-profile');
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer text-left"
                >
                  <Users className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  Switch Profile
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                    router.push('/auth/login');
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="flex-1 flex flex-col overflow-y-auto relative z-10">
        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* WARNING MODAL (Tab Switch Focus Loss) */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] max-w-md w-full p-8 border-4 border-orange-300 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="w-20 h-20 bg-orange-100 dark:bg-orange-950/60 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-kid-bob">
              <span className="text-4xl">🦉</span>
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-orange-200 dark:border-orange-800">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                <span>Focus Warning</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Focus Lost! ⚠️</h2>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                You left the FocusPath tab! (Strike {tabSwitchCount} of 3)
              </p>
              <p className="text-xs text-rose-500 dark:text-rose-400 font-bold">
                If you reach 3 strikes, your session will automatically lock.
              </p>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              I understand, let me back in!
            </button>
          </div>
        </div>
      )}

      {/* LOCKOUT SCREEN (3 Strikes Tab Switch) */}
      {isLockedOut && (
        <div className="fixed inset-0 z-[200] bg-gradient-to-br from-rose-950 via-rose-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-xl space-y-8 animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-rose-900/60 border-4 border-rose-500/40 rounded-full flex items-center justify-center mx-auto text-6xl shadow-2xl animate-kid-float">
              🚫
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">Session Terminated</h2>
              <p className="text-lg text-rose-200/80 font-medium max-w-md mx-auto">
                You switched tabs 3 times. Your parent has been notified.
              </p>
              <p className="text-sm text-rose-300/60 font-medium max-w-md mx-auto animate-pulse">
                Logging you out automatically...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Kid Profile Modal */}
      {showProfileModal && (
        <KidProfileModal
          onClose={() => setShowProfileModal(false)}
          childProfile={kidProfile}
          subjects={kidSubjects}
        />
      )}

      {/* Floating AI Assistant Chatbot */}
      <AiAssistant />

    </div>
  );
}
