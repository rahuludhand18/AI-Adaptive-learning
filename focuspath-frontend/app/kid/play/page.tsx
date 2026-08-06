'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Award,
  Star,
  Check,
  Zap,
  Play
} from 'lucide-react';

export default function QuestPlayPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const totalSteps = 5;

  const storiesData = [
    {
      step: 1,
      title: "Leo the Owl woke up in the sunny magical forest.",
      subtitle: "He noticed something sparkling under the big oak tree!",
      instruction: "Tap on the picture to inspect, or press NEXT to continue the quest!",
    },
    {
      step: 2,
      title: "As Leo flew closer, he found an ancient storybook.",
      subtitle: "The pages were filled with glowing golden runes and secrets!",
      instruction: "Tap on the picture to inspect, or press NEXT to continue the quest!",
    },
    {
      step: 3,
      title: "Leo the Owl found a hidden path in the woods.",
      subtitle: "What do you think he saw?",
      instruction: "Tap on the picture to look closer, or press the huge button below to continue the quest!",
    },
    {
      step: 4,
      title: "The hidden path led to the magical Math Island bridge!",
      subtitle: "Leo needs your help to unlock the next realm!",
      instruction: "Press NEXT to solve the final puzzle!",
    },
    {
      step: 5,
      title: "Congratulations! You helped Leo complete the Reading Quest!",
      subtitle: "You earned stars and unlocked Math Island!",
      instruction: "Press NEXT to claim your prize!",
    },
  ];

  const currentStory = storiesData[step - 1];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      setShowCompletionModal(true);
    }
  };

  const handleContinueModal = () => {
    // Save completion state in localStorage so Math Island unlocks on the map
    if (typeof window !== 'undefined') {
      localStorage.setItem('focuspath_quest_reading_completed', 'true');
    }
    router.push('/kid/stories?unlocked=math');
  };

  const userInitial = user?.username ? user.username.slice(0, 2).toUpperCase() : 'A';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F4FF] via-[#F8FAFC] to-[#F0F4FF] text-slate-800 font-sans antialiased flex flex-col justify-between relative">
      
      {/* Top Header Navbar */}
      <header className="bg-white border-b border-slate-200/80 px-8 h-16 flex items-center justify-between sticky top-0 z-40 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/kid/stories')}
            className="p-2 rounded-full hover:bg-slate-100 text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-extrabold text-indigo-600 text-base">Reading Quest</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="bg-slate-100 border border-slate-200/80 text-slate-600 text-xs font-extrabold py-1.5 px-4 rounded-full">
            Step {step} of {totalSteps}
          </span>
          <div className="w-9 h-9 rounded-full bg-teal-200 text-teal-900 font-bold text-xs flex items-center justify-center ring-2 ring-indigo-600/20">
            {userInitial}
          </div>
        </div>

        {/* Top Progress Bar Line across header */}
        <div className="w-full bg-slate-100 h-1 absolute left-0 bottom-0 overflow-hidden">
          <div
            className="bg-indigo-600 h-1 transition-all duration-300 rounded-r-full"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Quest Story Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 flex flex-col justify-center my-4">
        
        {/* Main White Card */}
        <div className="bg-white rounded-[32px] border border-slate-200/80 p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          
          {/* Top Story Illustration Frame */}
          <div className="w-full h-[280px] rounded-2xl border border-slate-100 bg-slate-50 relative overflow-hidden flex items-center justify-center shadow-2xs">
            <img
              src="/reading_quest_thumb.png"
              alt="Story Scene"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Story Text */}
          <div className="space-y-3">
            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
              {currentStory.title}
            </h2>
            <h3 className="text-xl font-extrabold text-indigo-600">
              {currentStory.subtitle}
            </h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              {currentStory.instruction}
            </p>
          </div>

        </div>

      </main>

      {/* Bottom Bar Controls & Mascot Badge */}
      <footer className="bg-white/80 backdrop-blur-xs border-t border-slate-100 p-6 z-10 sticky bottom-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          {/* Coral NEXT Button */}
          <button
            onClick={handleNext}
            className="bg-[#FF6F59] hover:bg-[#FF583E] text-white font-extrabold text-sm py-4 px-10 rounded-full shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
          >
            <span>NEXT</span>
            <ChevronRight className="h-5 w-5 stroke-[3]" />
          </button>

          {/* Badge, Speech Bubble & Buddy Mascot */}
          <div className="flex items-center gap-4">
            
            {/* Points & Badge Pill */}
            <div className="bg-indigo-50/80 border border-indigo-100 text-indigo-600 font-extrabold text-xs py-3 px-5 rounded-2xl shadow-2xs flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-indigo-600 text-indigo-600" />
                <span>150 Points</span>
              </span>
              <span className="text-indigo-200">|</span>
              <span className="flex items-center gap-1 text-slate-700">
                <Award className="h-4 w-4 text-amber-500" />
                <span>Explorer Badge</span>
              </span>
            </div>

            {/* Speech Bubble */}
            <div className="relative bg-slate-50 border border-slate-200/80 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-700 hidden md:block shadow-2xs">
              Keep going, Leo! You got it!
              <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 border-8 border-transparent border-l-slate-50" />
            </div>

            {/* Mascot Avatar */}
            <div className="w-14 h-14 bg-white border border-slate-200/80 rounded-2xl p-1 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src="/kid_owl_mascot.png"
                alt="Buddy"
                className="w-full h-full object-contain"
              />
            </div>

          </div>

        </div>
      </footer>

      {/* Completion Modal ("You did it!") */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          
          <div className="relative bg-white border-2 border-indigo-500 rounded-[36px] p-8 max-w-md w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            
            {/* Attached Star Badge at Top Right Corner */}
            <div className="absolute -top-4 -right-4 bg-amber-100 border-2 border-amber-300 text-amber-900 font-extrabold text-xs py-1.5 px-4 rounded-full flex items-center gap-1.5 shadow-md">
              <span className="text-amber-500 font-black">★</span>
              <span>125 STARS</span>
            </div>

            {/* Title & Stars Earned Tag */}
            <div className="space-y-3 pt-2">
              <h2 className="text-3xl font-extrabold text-indigo-600 tracking-tight">
                You did it!
              </h2>

              <div className="bg-teal-100 border border-teal-200 text-teal-800 text-xs font-extrabold py-1.5 px-4 rounded-full inline-flex items-center gap-1 shadow-2xs">
                <span>⊕ +5</span>
                <span className="text-amber-500">★</span>
              </div>
            </div>

            {/* Celebration Owl Illustration */}
            <div className="w-48 h-40 mx-auto relative flex items-center justify-center">
              <img
                src="/kid_celebration_owl.png"
                alt="Celebration"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>

            {/* Action Button */}
            <div className="space-y-4 pt-2">
              <button
                onClick={handleContinueModal}
                className="w-full bg-[#4F46E5] hover:bg-indigo-700 text-white font-extrabold text-sm py-4 px-8 rounded-full shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
              >
                <span>Yay! Continue</span>
                <ChevronRight className="h-5 w-5 stroke-[3]" />
              </button>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] font-bold text-slate-500">
                  Daily Goal: 85% Complete
                </p>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-[85%]" />
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
