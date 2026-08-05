'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { useFocusStore } from '@/store/useFocusStore';
import { COPY } from '@/constants/copy';
import {
  UploadCloud,
  Plus,
  Trash2,
  Star,
  Sparkles,
  BookOpen,
  Sigma,
  Microscope,
  Calendar,
  CheckCircle2,
  FileText,
  Loader2,
} from 'lucide-react';

export default function AdultOnboardingPage() {
  const router = useRouter();
  const { subjects, addSubject, removeSubject, dailyHours, setDailyHours } = useFocusStore();

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newPriority, setNewPriority] = useState<number>(4);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isParsingSyllabus, setIsParsingSyllabus] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    addSubject({
      name: newSubjectName.trim(),
      priority: newPriority,
      deadline: '12/25/2023',
      icon: 'BookOpen',
    });
    setNewSubjectName('');
  };

  const processSyllabusFile = (fileName: string) => {
    setUploadedFileName(fileName);
    setIsParsingSyllabus(true);

    // Simulate AI syllabus extraction
    setTimeout(() => {
      setIsParsingSyllabus(false);
      addSubject({
        name: 'AI & Neural Systems (Extracted)',
        priority: 5,
        deadline: '01/15/2024',
        icon: 'Microscope',
      });
    }, 900);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSyllabusFile(e.target.files[0].name);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSyllabusFile(e.dataTransfer.files[0].name);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      router.push('/adult/dashboard');
    }, 800);
  };

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sigma':
        return <Sigma className="w-5 h-5 text-indigo" />;
      case 'Microscope':
        return <Microscope className="w-5 h-5 text-amber-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-teal" />;
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans antialiased text-textPrimary">
      <TopNav />

      <PageContainer>
        {/* Header Title */}
        <div className="space-y-1 mb-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-textPrimary tracking-tight">
            {COPY.onboarding.heading}
          </h1>
          <p className="text-sm text-textSecondary font-normal">
            {COPY.onboarding.subheading}
          </p>
        </div>

        {/* Main Grid: Upload & Add Left / Planned Subjects Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Syllabus Upload Card with Drag & Drop */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`bg-white rounded-2xl p-6 border-2 transition-all shadow-card flex flex-col items-center text-center ${
                isDragOver ? 'border-indigo bg-indigo-light/20 scale-[1.01]' : 'border-border'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-light text-indigo flex items-center justify-center mb-3 shadow-sm">
                <UploadCloud className="w-6 h-6" />
              </div>

              <h2 className="text-base font-bold text-textPrimary">
                {COPY.onboarding.uploadTitle}
              </h2>
              <p className="text-xs text-textSecondary mt-1 max-w-xs">
                {COPY.onboarding.uploadSubtitle}
              </p>

              {/* Format badges */}
              <div className="flex items-center space-x-2 my-3">
                <span className="text-[11px] font-semibold bg-indigo-light text-indigo px-2.5 py-0.5 rounded-full">.pdf</span>
                <span className="text-[11px] font-semibold bg-indigo-light text-indigo px-2.5 py-0.5 rounded-full">.jpg</span>
                <span className="text-[11px] font-semibold bg-indigo-light text-indigo px-2.5 py-0.5 rounded-full">.png</span>
              </div>

              {/* Upload Input & Button */}
              <label className="cursor-pointer py-2.5 px-6 bg-indigo text-white font-bold text-xs rounded-xl hover:bg-indigo-dark transition-all shadow-md active:scale-95 inline-flex items-center space-x-2">
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <FileText className="w-4 h-4" />
                <span>{uploadedFileName ? `Re-upload File` : COPY.onboarding.browseFiles}</span>
              </label>

              {/* AI Extraction Status Indicator */}
              {isParsingSyllabus ? (
                <div className="mt-4 flex items-center space-x-2 text-xs text-indigo font-bold bg-indigo-light/60 py-2 px-4 rounded-xl animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo" />
                  <span>Extracting subjects & exam deadlines with AI...</span>
                </div>
              ) : uploadedFileName ? (
                <div className="mt-4 flex flex-col items-center space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{uploadedFileName} parsed successfully!</span>
                  </div>
                  <span className="text-[10px] text-textSecondary">Extracted course milestones into Planned Subjects</span>
                </div>
              ) : null}
            </div>

            {/* Add Subjects Manually Card */}
            <div className="bg-white rounded-2xl p-6 border border-border shadow-card space-y-4">
              <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider">
                {COPY.onboarding.addManually}
              </h3>

              <form onSubmit={handleAddSubject} className="space-y-3">
                <input
                  type="text"
                  placeholder={COPY.onboarding.subjectPlaceholder}
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-indigo-light/30 border border-border rounded-xl text-xs text-textPrimary focus:outline-none focus:ring-2 focus:ring-indigo transition-all font-medium"
                />

                <div className="flex items-center space-x-3">
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(Number(e.target.value))}
                    className="flex-1 px-3.5 py-2.5 bg-indigo-light/30 border border-border rounded-xl text-xs font-semibold text-textPrimary focus:outline-none focus:ring-2 focus:ring-indigo transition-all cursor-pointer"
                  >
                    <option value={5}>Priority 5 (High)</option>
                    <option value={4}>Priority 4 (Medium-High)</option>
                    <option value={3}>Priority 3 (Medium)</option>
                    <option value={2}>Priority 2 (Normal)</option>
                    <option value={1}>Priority 1 (Low)</option>
                  </select>

                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-teal text-white font-bold text-xs rounded-xl hover:bg-teal-600 transition-all shadow-md flex items-center space-x-1.5 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Right Column: Planned Subjects List (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 border border-border shadow-card h-full flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60">
                  <h2 className="text-base font-bold text-textPrimary">
                    {COPY.onboarding.plannedTitle}
                  </h2>
                  <span className="text-xs font-extrabold bg-indigo-light text-indigo px-3 py-1 rounded-full">
                    {subjects.length} Added
                  </span>
                </div>

                {/* Subjects List Rows */}
                <div className="space-y-3">
                  {subjects.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl border border-border/80 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center shadow-sm">
                          {getSubjectIcon(sub.icon)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-textPrimary">{sub.name}</h4>
                          {/* Priority Stars Display */}
                          <div className="flex items-center space-x-1 mt-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= sub.priority
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Deadline Date & Delete */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1.5 text-xs text-textSecondary bg-white py-1.5 px-2.5 rounded-lg border border-border">
                          <span className="text-[10px] font-bold uppercase text-textSecondary">DEADLINE</span>
                          <span className="font-semibold text-textPrimary">{sub.deadline}</span>
                          <Calendar className="w-3.5 h-3.5 text-textSecondary ml-1" />
                        </div>
                        <button
                          onClick={() => removeSubject(sub.id)}
                          className="p-2 text-textSecondary hover:text-danger hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphic Decoration Box at bottom center */}
              <div className="mt-8 pt-4 border-t border-border/60 flex flex-col items-center justify-center">
                <div className="w-24 h-12 rounded-xl bg-indigo-light/50 border border-indigo/20 flex items-center justify-center mb-2">
                  <Sparkles className="w-6 h-6 text-indigo" />
                </div>
                <p className="text-xs text-textSecondary font-medium text-center">
                  FocusPath AI balances workload based on priority stars & deadline proximity.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Full-Width Indigo Tinted Panel */}
        <div className="bg-indigo-light/60 rounded-2xl p-6 md:p-8 border border-indigo/20 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-textPrimary">
                {COPY.onboarding.hoursTitle}
              </h3>
              <p className="text-xs text-textSecondary">
                {COPY.onboarding.hoursSubtitle}
              </p>
            </div>
            
            {/* Big Hours Badge */}
            <span className="text-4xl font-black text-indigo tracking-tight">
              {dailyHours}h
            </span>
          </div>

          {/* Range Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min={1}
              max={12}
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer accent-indigo"
            />
            <div className="flex justify-between text-xs text-textSecondary font-bold">
              <span>1 Hour</span>
              <span>12 Hours</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col items-center space-y-2 pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="py-3.5 px-8 bg-indigo text-white font-bold text-xs rounded-xl hover:bg-indigo-dark transition-all shadow-lg shadow-indigo/20 active:scale-95 disabled:opacity-50 flex items-center space-x-2.5 cursor-pointer"
            >
              {isGenerating ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{COPY.onboarding.generateBtn}</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-textSecondary text-center">
              {COPY.onboarding.aiNote}
            </p>
          </div>
        </div>

      </PageContainer>
    </div>
  );
}
