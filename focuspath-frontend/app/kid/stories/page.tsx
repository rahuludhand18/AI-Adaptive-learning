'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import KidLayout from '@/components/layout/KidLayout';
import KidPageBackground from '@/components/kid/KidPageBackground';
import RealmBand from '@/components/kid/stories/RealmBand';
import StoryNode from '@/components/kid/stories/StoryNode';
import PathConnector from '@/components/kid/stories/PathConnector';
import { apiRequest } from '@/lib/api';
import { Zap, Award, Rocket, Sparkles, BookOpen } from 'lucide-react';

interface StoryItem {
  id: number;
  realmId: 1 | 2 | 3 | 4;
  title: string;
  hook: string;
  icon: string;
  difficulty: 1 | 2 | 3;
  rewardStars: number;
  themeColor: 'pink' | 'sky' | 'grass' | 'violet';
}

const STORIES_CATALOG: StoryItem[] = [
  // REALM 1 — READING QUEST 🌸 (Bubblegum Pink)
  {
    id: 1,
    realmId: 1,
    title: 'The Whispering Library',
    hook: 'Books in a magic library read themselves aloud!',
    icon: '📖',
    difficulty: 1,
    rewardStars: 30,
    themeColor: 'pink',
  },
  {
    id: 2,
    realmId: 1,
    title: 'Message in a Bottle Cap',
    hook: 'A mysterious pen-pal sends coded messages washed up on shore.',
    icon: '🍾',
    difficulty: 2,
    rewardStars: 40,
    themeColor: 'pink',
  },
  {
    id: 3,
    realmId: 1,
    title: 'The Last Punctuation Wizard',
    hook: 'Commas and periods have gone missing in the Kingdom!',
    icon: '🪄',
    difficulty: 3,
    rewardStars: 50,
    themeColor: 'pink',
  },

  // REALM 2 — MATH ISLAND 🌊 (Sky Blue)
  {
    id: 4,
    realmId: 2,
    title: 'Captain Fraction & Treasure Split',
    hook: 'Split pirate treasure fairly using fractions!',
    icon: '🏴‍☠️',
    difficulty: 1,
    rewardStars: 35,
    themeColor: 'sky',
  },
  {
    id: 5,
    realmId: 2,
    title: 'The Pattern Bridge',
    hook: 'Rebuild a broken rope bridge by solving number patterns.',
    icon: '🌉',
    difficulty: 2,
    rewardStars: 40,
    themeColor: 'sky',
  },
  {
    id: 6,
    realmId: 2,
    title: 'The Geometry Garden Heist',
    hook: 'Use angle and area clues to catch the royal shape thief.',
    icon: '🔺',
    difficulty: 3,
    rewardStars: 50,
    themeColor: 'sky',
  },

  // REALM 3 — SCIENCE LAB 🔬 (Grass Green)
  {
    id: 7,
    realmId: 3,
    title: "Buddy's Backyard Expedition",
    hook: 'Help Buddy sort who-eats-who in the backyard ecosystem!',
    icon: '🌱',
    difficulty: 1,
    rewardStars: 30,
    themeColor: 'grass',
  },
  {
    id: 8,
    realmId: 3,
    title: "Water's Wild Journey",
    hook: 'Travel through the water cycle from cloud to rain and river.',
    icon: '💧',
    difficulty: 1,
    rewardStars: 35,
    themeColor: 'grass',
  },

  // REALM 4 — WORLD EXPLORERS 🗺️ (Violet)
  {
    id: 9,
    realmId: 4,
    title: "Grandma's Time Trunk",
    hook: 'An old trunk full of artifacts pulls you through time!',
    icon: '🧳',
    difficulty: 3,
    rewardStars: 50,
    themeColor: 'violet',
  },
];

export default function KidStoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b0f17]" />}>
      <KidStoriesContent />
    </Suspense>
  );
}

function KidStoriesContent() {
  const router = useRouter();
  const [stars, setStars] = useState(0);
  const [completedStoryIds, setCompletedStoryIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Fetch real star balance
    apiRequest<{ balance: number }>('/api/rewards/wallet/')
      .then((w) => setStars(w.balance ?? 0))
      .catch(() => setStars(0));

    // Load completed story IDs from localStorage
    if (typeof window !== 'undefined') {
      const completedSet = new Set<number>();
      
      const readingCompleted = localStorage.getItem('focuspath_quest_reading_completed') === 'true';
      if (readingCompleted) completedSet.add(1);

      STORIES_CATALOG.forEach((story) => {
        if (localStorage.getItem(`focuspath_quest_story_completed_${story.id}`) === 'true') {
          completedSet.add(story.id);
        }
      });

      setCompletedStoryIds(completedSet);
    }
  }, []);

  const firstUncompletedId = STORIES_CATALOG.find((s) => !completedStoryIds.has(s.id))?.id || 1;

  const handleStartStory = (storyId: number) => {
    router.push(`/kid/play?story=${storyId}`);
  };

  const getStoryStatus = (storyId: number): 'locked' | 'current' | 'completed' => {
    if (completedStoryIds.has(storyId)) return 'completed';
    if (storyId === firstUncompletedId) return 'current';
    return 'locked';
  };

  return (
    <KidLayout starsCount={stars}>
      {/* BACKGROUND LAYER */}
      <KidPageBackground theme="violet" />

      {/* PAGE CONTENT */}
      <div className="relative z-10 space-y-8 select-none">

        {/* 1. Hero Banner Header Section */}
        <div className="rounded-[36px] border-4 border-violet-300 dark:border-violet-800/80 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 dark:from-[#131b2a] dark:to-[#18112b] backdrop-blur-md p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-3 max-w-lg relative z-10">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/80 px-3.5 py-1 rounded-full border border-violet-200 dark:border-violet-800 shadow-xs flex items-center gap-1.5 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                STORY QUESTS · 4 REALMS · 8 STORIES
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Hi Explorer! 🎒
              </h1>
            </div>

            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
              Follow the winding adventure trail below to unlock new realms and collect gold star rewards!
            </p>

            <button
              onClick={() => handleStartStory(firstUncompletedId)}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-extrabold text-xs py-3.5 px-8 rounded-full shadow-lg shadow-violet-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Rocket className="h-4 w-4 fill-white animate-kid-wiggle" />
              <span>Continue Story Quest #{firstUncompletedId}!</span>
            </button>
          </div>

          {/* Mascot Illustration */}
          <div className="w-64 h-48 relative shrink-0 flex items-center justify-center animate-kid-bob">
            <span className="text-8xl select-none">🦉</span>
          </div>
        </div>

        {/* 2. Duolingo-Style Vertical Winding Trail Across 4 Realms */}
        <div className="space-y-4">
          
          {/* REALM 1: READING QUEST 🌸 (Bubblegum Pink) */}
          <RealmBand
            worldNumber={1}
            realmName="Reading Quest Realm 🌸"
            realmDescription="Discover magical storybooks, rhyming riddles, and punctuation secrets."
            themeColor="pink"
            totalStories={3}
            completedStories={STORIES_CATALOG.filter((s) => s.realmId === 1 && completedStoryIds.has(s.id)).length}
          >
            <div className="max-w-md mx-auto flex flex-col items-center">
              {/* Node 1: Left */}
              <div className="w-full flex justify-start pl-6">
                <StoryNode
                  {...STORIES_CATALOG[0]}
                  status={getStoryStatus(1)}
                  onPlay={() => handleStartStory(1)}
                />
              </div>

              <PathConnector direction="left-to-right" color="#f472b6" waypointIcon="📖" />

              {/* Node 2: Right */}
              <div className="w-full flex justify-end pr-6">
                <StoryNode
                  {...STORIES_CATALOG[1]}
                  status={getStoryStatus(2)}
                  onPlay={() => handleStartStory(2)}
                />
              </div>

              <PathConnector direction="right-to-left" color="#f472b6" waypointIcon="🍾" />

              {/* Node 3: Left */}
              <div className="w-full flex justify-start pl-6">
                <StoryNode
                  {...STORIES_CATALOG[2]}
                  status={getStoryStatus(3)}
                  onPlay={() => handleStartStory(3)}
                />
              </div>
            </div>
          </RealmBand>

          {/* Inter-Realm Transition 1: Connects Node 3 (Left) to Node 4 (Right) */}
          <PathConnector direction="left-to-right" color="#a78bfa" waypointIcon="✨" />

          {/* REALM 2: MATH ISLAND 🌊 (Sky Blue) */}
          <RealmBand
            worldNumber={2}
            realmName="Math Island Realm 🌊"
            realmDescription="Help pirates split treasure, solve number pattern bridges, and catch shape thieves."
            themeColor="sky"
            totalStories={3}
            completedStories={STORIES_CATALOG.filter((s) => s.realmId === 2 && completedStoryIds.has(s.id)).length}
          >
            <div className="max-w-md mx-auto flex flex-col items-center">
              {/* Node 4: Right */}
              <div className="w-full flex justify-end pr-6">
                <StoryNode
                  {...STORIES_CATALOG[3]}
                  status={getStoryStatus(4)}
                  onPlay={() => handleStartStory(4)}
                />
              </div>

              <PathConnector direction="right-to-left" color="#38bdf8" waypointIcon="🏴‍☠️" />

              {/* Node 5: Left */}
              <div className="w-full flex justify-start pl-6">
                <StoryNode
                  {...STORIES_CATALOG[4]}
                  status={getStoryStatus(5)}
                  onPlay={() => handleStartStory(5)}
                />
              </div>

              <PathConnector direction="left-to-right" color="#38bdf8" waypointIcon="🌉" />

              {/* Node 6: Right */}
              <div className="w-full flex justify-end pr-6">
                <StoryNode
                  {...STORIES_CATALOG[5]}
                  status={getStoryStatus(6)}
                  onPlay={() => handleStartStory(6)}
                />
              </div>
            </div>
          </RealmBand>

          {/* Inter-Realm Transition 2: Connects Node 6 (Right) to Node 7 (Left) */}
          <PathConnector direction="right-to-left" color="#38bdf8" waypointIcon="🌊" />

          {/* REALM 3: SCIENCE LAB 🔬 (Grass Green) */}
          <RealmBand
            worldNumber={3}
            realmName="Science Lab Realm 🔬"
            realmDescription="Explore backyard food chains and journey through the water cycle."
            themeColor="grass"
            totalStories={2}
            completedStories={STORIES_CATALOG.filter((s) => s.realmId === 3 && completedStoryIds.has(s.id)).length}
          >
            <div className="max-w-md mx-auto flex flex-col items-center">
              {/* Node 7: Left */}
              <div className="w-full flex justify-start pl-6">
                <StoryNode
                  {...STORIES_CATALOG[6]}
                  status={getStoryStatus(7)}
                  onPlay={() => handleStartStory(7)}
                />
              </div>

              <PathConnector direction="left-to-right" color="#4ade80" waypointIcon="🌱" />

              {/* Node 8: Right */}
              <div className="w-full flex justify-end pr-6">
                <StoryNode
                  {...STORIES_CATALOG[7]}
                  status={getStoryStatus(8)}
                  onPlay={() => handleStartStory(8)}
                />
              </div>
            </div>
          </RealmBand>

          {/* Inter-Realm Transition 3: Connects Node 8 (Right) to Node 9 (Center) */}
          <PathConnector direction="right-to-center" color="#4ade80" waypointIcon="🔬" />

          {/* REALM 4: WORLD EXPLORERS 🗺️ (Violet) */}
          <RealmBand
            worldNumber={4}
            realmName="World & History Explorers 🗺️"
            realmDescription="Unlock Grandma's time trunk and travel through historical moments."
            themeColor="violet"
            totalStories={1}
            completedStories={STORIES_CATALOG.filter((s) => s.realmId === 4 && completedStoryIds.has(s.id)).length}
          >
            <div className="max-w-md mx-auto flex flex-col items-center">
              {/* Node 9: Center */}
              <div className="w-full flex justify-center">
                <StoryNode
                  {...STORIES_CATALOG[8]}
                  status={getStoryStatus(9)}
                  onPlay={() => handleStartStory(9)}
                />
              </div>
            </div>
          </RealmBand>

        </div>

        {/* 3. Bottom 3 Bento Cards */}
        <div className="grid grid-cols-12 gap-5 pt-4">
          
          {/* Card 1: Today's Goal */}
          <div className="col-span-12 md:col-span-4 bg-gradient-to-br from-sky-50/90 to-blue-50/50 dark:from-[#0f172a] dark:to-[#131b2a] border-2 border-sky-300 dark:border-sky-800/60 rounded-[32px] p-6 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-sky-400 text-white flex items-center justify-center shadow-xs animate-kid-bob">
                <Zap className="h-5 w-5 fill-white" />
              </div>
              <span className="text-xs font-extrabold text-sky-800 dark:text-sky-300">Today&apos;s Goal</span>
            </div>

            <div className="space-y-2">
              <div className="w-full h-3 bg-sky-100 dark:bg-slate-800 rounded-full overflow-hidden border border-sky-200 dark:border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: completedStoryIds.size > 0 ? '85%' : '65%' }}
                />
              </div>
              <p className="text-xs text-sky-700 dark:text-sky-400 font-extrabold">
                {completedStoryIds.size > 0 ? 'Awesome! 85% Complete!' : 'Almost there! 15m more.'}
              </p>
            </div>
          </div>

          {/* Card 2: Streaks */}
          <div className="col-span-12 md:col-span-4 bg-gradient-to-br from-orange-50/90 to-amber-50/50 dark:from-[#0f172a] dark:to-[#131b2a] border-2 border-orange-300 dark:border-orange-800/60 rounded-[32px] p-6 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-xs animate-kid-pulse-glow">
                <Award className="h-5 w-5" />
              </div>
              <span className="text-xs font-extrabold text-orange-800 dark:text-orange-300">Streaks</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-between px-1">
                {['M', 'T', 'W', 'T', 'F'].map((day, idx) => {
                  const isActive = idx < 3;
                  return (
                    <div
                      key={idx}
                      className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-extrabold ${
                        isActive
                          ? 'bg-gradient-to-b from-orange-400 to-rose-500 text-white shadow-xs scale-105 border-2 border-white'
                          : 'bg-orange-100 dark:bg-slate-800 text-orange-400 dark:text-slate-500 border border-orange-200'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-orange-800 dark:text-orange-300 font-extrabold">
                3 Day Streak! <span className="animate-pulse">🔥</span>
              </p>
            </div>
          </div>

          {/* Card 3: Claim Daily Prize */}
          <div
            onClick={() => alert('Daily Prize Claimed! +10 Stars!')}
            className="col-span-12 md:col-span-4 bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white rounded-[32px] p-6 shadow-md flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all hover:scale-105 active:scale-95 border-2 border-pink-300"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shadow-inner animate-kid-bob">
              <Rocket className="h-6 w-6 text-white" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold">Claim Daily Prize</h3>
              <p className="text-xs text-pink-100 font-bold">Unlock 10 bonus stars!</p>
            </div>
          </div>

        </div>

      </div>
    </KidLayout>
  );
}
