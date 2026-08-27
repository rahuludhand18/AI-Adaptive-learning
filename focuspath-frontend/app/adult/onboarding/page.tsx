'use client';

import React, { useState, useEffect } from 'react';
import { generateSchedule, uploadSyllabus, clearSchedule, listSubjects, deleteSubject, Subject, fetchUserRoutine, saveUserRoutine } from '@/lib/plannerApi';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { useFocusStore } from '@/store/useFocusStore';
import { COPY } from '@/constants/copy';
import {
  UploadCloud,
  Plus,
  Trash2,
  BookOpen,
  CheckCircle2,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function AdultOnboardingPage() {
  const router = useRouter();
  const { subjects, setSubjects, clearSubjects, dailyHours, setDailyHours, userRoutine, setUserRoutine } = useFocusStore();

  const [newSubjectName, setNewSubjectName] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [planType, setPlanType] = useState<'Study' | 'Revision'>('Study');
  const [dailySubjectHours, setDailySubjectHours] = useState(2);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isParsingSyllabus, setIsParsingSyllabus] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Accordion state
  const [expandedSubjectId, setExpandedSubjectId] = useState<number | null>(null);

  const [routine, setRoutine] = useState({
    morning_study_start: '07:00',
    morning_study_end: '09:00',
    work_college_start: '10:00',
    work_college_end: '16:00',
    evening_study_start: '17:00',
    evening_study_end: '20:00',
    snack_time_start: '16:00',
    snack_time_end: '16:30',
    dinner_time_start: '20:00',
    dinner_time_end: '21:00',
  });

  const [overflowData, setOverflowData] = useState<{ hours: number, message: string } | null>(null);
  const [weekendWarrior, setWeekendWarrior] = useState(false);

  const [finishBy, setFinishBy] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });

  // Effect to auto-update daily_subject_hours when difficulty changes
  useEffect(() => {
    if (difficulty === 'Easy') setDailySubjectHours(1);
    else if (difficulty === 'Medium') setDailySubjectHours(2);
    else if (difficulty === 'Hard') setDailySubjectHours(3);
  }, [difficulty]);

  // Effect for date validation (Study Mode)
  useEffect(() => {
    if (!finishBy) return;
    const examDate = new Date(finishBy);
    const today = new Date();
    const diffTime = Math.abs(examDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 60 && planType === 'Study') {
      setPlanType('Revision');
    }
  }, [finishBy, planType]);

  const isStudyDisabled = () => {
    if (!finishBy) return false;
    const examDate = new Date(finishBy);
    const today = new Date();
    const diffTime = Math.abs(examDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 60;
  };

  const loadSubjects = async () => {
    try {
      const data = await listSubjects();
      setSubjects(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadRoutine = async () => {
    try {
      const routineData = await fetchUserRoutine();
      if (routineData && routineData.morning_study_start) {
        setUserRoutine(routineData);
        setDailyHours(routineData.default_daily_hours || 2);
      }
    } catch (e) {
      console.log('No global routine found or error fetching.');
    }
  };

  useEffect(() => {
    loadSubjects();
    if (!userRoutine) {
      loadRoutine();
    }
  }, []);

  const handleDeleteSingleSubject = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // prevent accordion from expanding
    try {
      await deleteSubject(id);
      const updated = await listSubjects();
      setSubjects(updated);
      useFocusStore.getState().setSubjects(updated);
    } catch (err) {
      console.error(err);
      alert('Failed to delete subject');
    }
  };

  const processSyllabusFile = async (file: File) => {
    if (!newSubjectName.trim()) {
      alert("Please type a Subject Name before uploading the syllabus.");
      return;
    }
    setUploadedFileName(file.name);
    setIsParsingSyllabus(true);
    try {
      await uploadSyllabus(file, newSubjectName.trim(), difficulty);
      setNewSubjectName('');
      await loadSubjects();
    } catch (e: any) {
      alert(e.message || "Upload failed");
    } finally {
      setIsParsingSyllabus(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSyllabusFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSyllabusFile(e.dataTransfer.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!subjects.length) {
      router.push('/adult/dashboard');
      return;
    }
    setIsGenerating(true);
    setOverflowData(null);
    try {
      // If no global routine exists yet, save it first
      if (!userRoutine) {
        const newRoutine = await saveUserRoutine({
          ...routine,
          default_daily_hours: dailyHours
        });
        setUserRoutine(newRoutine);
      }

      // For each subject, generate its timetable
      for (const sub of subjects) {
        await generateSchedule({
          subject_id: sub.id,
          daily_hours: dailyHours, // global limit
          weekend_warrior: weekendWarrior,
          target_exam_date: finishBy,
          plan_type: planType,
          difficulty: difficulty,
          daily_subject_hours: dailySubjectHours
        });
      }
      router.push('/adult/planner'); 
    } catch (err: any) {
      if (err.errors?.status === 'overflow' || err.status === 'overflow') {
         setOverflowData({ 
           hours: err.errors?.unallocated_hours || err.unallocated_hours || 0, 
           message: err.message 
         });
      } else {
         alert(err.message || 'Generation failed');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg dark:bg-[#0b0f17] flex flex-col font-sans antialiased text-textPrimary dark:text-slate-100 transition-colors">
      <TopNav />

      <PageContainer>
        {/* Header Title */}
        <div className="space-y-1 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-textPrimary dark:text-slate-100 tracking-tight">
            {COPY.onboarding.heading}
          </h1>
          <p className="text-sm text-textSecondary dark:text-slate-400 font-medium">
            {COPY.onboarding.subheading}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          
          {/* Left Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Subject Name Input + Upload */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-textPrimary dark:text-slate-100">
                1. Name Your Subject
              </h2>
              <input
                type="text"
                placeholder="e.g. Cognitive Psychology"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo/50 transition-all font-medium"
              />

              <div className="pt-2">
                <h2 className="text-base font-bold text-textPrimary dark:text-slate-100 mb-2">
                  2. Plan Type & Difficulty
                </h2>
                
                {/* Segmented Control for Plan Type */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4 relative">
                  <button
                    onClick={() => {
                      if (!isStudyDisabled()) setPlanType('Study');
                    }}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      planType === 'Study' 
                        ? 'bg-white dark:bg-slate-700 text-indigo shadow-sm' 
                        : isStudyDisabled() 
                          ? 'text-slate-400 cursor-not-allowed opacity-50' 
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                    disabled={isStudyDisabled()}
                    title={isStudyDisabled() ? "Exam is less than 2 months away. Study Mode disabled." : ""}
                  >
                    Study Mode
                  </button>
                  <button
                    onClick={() => setPlanType('Revision')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      planType === 'Revision' 
                        ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    Revision Mode
                  </button>
                </div>
                
                {isStudyDisabled() && (
                  <p className="text-xs text-rose-500 font-semibold mb-4 bg-rose-50 p-2 rounded-lg">
                    ⚠️ Exam is less than 2 months away. Study Mode disabled.
                  </p>
                )}

                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo/50 transition-all font-medium mb-4"
                >
                  <option value="Easy">Easy (Fewer hours)</option>
                  <option value="Medium">Medium (Standard hours)</option>
                  <option value="Hard">Hard (More hours)</option>
                </select>

                {/* Stepper for Daily Subject Hours */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                  <span className="text-sm font-bold text-textPrimary dark:text-slate-200">
                    Daily Hours for this Subject
                  </span>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setDailySubjectHours(Math.max(1, dailySubjectHours - 1))}
                      className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-base font-bold w-4 text-center">{dailySubjectHours}</span>
                    <button 
                      onClick={() => setDailySubjectHours(Math.min(12, dailySubjectHours + 1))}
                      className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h2 className="text-base font-bold text-textPrimary dark:text-slate-100 mb-2">
                  3. Upload Syllabus PDF
                </h2>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center text-center ${
                    isDragOver ? 'border-indigo bg-indigo/5 scale-[1.02]' : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-indigo/10 text-indigo flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  
                  <p className="text-sm font-medium text-textSecondary dark:text-slate-400 max-w-xs mb-4">
                    Drag your PDF here or click below to upload. The AI will extract modules.
                  </p>

                  <label className="cursor-pointer py-2.5 px-6 bg-indigo text-white font-semibold text-sm rounded-xl hover:bg-indigo-dark transition-all shadow-sm active:scale-95 inline-flex items-center space-x-2">
                    <input
                      type="file"
                      accept=".txt,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isParsingSyllabus}
                    />
                    <FileText className="w-4 h-4" />
                    <span>{isParsingSyllabus ? "Extracting..." : "Upload & Parse"}</span>
                  </label>
                  
                  {isParsingSyllabus && (
                    <div className="mt-4 flex items-center space-x-2 text-xs font-semibold text-indigo animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI is extracting modules & topics...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 4: Timetable Details */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-textPrimary dark:text-slate-100 flex items-center justify-between">
                <span>4. Configure Availability</span>
                {userRoutine && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full uppercase tracking-wider">
                    ✅ Global Routine Applied
                  </span>
                )}
              </h2>
              
              {!userRoutine ? (
                <div className="space-y-4">
                  {/* Morning Study */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="col-span-2 text-xs font-bold text-indigo">Morning Study Window</div>
                    <div>
                      <label className="block text-[10px] font-semibold text-textSecondary mb-1 uppercase tracking-wider">Start</label>
                      <input
                        type="time"
                        value={routine.morning_study_start}
                        onChange={(e) => setRoutine({ ...routine, morning_study_start: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-textSecondary mb-1 uppercase tracking-wider">End</label>
                      <input
                        type="time"
                        value={routine.morning_study_end}
                        onChange={(e) => setRoutine({ ...routine, morning_study_end: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Evening Study */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="col-span-2 text-xs font-bold text-indigo">Evening Study Window</div>
                    <div>
                      <label className="block text-[10px] font-semibold text-textSecondary mb-1 uppercase tracking-wider">Start</label>
                      <input
                        type="time"
                        value={routine.evening_study_start}
                        onChange={(e) => setRoutine({ ...routine, evening_study_start: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-textSecondary mb-1 uppercase tracking-wider">End</label>
                      <input
                        type="time"
                        value={routine.evening_study_end}
                        onChange={(e) => setRoutine({ ...routine, evening_study_end: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium"
                      />
                    </div>
                  </div>
                  
                  {/* Visual Blocks (Work, Snack, Dinner) */}
                  <div className="grid grid-cols-2 gap-4 bg-rose-50/50 dark:bg-rose-950/20 p-3 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                    <div className="col-span-2 text-xs font-bold text-rose-600 dark:text-rose-400">Blocked Times (No Study)</div>
                    
                    {/* Work/College */}
                    <div>
                      <label className="block text-[10px] font-semibold text-textSecondary mb-1 uppercase tracking-wider">Work/College Start</label>
                      <input
                        type="time"
                        value={routine.work_college_start}
                        onChange={(e) => setRoutine({ ...routine, work_college_start: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-textSecondary mb-1 uppercase tracking-wider">Work/College End</label>
                      <input
                        type="time"
                        value={routine.work_college_end}
                        onChange={(e) => setRoutine({ ...routine, work_college_end: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium"
                      />
                    </div>

                    {/* Meals */}
                    <div>
                      <label className="block text-[10px] font-semibold text-textSecondary mb-1 uppercase tracking-wider">Snack Start</label>
                      <input
                        type="time"
                        value={routine.snack_time_start}
                        onChange={(e) => setRoutine({ ...routine, snack_time_start: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-textSecondary mb-1 uppercase tracking-wider">Snack End</label>
                      <input
                        type="time"
                        value={routine.snack_time_end}
                        onChange={(e) => setRoutine({ ...routine, snack_time_end: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-semibold text-textSecondary mb-1 uppercase tracking-wider">Dinner Start</label>
                      <input
                        type="time"
                        value={routine.dinner_time_start}
                        onChange={(e) => setRoutine({ ...routine, dinner_time_start: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-textSecondary mb-1 uppercase tracking-wider">Dinner End</label>
                      <input
                        type="time"
                        value={routine.dinner_time_end}
                        onChange={(e) => setRoutine({ ...routine, dinner_time_end: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-textSecondary mb-2">Your routine is set globally for all subjects.</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    🌅 Morning: {userRoutine.morning_study_start?.slice(0, 5)} - {userRoutine.morning_study_end?.slice(0, 5)}
                  </p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    🌙 Evening: {userRoutine.evening_study_start?.slice(0, 5)} - {userRoutine.evening_study_end?.slice(0, 5)}
                  </p>
                  <button onClick={() => setUserRoutine(null)} className="text-xs font-bold text-indigo mt-3 hover:underline">
                    Edit Global Routine
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-textSecondary mb-1.5 uppercase tracking-wider">Exam Date</label>
                  <input
                    type="date"
                    value={finishBy}
                    onChange={(e) => setFinishBy(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-textSecondary mb-1.5 uppercase tracking-wider">Daily Hours</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || subjects.length === 0}
                className="w-full py-3.5 mt-2 bg-textPrimary dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center justify-center space-x-2 transition-all hover:bg-slate-800 cursor-pointer"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                <span>{isGenerating ? 'Generating Schedule...' : 'Generate AI Schedule'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Extracted Subjects */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center space-x-2 text-textPrimary dark:text-slate-100">
                  <BookOpen className="w-5 h-5 text-indigo" />
                  <h3 className="font-bold text-base">Parsed Subjects & Modules</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {subjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-textSecondary px-6">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-semibold text-sm">No subjects added yet.</p>
                    <p className="text-xs mt-1">Name your subject and upload a syllabus to see the extracted modules here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subjects.map((subject) => {
                      const isExpanded = expandedSubjectId === subject.id;
                      return (
                        <div key={subject.id} className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200">
                          {/* Accordion Header */}
                          <div 
                            onClick={() => setExpandedSubjectId(isExpanded ? null : subject.id)}
                            className="bg-white hover:bg-slate-50 cursor-pointer p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo/10 text-indigo flex items-center justify-center">
                                <BookOpen className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-textPrimary text-sm">{subject.name}</h4>
                                <p className="text-xs text-textSecondary font-medium">{subject.modules.length} Modules Extracted</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 text-slate-400">
                              <button
                                onClick={(e) => handleDeleteSingleSubject(e, subject.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Subject"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                          </div>

                          {/* Accordion Body */}
                          {isExpanded && (
                            <div className="bg-slate-50 p-4 border-t border-slate-100 space-y-3">
                              {subject.modules.map((mod) => (
                                <div key={mod.id} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                                  <h5 className="text-sm font-bold text-textPrimary mb-2">{mod.title}</h5>
                                  <div className="space-y-1.5 pl-2 border-l-2 border-indigo/20">
                                    {mod.topics.map((topic) => (
                                      <div key={topic.id} className="flex justify-between items-center">
                                        <span className="text-xs font-medium text-textSecondary line-clamp-1">{topic.name}</span>
                                        <span className="text-[10px] font-bold text-indigo bg-indigo/5 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                                          ~{topic.estimated_hours}h
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* Overflow Modal */}
      {overflowData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl p-8 max-w-md w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2 text-center">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Time Capacity Reached!</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                You have <span className="font-bold text-slate-800 dark:text-slate-200">{overflowData.hours} hours</span> of syllabus left, but no free time before your exam on {finishBy}.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setOverflowData(null)}
                className="w-full py-3 px-4 bg-indigo text-white font-bold text-sm rounded-xl hover:bg-indigo-dark transition-all cursor-pointer"
              >
                Extend Exam Date (Edit below)
              </button>
              
              <button
                onClick={() => setOverflowData(null)}
                className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Increase Daily Hours
              </button>

              <button
                onClick={() => {
                  setWeekendWarrior(true);
                  setOverflowData(null);
                }}
                className={`w-full py-3 px-4 font-bold text-sm rounded-xl transition-all border cursor-pointer ${weekendWarrior ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {weekendWarrior ? '✅ Weekend Warrior Enabled' : '⚡ Enable Weekend Warrior (Dynamic Hours based on Difficulty)'}
              </button>
            </div>
            
            {weekendWarrior && (
              <button
                onClick={handleGenerate}
                className="w-full py-3 mt-4 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Retry Generation</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
