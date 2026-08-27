'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { apiRequest } from '@/lib/api';
import { REALM_STORIES_DATA, StoryBook } from '@/lib/storiesData';
import {
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Award,
  Star,
  BookOpen,
  Camera,
  MessageSquare
} from 'lucide-react';

export default function QuestPlayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#18112b]" />}>
      <QuestPlayContent />
    </Suspense>
  );
}

function QuestPlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const storyId = Number(searchParams.get('story')) || 1;
  const currentBook: StoryBook = REALM_STORIES_DATA[storyId] || REALM_STORIES_DATA[1];

  const [step, setStep] = useState(1);
  const [stars, setStars] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const totalSteps = currentBook.pages.length;
  const currentPage = currentBook.pages[step - 1] || currentBook.pages[0];

  useEffect(() => {
    apiRequest<{ balance: number }>('/api/rewards/wallet/')
      .then((w) => setStars(w.balance ?? 0))
      .catch(() => setStars(0));
  }, []);

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      try {
        const res = await apiRequest<{ balance: number }>('/api/rewards/award/', {
          method: 'POST',
          body: JSON.stringify({ amount: currentBook.rewardStars, badge: currentBook.badgeName }),
        });
        if (res.balance != null) setStars(res.balance);
      } catch {
        setStars((prev) => prev + currentBook.rewardStars);
      }
      setShowCompletionModal(true);
    }
  };

  const handleContinueModal = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('focuspath_quest_reading_completed', 'true');
      localStorage.setItem(`focuspath_quest_story_completed_${currentBook.id}`, 'true');
    }
    router.push('/kid/stories');
  };

  const userInitial = user?.username ? user.username.slice(0, 2).toUpperCase() : 'KD';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#18112b] via-[#0b0f17] to-[#121629] text-slate-800 dark:text-slate-100 font-sans antialiased flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Soft Ambient Radial Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navbar */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b-2 border-violet-200/60 dark:border-slate-800 px-6 sm:px-8 h-18 flex items-center justify-between sticky top-0 z-40 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/kid/stories')}
            className="p-2 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 hover:bg-pink-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold uppercase text-pink-500 tracking-wider">
              {currentBook.realm}
            </span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg leading-none">
              {currentBook.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="bg-pink-100 dark:bg-pink-950/60 border border-pink-300 dark:border-pink-800 text-pink-700 dark:text-pink-300 text-xs font-extrabold py-1.5 px-4 rounded-full">
            Page {step} of {totalSteps}
          </span>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-extrabold text-xs flex items-center justify-center ring-4 ring-orange-400/30 shadow-xs">
            {userInitial}
          </div>
        </div>

        {/* Top Progress Bar Line across header */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 absolute left-0 bottom-0 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 h-2 transition-all duration-300 rounded-r-full shadow-xs"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Quest Story Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center my-2 relative z-10 space-y-4">
        
        {/* Page-by-Page Background Scene Brief Header Bar */}
        <div className="bg-amber-100/90 dark:bg-slate-900/90 backdrop-blur-md border-2 border-amber-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 shadow-sm text-xs font-extrabold text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
          <Camera className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="uppercase text-[9px] tracking-widest text-amber-700 dark:text-amber-400 block">
              ILLUSTRATED BACKGROUND SCENE BRIEF
            </span>
            <p className="font-bold leading-snug">{currentPage.bgSceneDesc}</p>
          </div>
        </div>

        {/* Main Picture Book Card */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-[36px] border-4 border-violet-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-200">
          
          {/* Illustration Scene Frame with Soft Vignette */}
          <div className="w-full h-[260px] sm:h-[300px] rounded-3xl border-4 border-slate-900 dark:border-slate-800 bg-slate-900 relative overflow-hidden flex items-center justify-center shadow-lg group">
            {currentPage.bgImage ? (
              <img
                src={currentPage.bgImage}
                alt={currentPage.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-slate-900 to-slate-950 flex flex-col items-center justify-center text-center p-6 space-y-2">
                <span className="text-6xl animate-kid-bob">🎨</span>
                <p className="text-xs font-extrabold text-amber-200 max-w-md line-clamp-3">
                  &ldquo;{currentPage.bgSceneDesc}&rdquo;
                </p>
              </div>
            )}
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full border border-white/30 shadow-xs z-10">
              Page {step} Scene
            </div>
          </div>

          {/* Picture Book Prose Copy Block */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                {currentPage.title}
              </h2>
              <span className="text-xs font-extrabold text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-950/60 px-3 py-1 rounded-full border border-pink-300">
                {currentBook.realm}
              </span>
            </div>

            <h3 className="text-lg font-black text-pink-600 dark:text-pink-400 italic">
              &ldquo;{currentPage.subtitle}&rdquo;
            </h3>

            <div className="bg-[#fffdfa] dark:bg-slate-850 border-2 border-amber-200/80 dark:border-slate-700 rounded-3xl p-5 shadow-xs">
              <p className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                {currentPage.prose}
              </p>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed pt-1">
              👉 {currentPage.instruction}
            </p>
          </div>

        </div>

      </main>

      {/* Bottom Bar Controls & Mascot Speech Bubble */}
      <footer className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t-2 border-violet-200/60 dark:border-slate-800 p-6 z-10 sticky bottom-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          {/* Vivid Orange/Coral NEXT Button */}
          <button
            onClick={handleNext}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm py-4 px-10 rounded-full shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all hover:scale-108 active:scale-95 cursor-pointer border-2 border-orange-300"
          >
            <span>{step === totalSteps ? 'FINISH STORY' : 'NEXT PAGE'}</span>
            <ChevronRight className="h-5 w-5 stroke-[3] animate-kid-wiggle" />
          </button>

          {/* Points & Mascot Speech Bubble */}
          <div className="flex items-center gap-4">
            
            <div className="bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 font-extrabold text-xs py-3 px-5 rounded-2xl shadow-xs flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>+{currentBook.rewardStars} Bounty</span>
              </span>
              <span className="text-amber-300">|</span>
              <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                <Award className="h-4 w-4 text-orange-500" />
                <span>{currentBook.badgeName}</span>
              </span>
            </div>

            {/* Comic Speech Bubble */}
            <div className="relative bg-sky-100 dark:bg-slate-800 border-2 border-sky-300 dark:border-slate-700 rounded-2xl py-2.5 px-4 text-xs font-extrabold text-sky-900 dark:text-sky-200 hidden md:block shadow-xs">
              {currentPage.mascotComment}
              <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 border-8 border-transparent border-l-sky-100 dark:border-l-slate-800" />
            </div>

            {/* Mascot Avatar */}
            <div className="w-14 h-14 bg-white dark:bg-slate-800 border-2 border-amber-300 rounded-2xl p-1 shadow-xs shrink-0 flex items-center justify-center overflow-hidden animate-kid-bob">
              <span className="text-3xl select-none">🦉</span>
            </div>

          </div>

        </div>
      </footer>

      {/* Completion Modal ("You did it!") */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          
          <div className="relative bg-white dark:bg-slate-900 border-4 border-amber-400 rounded-[36px] p-8 max-w-md w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            
            {/* Attached Star Badge at Top Right Corner */}
            <div className="absolute -top-4 -right-4 bg-amber-400 border-2 border-amber-300 text-amber-950 font-extrabold text-xs py-2 px-4 rounded-full flex items-center gap-1.5 shadow-md animate-kid-bounce-subtle">
              <span className="text-amber-950 font-extrabold">★</span>
              <span>{stars} STARS</span>
            </div>

            {/* Title & Stars Earned Tag */}
            <div className="space-y-3 pt-2">
              <h2 className="text-3xl font-extrabold text-orange-500 tracking-tight">
                You completed the story! 🎉
              </h2>

              <div className="bg-emerald-100 dark:bg-emerald-950 border-2 border-emerald-300 text-emerald-900 dark:text-emerald-200 text-xs font-extrabold py-2 px-5 rounded-full inline-flex items-center gap-1.5 shadow-xs animate-kid-confetti">
                <span>⊕ +{currentBook.rewardStars}</span>
                <span className="text-amber-500">★</span>
                <span>({currentBook.badgeName})</span>
              </div>
            </div>

            {/* Celebration Owl Illustration */}
            <div className="w-48 h-40 mx-auto relative flex items-center justify-center animate-kid-bob">
              <span className="text-8xl select-none">🦉🎉</span>
            </div>

            {/* Action Button */}
            <div className="space-y-4 pt-2">
              <button
                onClick={handleContinueModal}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm py-4 px-8 rounded-full shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <span>Yay! Unlock Next Story</span>
                <ChevronRight className="h-5 w-5 stroke-[3] animate-kid-wiggle" />
              </button>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400">
                  Daily Story Quest Goal: 100% Complete
                </p>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                  <div className="h-full bg-orange-500 rounded-full w-[100%]" />
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
