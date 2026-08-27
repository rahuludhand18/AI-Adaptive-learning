'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import KidLayout from '@/components/layout/KidLayout';
import KidPageBackground from '@/components/kid/KidPageBackground';
import SafeYouTubePlayer from '@/components/kid/SafeYouTubePlayer';
import { useAuthStore } from '@/store/authStore';
import VideoCompanion from '@/components/kid/VideoCompanion';
import { apiRequest } from '@/lib/api';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Star,
  ArrowLeft,
  Search,
  Play,
  ShieldCheck,
  ChevronRight,
  Flame,
  Atom,
  Calculator,
  Palette,
  Globe,
  Rocket,
  Lightbulb,
  Check,
} from 'lucide-react';

// Backend catalog data types
interface Level {
  id: number;
  name: string;
  order?: number;
  description?: string;
  icon?: string;
}

interface Subject {
  id: number;
  level: number;
  name: string;
  order?: number;
  iconName?: string;
  colorClass?: string;
}

interface Topic {
  id: number;
  subject: number;
  title: string;
  order?: number;
  summary?: string;
  videoCount?: number;
}

interface Video {
  id: number;
  topic?: number;
  youtube_id?: string;
  video_id?: string; // from YouTube API
  title: string;
  thumbnail_url?: string; // from YouTube API
  duration_seconds?: number;
  source_channel?: string;
  age_min?: number;
  age_max?: number;
  takeaways?: string[];
}

// Curated fallback data for demo / unseeded SQLite databases
const FALLBACK_LEVELS: Level[] = [
  { id: 1, name: 'Kindergarten & Early Years', description: 'Fun phonics, colors, numbers and songs for young explorers.', icon: '🌱' },
  { id: 2, name: 'Grade 1 - 2 (Junior Explorers)', description: 'Foundational math, beginner science, and exciting animal stories.', icon: '🚀' },
  { id: 3, name: 'Grade 3 - 5 (Discovery Heroes)', description: 'Fractions, solar system, earth science, and creative writing.', icon: '🔬' },
  { id: 4, name: 'Grade 6+ (Academy Champions)', description: 'Geometry, introductory coding, physics mysteries, and global history.', icon: '🎓' },
];

const FALLBACK_SUBJECTS: Record<number, Subject[]> = {
  1: [
    { id: 101, level: 1, name: 'Alphabet & Phonics', iconName: 'BookOpen' },
    { id: 102, level: 1, name: 'Numbers & Counting', iconName: 'Calculator' },
    { id: 103, level: 1, name: 'Colors & Shapes', iconName: 'Palette' },
  ],
  2: [
    { id: 201, level: 2, name: 'Math Adventures', iconName: 'Calculator' },
    { id: 202, level: 2, name: 'Nature & Animals', iconName: 'Globe' },
    { id: 203, level: 2, name: 'Story World', iconName: 'BookOpen' },
  ],
  3: [
    { id: 301, level: 3, name: 'Math & Logic', iconName: 'Calculator' },
    { id: 302, level: 3, name: 'Space & Science', iconName: 'Atom' },
    { id: 303, level: 3, name: 'World & History', iconName: 'Globe' },
    { id: 304, level: 3, name: 'Art & Creativity', iconName: 'Palette' },
  ],
  4: [
    { id: 401, level: 4, name: 'Advanced Math', iconName: 'Calculator' },
    { id: 402, level: 4, name: 'Physics & Astronomy', iconName: 'Atom' },
    { id: 403, level: 4, name: 'Coding & Robotics', iconName: 'Rocket' },
  ],
};

const FALLBACK_TOPICS: Record<number, Topic[]> = {
  301: [
    { id: 3011, subject: 301, title: 'Understanding Fractions with Pizza', summary: 'Learn halves, quarters, and eighths with tasty slices!', videoCount: 2 },
    { id: 3012, subject: 301, title: 'Times Table Fast Tricks', summary: 'Speed up multiplication with clever visual patterns.', videoCount: 2 },
    { id: 3013, subject: 301, title: 'Geometry & 3D Shapes', summary: 'Discover cubes, spheres, pyramids and their secrets.', videoCount: 1 },
  ],
  302: [
    { id: 3021, subject: 302, title: 'Journey Through the Solar System', summary: 'Visit the 8 planets, asteroid belt, and our blazing Sun.', videoCount: 2 },
    { id: 3022, subject: 302, title: 'Deep Ocean Mysteries & Creatures', summary: 'Explore bioluminescent creatures in the darkest ocean depths.', videoCount: 2 },
    { id: 3023, subject: 302, title: 'Volcanoes and Plate Tectonics', summary: 'How magma rises to create majestic volcanic islands.', videoCount: 1 },
  ],
  303: [
    { id: 3031, subject: 303, title: 'Ancient Egypt & Pyramids', summary: 'Hieroglyphs, pharaohs, and engineering marvels of the Nile.', videoCount: 2 },
    { id: 3032, subject: 303, title: 'Seven Wonders of the World', summary: 'Travel across continents to see legendary landmarks.', videoCount: 1 },
  ],
  304: [
    { id: 3041, subject: 304, title: 'Color Theory & Masterpieces', summary: 'Warm vs cool tones, primary mixing, and famous painters.', videoCount: 1 },
  ],
  201: [
    { id: 2011, subject: 201, title: 'Addition & Subtraction Quests', summary: 'Solve mystery puzzles by grouping number blocks.', videoCount: 1 },
  ],
  202: [
    { id: 2021, subject: 202, title: 'Rainforest Animals & Birds', summary: 'Meet toucans, jaguars, and tree frogs in the Amazon.', videoCount: 1 },
  ],
};

const FALLBACK_VIDEOS: Record<number, Video[]> = {
  3021: [
    {
      id: 1,
      topic: 3021,
      youtube_id: 'libKVRa01L8',
      title: 'Solar System 101 | National Geographic Kids',
      duration_seconds: 245,
      source_channel: 'National Geographic Kids',
      age_min: 6,
      age_max: 14,
      takeaways: [
        'The Solar System consists of our Sun and 8 unique planets.',
        'Mercury is closest to the Sun, while Neptune is the furthest.',
        'Jupiter is a gas giant and the largest planet in our system.',
      ],
    },
    {
      id: 2,
      topic: 3021,
      youtube_id: 'Qd6nLM2QlWw',
      title: 'The Planets Song for Kids',
      duration_seconds: 190,
      source_channel: 'Kids Learning Tube',
      age_min: 5,
      age_max: 12,
      takeaways: [
        'Each planet orbits the Sun in an elliptical path.',
        'Mars is called the Red Planet because of iron oxide on its surface.',
        'Saturn has over 100 known moons and dazzling icy rings.',
      ],
    },
  ],
  3011: [
    {
      id: 3,
      topic: 3011,
      youtube_id: 'n0FZhQ_GkKw',
      title: 'Fractions for Kids | Math Learning Journey',
      duration_seconds: 310,
      source_channel: 'Math Antics & Kids',
      age_min: 7,
      age_max: 13,
      takeaways: [
        'The top number is the Numerator (how many parts you have).',
        'The bottom number is the Denominator (total equal parts).',
        '2/4 is equivalent to 1/2!',
      ],
    },
  ],
};

// Subject Icon Helper
function getSubjectIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('math') || lower.includes('number') || lower.includes('count')) {
    return <Calculator className="h-5 w-5" />;
  }
  if (lower.includes('space') || lower.includes('science') || lower.includes('physics') || lower.includes('nature')) {
    return <Atom className="h-5 w-5" />;
  }
  if (lower.includes('art') || lower.includes('creative') || lower.includes('color')) {
    return <Palette className="h-5 w-5" />;
  }
  if (lower.includes('world') || lower.includes('history') || lower.includes('animal') || lower.includes('geo')) {
    return <Globe className="h-5 w-5" />;
  }
  if (lower.includes('code') || lower.includes('robot') || lower.includes('tech')) {
    return <Rocket className="h-5 w-5" />;
  }
  return <BookOpen className="h-5 w-5" />;
}

// which grade-level name to prefer for each age bracket a parent can assign
const AGE_GROUP_LEVEL_HINT: Record<string, string> = {
  '1-3': 'Kindergarten',
  '4-6': 'Kindergarten',
  '7-8': 'Grade 1',
  '9-10': 'Grade 3',
  '11-12': 'Grade 6',
};

export default function KidLearnPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // State for Catalog
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);

  // Selection Drill-Down State
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // App & Gamification State
  const [searchQuery, setSearchQuery] = useState('');
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedVideos, setCompletedVideos] = useState<number[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [todayCompletedCount, setTodayCompletedCount] = useState(0);

  // Load levels on mount
  useEffect(() => {
    apiRequest<{ balance: number; streak_count: number }>('/api/rewards/wallet/')
      .then((w) => {
        setStars(w.balance ?? 0);
        setStreak(w.streak_count ?? 0);
      })
      .catch(() => {});
  }, []);

  const pickLevelForAge = (levelList: Level[]): Level => {
    const hint = user?.age_group ? AGE_GROUP_LEVEL_HINT[user.age_group] : null;
    if (hint) {
      const match = levelList.find((l) => l.name.toLowerCase().includes(hint.toLowerCase()));
      if (match) return match;
    }
    return levelList[0];
  };

  useEffect(() => {
    apiRequest<Level[]>('/api/content/levels/')
      .then((res) => {
        const list = res && res.length > 0 ? res : FALLBACK_LEVELS;
        const chosen = pickLevelForAge(list);
        setLevels(list);
        setSelectedLevel(chosen);
        loadSubjectsForLevel(chosen.id);
      })
      .catch(() => {
        const chosen = pickLevelForAge(FALLBACK_LEVELS);
        setLevels(FALLBACK_LEVELS);
        setSelectedLevel(chosen);
        loadSubjectsForLevel(chosen.id);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.age_group]);

  const loadSubjectsForLevel = async (levelId: number) => {
    try {
      const res = await apiRequest<Subject[]>(`/api/content/subjects/?level=${levelId}`);
      if (res && res.length > 0) {
        setSubjects(res);
      } else {
        setSubjects(FALLBACK_SUBJECTS[levelId] || FALLBACK_SUBJECTS[3] || []);
      }
    } catch {
      setSubjects(FALLBACK_SUBJECTS[levelId] || FALLBACK_SUBJECTS[3] || []);
    }
  };

  const loadTopicsForSubject = async (subjectId: number) => {
    try {
      const res = await apiRequest<Topic[]>(`/api/content/topics/?subject=${subjectId}`);
      if (res && res.length > 0) {
        setTopics(res);
      } else {
        setTopics(FALLBACK_TOPICS[subjectId] || [
          { id: subjectId * 10 + 1, subject: subjectId, title: 'Core Lesson Fundamentals', summary: 'Essential concepts made easy and engaging.', videoCount: 1 }
        ]);
      }
    } catch {
      setTopics(FALLBACK_TOPICS[subjectId] || []);
    }
  };

  const loadVideosForTopic = async (topic: Topic) => {
    try {
      let res = await apiRequest<Video[]>(`/api/content/videos/?topic=${topic.id}`);
      if (!res || res.length === 0) {
        const query = encodeURIComponent(topic.title);
        res = await apiRequest<Video[]>(`/api/learn/videos/?q=${query}`);
        res = res.map((v, i) => ({ ...v, id: topic.id * 1000 + i }));
      }
      if (res && res.length > 0) {
        setVideos(res);
      } else {
        setVideos(FALLBACK_VIDEOS[topic.id] || []);
      }
    } catch {
      setVideos(FALLBACK_VIDEOS[topic.id] || []);
    }
  };

  const handleSelectLevel = (lvl: Level) => {
    setSelectedLevel(lvl);
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSelectedVideo(null);
    setTopics([]);
    setVideos([]);
    loadSubjectsForLevel(lvl.id);
  };

  const handleSelectSubject = (subj: Subject) => {
    setSelectedSubject(subj);
    setSelectedTopic(null);
    setSelectedVideo(null);
    setVideos([]);
    loadTopicsForSubject(subj.id);
  };

  const handleSelectTopic = (top: Topic) => {
    setSelectedTopic(top);
    setSelectedVideo(null);
    loadVideosForTopic(top);
  };

  const handleSelectVideo = (vid: Video) => {
    setSelectedVideo(vid);
    setShowQuiz(false);
    setQuizAnswered(null);
  };

  const handleVideoCompleted = () => {
    if (selectedVideo && !completedVideos.includes(selectedVideo.id)) {
      setCompletedVideos((prev) => [...prev, selectedVideo.id]);
      setStars((prev) => prev + 10);
      setTodayCompletedCount((prev) => prev + 1);
      setShowQuiz(true);
      apiRequest<{ balance: number }>('/api/rewards/award/', {
        method: 'POST',
        body: JSON.stringify({ amount: 10, badge: 'Story Explorer' }),
      })
        .then((res) => setStars(res.balance))
        .catch(() => {});
    }
  };

  const handleBack = () => {
    if (selectedVideo) {
      setSelectedVideo(null);
      return;
    }
    if (selectedTopic) {
      setSelectedTopic(null);
      return;
    }
    if (selectedSubject) {
      setSelectedSubject(null);
      return;
    }
    router.push('/kid/dashboard');
  };

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    return topics.filter(
      (t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.summary && t.summary.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [topics, searchQuery]);

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const mockTopic: Topic = { 
        id: 9999, 
        subject: selectedSubject?.id || 0, 
        title: searchQuery.trim(), 
        summary: `Search results for "${searchQuery.trim()}"` 
      };
      handleSelectTopic(mockTopic);
    }
  };

  return (
    <KidLayout starsCount={stars}>
      {/* BACKGROUND LAYER */}
      <KidPageBackground theme="grass" />

      {/* PAGE CONTENT */}
      <div className="relative z-10 space-y-6">

        {/* 1. Bento Top Hero & Breadcrumbs Card */}
        <div className="rounded-[32px] border-2 border-emerald-200 dark:border-slate-800 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white dark:from-[#0f172a] dark:to-[#131b2a] p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Left: Mascot & Breadcrumb Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300 hover:scale-105 transition-all cursor-pointer shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div>
                <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                  <span>Learn Hub</span>
                  {selectedLevel && (
                    <>
                      <ChevronRight className="h-3 w-3 text-emerald-300 dark:text-emerald-700" />
                      <span className="text-emerald-700 dark:text-emerald-300">{selectedLevel.name.split(' ')[0]}</span>
                    </>
                  )}
                  {selectedSubject && (
                    <>
                      <ChevronRight className="h-3 w-3 text-emerald-300 dark:text-emerald-700" />
                      <span className="text-emerald-700 dark:text-emerald-300">{selectedSubject.name}</span>
                    </>
                  )}
                  {selectedTopic && (
                    <>
                      <ChevronRight className="h-3 w-3 text-emerald-300 dark:text-emerald-700" />
                      <span className="text-emerald-600 truncate max-w-[140px]">{selectedTopic.title}</span>
                    </>
                  )}
                </div>

                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                  {selectedVideo
                    ? selectedVideo.title
                    : selectedTopic
                      ? `Lessons in ${selectedTopic.title}`
                      : selectedSubject
                        ? `${selectedSubject.name} Topics`
                        : 'Explore Learning Quests 🌱'}
                </h1>
              </div>
            </div>

            {/* Right: Search / Safety Badge */}
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Search className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs">🦉</span>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                  placeholder="What do you want to explore today?"
                  className="pl-12 pr-4 py-2.5 rounded-full border-2 border-emerald-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all w-64 shadow-xs"
                />
              </div>

              <div className="bg-emerald-500 text-white text-xs font-extrabold py-2 px-4 rounded-full flex items-center gap-1.5 shadow-sm border-2 border-emerald-300">
                <ShieldCheck className="h-4 w-4 text-white animate-pulse" />
                <span>100% Kid Safe ✓</span>
              </div>
            </div>

          </div>
        </div>

        {/* 2. Grade Level Selector Pills (Chunky Tabs with Age Cues) */}
        <div className="rounded-[32px] border-2 border-emerald-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 shadow-sm">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 px-2 whitespace-nowrap">
              Grade Level:
            </span>
            {levels.map((lvl, idx) => {
              const isActive = selectedLevel?.id === lvl.id;
              const levelColors = [
                'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-500/25 ring-4 ring-orange-400/30',
                'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-500/25 ring-4 ring-sky-400/30',
                'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/25 ring-4 ring-emerald-400/30',
                'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/25 ring-4 ring-purple-400/30',
              ];
              return (
                <button
                  key={lvl.id}
                  onClick={() => handleSelectLevel(lvl)}
                  className={`px-5 py-3 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2.5 ${
                    isActive
                      ? levelColors[idx % 4] + ' scale-105'
                      : 'bg-emerald-50/70 dark:bg-slate-800 hover:bg-emerald-100 text-slate-700 dark:text-slate-300 border-2 border-emerald-200/80 dark:border-slate-700'
                  }`}
                >
                  <span className="text-base animate-kid-bob">{lvl.icon || '🌱'}</span>
                  <span>{lvl.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Main Bento 12-Column Grid Area */}
        <div className="grid grid-cols-12 gap-5">

          {/* LEFT MAIN AREA (8 COLS or 12 COLS if video active) */}
          <div className="col-span-12 lg:col-span-8 space-y-5">

            {/* VIEW A: Active Video Lesson Player */}
            {selectedVideo ? (
              <div className="rounded-[32px] border-2 border-emerald-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 shadow-sm space-y-6">

                {/* Scalloped Video Frame Wrapper */}
                <div className="rounded-3xl overflow-hidden border-4 border-emerald-300 dark:border-slate-800 shadow-lg bg-slate-900">
                  <SafeYouTubePlayer
                    youtubeId={selectedVideo.youtube_id || selectedVideo.video_id || ''}
                    onComplete={handleVideoCompleted}
                  />
                </div>
                
                {/* Video Companion Notebook (Paper Texture + AI Chat) */}
                <VideoCompanion videoId={selectedVideo.youtube_id || selectedVideo.video_id || ''} />

                {/* Video Meta Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-100 dark:border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                      {selectedSubject?.name || 'Academic Lesson'}
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                      {selectedVideo.title}
                    </h2>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      Source: {selectedVideo.source_channel || 'Verified Educational Partner'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-sky-800 dark:text-sky-300 text-xs font-extrabold py-1.5 px-3 rounded-full flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-sky-500" />
                      <span>{Math.floor((selectedVideo.duration_seconds || 300) / 60)} mins</span>
                    </span>

                    {completedVideos.includes(selectedVideo.id) ? (
                      <span className="bg-emerald-500 text-white border border-emerald-400 text-xs font-extrabold py-1.5 px-3 rounded-full flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        <span>Completed (+10 ★)</span>
                      </span>
                    ) : (
                      <span className="bg-amber-400 text-slate-900 border border-amber-300 text-xs font-extrabold py-1.5 px-3 rounded-full flex items-center gap-1 shadow-xs">
                        <Star className="h-3.5 w-3.5 fill-slate-900 text-slate-900" />
                        <span>+10 Bounty</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Takeaways */}
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500 animate-bounce" /> Key Takeaways from this Lesson
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(selectedVideo.takeaways || [
                      'Key concept introduced with clear visual models.',
                      'Practice thinking steps explained step-by-step.',
                      'Real world applications and quick quiz checkpoint.',
                    ]).map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-emerald-50/80 dark:bg-slate-800/80 border-2 border-emerald-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-start gap-2.5"
                      >
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          {idx + 1}
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Tactile Quiz Checkpoint */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-850 border-2 border-emerald-300 dark:border-emerald-800 rounded-[28px] p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                      Quick Knowledge Check
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">Earn +5 Bonus Stars!</span>
                  </div>

                  <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    What is the best way to master a new concept in this lesson?
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {[
                      { id: 1, text: 'Rush through as fast as possible', correct: false },
                      { id: 2, text: 'Understand the steps & practice actively', correct: true },
                      { id: 3, text: 'Skip the takeaways and examples', correct: false },
                    ].map((opt) => {
                      const isChosen = quizAnswered === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setQuizAnswered(opt.id);
                            if (opt.correct && quizAnswered !== opt.id) {
                              setStars((s) => s + 5);
                            }
                          }}
                          className={`p-3.5 rounded-2xl text-xs font-extrabold text-left transition-all cursor-pointer border-2 ${isChosen
                              ? opt.correct
                                ? 'bg-emerald-500 border-emerald-400 text-white shadow-md scale-105 animate-kid-confetti'
                                : 'bg-rose-500 border-rose-400 text-white shadow-md scale-105 animate-shake'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-emerald-400 hover:scale-105'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{opt.text}</span>
                            {isChosen && (opt.correct ? <Check className="h-4 w-4 text-white" /> : '✕')}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {quizAnswered === 2 && (
                    <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-300 pt-1 animate-kid-confetti">
                      🌟 Excellent job! You unlocked 5 bonus stars!
                    </p>
                  )}
                  {quizAnswered !== null && quizAnswered !== 2 && (
                    <p className="text-xs font-extrabold text-rose-500 dark:text-rose-400 pt-1 animate-shake">
                      Nice try! Give it another read and retry!
                    </p>
                  )}
                </div>

                {/* Navigation Footer */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="text-xs font-extrabold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1.5 cursor-pointer bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Topic Lessons</span>
                  </button>

                  {topics.length > 0 && (
                    <button
                      onClick={() => {
                        const nextIdx = topics.findIndex((t) => t.id === selectedTopic?.id) + 1;
                        if (nextIdx < topics.length) {
                          handleSelectTopic(topics[nextIdx]);
                        } else {
                          setSelectedVideo(null);
                        }
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs py-2.5 px-6 rounded-full shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
                    >
                      <span>Next Lesson</span>
                      <ChevronRight className="h-4 w-4 text-white animate-kid-wiggle" />
                    </button>
                  )}
                </div>

              </div>
            ) : null}

            {/* VIEW B.5: Dedicated Global YouTube Search Card */}
            {!selectedSubject && !selectedVideo && (
              <div className="rounded-[32px] border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 dark:from-slate-900 dark:to-slate-900 p-6 sm:p-8 shadow-sm space-y-5 relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md animate-kid-bob">
                      <Search className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                      Safe Educational Search
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 max-w-xl">
                    Looking for something specific? Type any topic below to find verified, ad-free educational videos.
                  </p>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="h-5 w-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchSubmit}
                      placeholder="E.g. Solar system, Fractions, Dinosaurs..."
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-emerald-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-xs"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (searchQuery.trim()) {
                        handleSearchSubmit({ key: 'Enter' } as React.KeyboardEvent<HTMLInputElement>);
                      }
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm py-3.5 px-8 rounded-2xl shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <span>Find Videos</span>
                    <ChevronRight className="h-4 w-4 text-white animate-kid-wiggle" />
                  </button>
                </div>
              </div>
            )}

            {/* VIEW B: Subject Selection Grid */}
            {!selectedSubject && !selectedVideo && (
              <div className="rounded-[32px] border-2 border-emerald-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                      Choose a Learning Subject
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-emerald-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-emerald-200 dark:border-slate-700">
                    {subjects.length} Subjects available
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {subjects.map((subj, idx) => {
                    const subjectThemes = [
                      { border: 'border-sky-300 dark:border-sky-800', bg: 'bg-sky-50/90 dark:bg-slate-800', iconBg: 'bg-sky-400 text-white', hoverBorder: 'hover:border-sky-400', text: 'group-hover:text-sky-600' },
                      { border: 'border-emerald-300 dark:border-emerald-800', bg: 'bg-emerald-50/90 dark:bg-slate-800', iconBg: 'bg-emerald-500 text-white', hoverBorder: 'hover:border-emerald-400', text: 'group-hover:text-emerald-600' },
                      { border: 'border-pink-300 dark:border-pink-800', bg: 'bg-pink-50/90 dark:bg-slate-800', iconBg: 'bg-pink-400 text-white', hoverBorder: 'hover:border-pink-400', text: 'group-hover:text-pink-600' },
                      { border: 'border-amber-300 dark:border-amber-800', bg: 'bg-amber-50/90 dark:bg-slate-800', iconBg: 'bg-amber-400 text-amber-950', hoverBorder: 'hover:border-amber-400', text: 'group-hover:text-amber-600' },
                      { border: 'border-purple-300 dark:border-purple-800', bg: 'bg-purple-50/90 dark:bg-slate-800', iconBg: 'bg-purple-500 text-white', hoverBorder: 'hover:border-purple-400', text: 'group-hover:text-purple-600' },
                    ];
                    const theme = subjectThemes[idx % 5];
                    return (
                      <div
                        key={subj.id}
                        onClick={() => handleSelectSubject(subj)}
                        className={`group rounded-[28px] border-2 ${theme.border} ${theme.bg} p-5 shadow-xs ${theme.hoverBorder} hover:scale-105 transition-all duration-200 cursor-pointer flex items-center justify-between`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl ${theme.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:animate-kid-wiggle transition-transform shadow-md`}>
                            {getSubjectIcon(subj.name)}
                          </div>
                          <div>
                            <h3 className={`text-base font-extrabold text-slate-900 dark:text-slate-100 ${theme.text} transition-colors`}>
                              {subj.name}
                            </h3>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                              Explore fun interactive topics
                            </p>
                          </div>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center text-slate-400 dark:text-slate-300 transition-all shrink-0 shadow-xs">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW C: Topic & Video List */}
            {selectedSubject && !selectedTopic && !selectedVideo && (
              <div className="rounded-[32px] border-2 border-emerald-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                      {selectedSubject.name}
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                      Select a Topic to Explore
                    </h2>
                  </div>

                  <button
                    onClick={() => setSelectedSubject(null)}
                    className="text-xs font-extrabold text-slate-500 dark:text-slate-400 hover:text-emerald-600 flex items-center gap-1 cursor-pointer bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-full"
                  >
                    <span>Switch Subject</span>
                  </button>
                </div>

                {/* Topic Cards Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {filteredTopics.map((top) => (
                    <div
                      key={top.id}
                      onClick={() => handleSelectTopic(top)}
                      className="group rounded-[28px] border-2 border-emerald-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-slate-850 p-5 shadow-xs hover:border-emerald-400 hover:scale-102 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 group-hover:animate-kid-wiggle shadow-md">
                          <BookOpen className="h-6 w-6" />
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                            {top.title}
                          </h3>
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 max-w-lg">
                            {top.summary || 'Curated video lesson series designed for young learners.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <span className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold py-1 px-3.5 rounded-full">
                          {top.videoCount || 1} Video Lesson
                        </span>
                        <button className="bg-emerald-500 text-white text-xs font-extrabold py-2 px-4 rounded-full shadow-sm group-hover:bg-emerald-600 flex items-center gap-1.5">
                          <span>Open</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW D: Video List for selected topic */}
            {selectedTopic && !selectedVideo && (
              <div className="rounded-[32px] border-2 border-emerald-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                      {selectedSubject?.name || 'Catalog'} &bull; Lessons
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                      {selectedTopic.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="text-xs font-extrabold text-slate-500 dark:text-slate-400 hover:text-emerald-600 flex items-center gap-1 cursor-pointer bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-full"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Topics</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {videos.map((vid) => {
                    const isDone = completedVideos.includes(vid.id);
                    return (
                      <div
                        key={vid.id}
                        onClick={() => handleSelectVideo(vid)}
                        className="group rounded-[28px] border-2 border-emerald-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-slate-850 p-5 shadow-xs hover:border-emerald-400 hover:scale-105 transition-all duration-200 cursor-pointer space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="relative aspect-video rounded-2xl bg-slate-900/90 overflow-hidden flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                            <img
                              src={vid.thumbnail_url || `https://img.youtube.com/vi/${vid.youtube_id || vid.video_id}/mqdefault.jpg`}
                              alt={vid.title}
                              className="w-full h-full object-cover opacity-85"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 group-hover:animate-kid-wiggle transition-transform">
                                <Play className="h-5 w-5 fill-white ml-0.5" />
                              </div>
                            </div>

                            <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-extrabold py-0.5 px-2 rounded-md">
                              {Math.floor((vid.duration_seconds || 300) / 60)}m
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                              {vid.title}
                            </h4>
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                              {vid.source_channel || 'YouTube Kids Education'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 dark:border-slate-800">
                          {isDone ? (
                            <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Finished
                            </span>
                          ) : (
                            <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> +10 Stars
                            </span>
                          )}

                          <span className="text-xs font-extrabold text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                            <span>Watch</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR BENTO CARDS (4 COLS) */}
          <div className="col-span-12 lg:col-span-4 space-y-5">

            {/* Card 1: Today's Learning Mission */}
            <div className="rounded-[32px] border-2 border-amber-300 dark:border-amber-800/60 bg-gradient-to-br from-amber-50/90 via-yellow-50/40 to-white dark:from-[#0f172a] dark:to-[#131b2a] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md animate-kid-bob">
                    <Flame className="h-5 w-5 fill-amber-950 text-amber-950" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Study Streak</h3>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
                      {streak} {streak === 1 ? 'Day' : 'Days'} in a Row
                    </p>
                  </div>
                </div>

                {selectedLevel && (
                  <span className="bg-amber-200 text-amber-950 border border-amber-300 text-xs font-extrabold py-1 px-3 rounded-full">
                    {selectedLevel.name.split(' ')[0]}
                  </span>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="text-slate-700 dark:text-slate-300">Daily Study Target</span>
                  <span className="text-amber-700 dark:text-amber-400">{todayCompletedCount} / 3 Lessons</span>
                </div>
                <div className="w-full h-3.5 bg-amber-100 dark:bg-slate-800 rounded-full overflow-hidden border border-amber-200 dark:border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (todayCompletedCount / 3) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] font-bold text-amber-900 dark:text-amber-300">
                  Complete 2 more lessons to earn the Daily Scholar Trophy!
                </p>
              </div>
            </div>

            {/* Card 2: Safe Learning Guarantee */}
            <div className="rounded-[32px] border-2 border-emerald-300 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white dark:from-[#0f172a] dark:to-[#131b2a] p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md animate-kid-bob">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Parent Verified</h3>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                    Curated Content Only
                  </p>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                Every video is reviewed for kid-appropriateness and hosted in safe, distraction-free playback mode with zero external ads or comments.
              </p>

              <div className="bg-white/80 dark:bg-slate-800/60 rounded-2xl p-3 border border-emerald-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>No unapproved YouTube links</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>No comment sections or pop-up ads</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Focus timer integration</span>
                </div>
              </div>
            </div>

            {/* Card 3: Quick Navigation */}
            <div className="rounded-[32px] border-2 border-purple-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 shadow-sm space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
                More Kid Adventures
              </span>

              <div className="space-y-2.5">
                <button
                  onClick={() => router.push('/kid/stories')}
                  className="w-full p-3 rounded-2xl border-2 border-purple-200 dark:border-slate-700 bg-purple-50/70 dark:bg-slate-800/60 hover:bg-purple-100 hover:scale-102 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center font-extrabold text-xs shadow-xs group-hover:animate-kid-wiggle">
                      📖
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-purple-600">Story Quest Trail</p>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Follow Leo the Owl</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600" />
                </button>

                <button
                  onClick={() => router.push('/kid/rewards')}
                  className="w-full p-3 rounded-2xl border-2 border-amber-200 dark:border-slate-700 bg-amber-50/70 dark:bg-slate-800/60 hover:bg-amber-100 hover:scale-102 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-extrabold text-xs shadow-xs group-hover:animate-kid-wiggle">
                      🏆
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-amber-600">Rewards Store</p>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Spend your stars</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </KidLayout>
  );
}
