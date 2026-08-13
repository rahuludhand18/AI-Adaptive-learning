'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import KidLayout from '@/components/layout/KidLayout';
import SafeYouTubePlayer from '@/components/kid/SafeYouTubePlayer';
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
  topic: number;
  youtube_id: string;
  title: string;
  duration_seconds: number;
  source_channel: string;
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
  3022: [
    {
      id: 4,
      topic: 3022,
      youtube_id: 'd7K0Y_x0vCg',
      title: 'Ocean Animals for Kids | Marine Life Exploration',
      duration_seconds: 280,
      source_channel: 'SciShow Kids',
      age_min: 5,
      age_max: 13,
      takeaways: [
        'Over 70% of Earth is covered by oceans.',
        'Blue whales are the largest creatures ever known to live on Earth.',
        'Coral reefs support over 25% of all marine species.',
      ],
    },
  ],
};

// Subject Icon Helper
function getSubjectIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('math') || lower.includes('number') || lower.includes('count')) {
    return <Calculator className="h-5 w-5 text-primary" />;
  }
  if (lower.includes('space') || lower.includes('science') || lower.includes('physics') || lower.includes('nature')) {
    return <Atom className="h-5 w-5 text-primary" />;
  }
  if (lower.includes('art') || lower.includes('creative') || lower.includes('color')) {
    return <Palette className="h-5 w-5 text-primary" />;
  }
  if (lower.includes('world') || lower.includes('history') || lower.includes('animal') || lower.includes('geo')) {
    return <Globe className="h-5 w-5 text-primary" />;
  }
  if (lower.includes('code') || lower.includes('robot') || lower.includes('tech')) {
    return <Rocket className="h-5 w-5 text-primary" />;
  }
  return <BookOpen className="h-5 w-5 text-primary" />;
}

export default function KidLearnPage() {
  const router = useRouter();

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
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState(250);
  const [completedVideos, setCompletedVideos] = useState<number[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [todayCompletedCount, setTodayCompletedCount] = useState(1);

  // Load levels on mount
  useEffect(() => {
    setLoading(true);
    apiRequest<Level[]>('/api/content/levels/')
      .then((res) => {
        if (res && res.length > 0) {
          setLevels(res);
          setSelectedLevel(res[0]);
          loadSubjectsForLevel(res[0].id);
        } else {
          setLevels(FALLBACK_LEVELS);
          setSelectedLevel(FALLBACK_LEVELS[2]);
          loadSubjectsForLevel(FALLBACK_LEVELS[2].id);
        }
      })
      .catch(() => {
        setLevels(FALLBACK_LEVELS);
        setSelectedLevel(FALLBACK_LEVELS[2]);
        loadSubjectsForLevel(FALLBACK_LEVELS[2].id);
      })
      .finally(() => setLoading(false));
  }, []);

  // Load subjects for a level
  const loadSubjectsForLevel = async (levelId: number) => {
    setLoading(true);
    try {
      const res = await apiRequest<Subject[]>(`/api/content/subjects/?level=${levelId}`);
      if (res && res.length > 0) {
        setSubjects(res);
      } else {
        setSubjects(FALLBACK_SUBJECTS[levelId] || FALLBACK_SUBJECTS[3] || []);
      }
    } catch {
      setSubjects(FALLBACK_SUBJECTS[levelId] || FALLBACK_SUBJECTS[3] || []);
    } finally {
      setLoading(false);
    }
  };

  // Load topics for a subject
  const loadTopicsForSubject = async (subjectId: number) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Load videos for a topic
  const loadVideosForTopic = async (topicId: number) => {
    setLoading(true);
    try {
      const res = await apiRequest<Video[]>(`/api/content/videos/?topic=${topicId}`);
      if (res && res.length > 0) {
        setVideos(res);
      } else {
        setVideos(FALLBACK_VIDEOS[topicId] || [
          {
            id: topicId * 100 + 1,
            topic: topicId,
            youtube_id: 'libKVRa01L8',
            title: 'Interactive Focus Lesson',
            duration_seconds: 240,
            source_channel: 'FocusPath Approved Channel',
            age_min: 5,
            age_max: 14,
            takeaways: [
              'Watch actively to discover new connections.',
              'Pause anytime you need to take notes.',
              'Earn 10 stars once you complete the video!',
            ],
          }
        ]);
      }
    } catch {
      setVideos(FALLBACK_VIDEOS[topicId] || []);
    } finally {
      setLoading(false);
    }
  };

  // Level Selection Handler
  const handleSelectLevel = (lvl: Level) => {
    setSelectedLevel(lvl);
    setSelectedSubject(null);
    setSelectedTopic(null);
    setSelectedVideo(null);
    setTopics([]);
    setVideos([]);
    loadSubjectsForLevel(lvl.id);
  };

  // Subject Selection Handler
  const handleSelectSubject = (subj: Subject) => {
    setSelectedSubject(subj);
    setSelectedTopic(null);
    setSelectedVideo(null);
    setVideos([]);
    loadTopicsForSubject(subj.id);
  };

  // Topic Selection Handler
  const handleSelectTopic = (top: Topic) => {
    setSelectedTopic(top);
    setSelectedVideo(null);
    loadVideosForTopic(top.id);
  };

  // Video Selection Handler
  const handleSelectVideo = (vid: Video) => {
    setSelectedVideo(vid);
    setShowQuiz(false);
    setQuizAnswered(null);
  };

  // Video Complete Handler
  const handleVideoCompleted = () => {
    if (selectedVideo && !completedVideos.includes(selectedVideo.id)) {
      setCompletedVideos((prev) => [...prev, selectedVideo.id]);
      setStars((prev) => prev + 10);
      setTodayCompletedCount((prev) => prev + 1);
      setShowQuiz(true);
      // persist the reward on the backend and reflect the real balance
      apiRequest<{ balance: number }>('/api/rewards/award/', {
        method: 'POST',
        body: JSON.stringify({ amount: 10, badge: 'Story Explorer' }),
      })
        .then((res) => setStars(res.balance))
        .catch(() => {});
    }
  };

  // Step back in drill-down
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

  // Filtered topics based on search
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    return topics.filter(
      (t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.summary && t.summary.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [topics, searchQuery]);

  return (
    <KidLayout starsCount={stars}>
      <div className="min-h-screen bg-slate-50/60 dark:bg-[#0b0f17] -m-4 sm:-m-8 p-4 sm:p-8 transition-colors">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* 1. Bento Top Hero & Breadcrumbs Card */}
          <div className="rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

              {/* Left: Mascot & Breadcrumb Navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer shrink-0"
                  title="Go Back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 dark:text-primary">
                    <span>Learn Hub</span>
                    {selectedLevel && (
                      <>
                        <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                        <span className="text-slate-500 dark:text-slate-400">{selectedLevel.name.split(' ')[0]}</span>
                      </>
                    )}
                    {selectedSubject && (
                      <>
                        <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                        <span className="text-slate-500 dark:text-slate-400">{selectedSubject.name}</span>
                      </>
                    )}
                    {selectedTopic && (
                      <>
                        <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                        <span className="text-primary truncate max-w-[140px]">{selectedTopic.title}</span>
                      </>
                    )}
                  </div>

                  <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mt-0.5">
                    {selectedVideo
                      ? selectedVideo.title
                      : selectedTopic
                        ? `Lessons in ${selectedTopic.title}`
                        : selectedSubject
                          ? `${selectedSubject.name} Topics`
                          : 'Explore Learning Quests'}
                  </h1>
                </div>
              </div>

              {/* Right: Search / Stars Tracker */}
              <div className="flex items-center gap-3">
                <div className="relative hidden sm:block">
                  <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search topics..."
                    className="pl-9 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-slate-850 transition-all w-48"
                  />
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/50 text-xs font-semibold py-2 px-4 rounded-full flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>100% Kid Safe</span>
                </div>
              </div>

            </div>
          </div>

          {/* 2. Level Selector Pills (Always visible for quick grade switching) */}
          <div className="rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 px-3 whitespace-nowrap">
                Grade Level:
              </span>
              {levels.map((lvl) => {
                const isActive = selectedLevel?.id === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => handleSelectLevel(lvl)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 hover:text-primary text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
                      }`}
                  >
                    <span>{lvl.icon || '📚'}</span>
                    <span>{lvl.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Main Bento 12-Column Grid Area */}
          <div className="grid grid-cols-12 gap-5">

            {/* LEFT MAIN AREA (8 COLS or 12 COLS if video active) */}
            <div className={`${selectedVideo ? 'col-span-12 lg:col-span-8' : 'col-span-12 lg:col-span-8'} space-y-5`}>

              {/* VIEW A: Active Video Lesson Player */}
              {selectedVideo ? (
                <div className="rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">

                  {/* Player Frame */}
                  <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-900 shadow-sm">
                    <SafeYouTubePlayer
                      youtubeId={selectedVideo.youtube_id}
                      onComplete={handleVideoCompleted}
                    />
                  </div>

                  {/* Video Meta Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 dark:text-primary">
                        {selectedSubject?.name || 'Academic Lesson'}
                      </span>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                        {selectedVideo.title}
                      </h2>
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                        Source: {selectedVideo.source_channel || 'Verified Educational Partner'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold py-1.5 px-3 rounded-full flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{Math.floor(selectedVideo.duration_seconds / 60)} mins</span>
                      </span>

                      {completedVideos.includes(selectedVideo.id) ? (
                        <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-800/50 text-xs font-bold py-1.5 px-3 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Completed (+10 ★)</span>
                        </span>
                      ) : (
                        <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50 text-xs font-bold py-1.5 px-3 rounded-full flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>+10 Stars Bounty</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Key Takeaways */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" /> Key Takeaways from this Lesson
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(selectedVideo.takeaways || [
                        'Key concept introduced with clear visual models.',
                        'Practice thinking steps explained step-by-step.',
                        'Real world applications and quick quiz checkpoint.',
                      ]).map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700 rounded-2xl p-3 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-start gap-2.5"
                        >
                          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Quick Quiz Checkpoint */}
                  <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-[24px] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                        Quick Knowledge Check
                      </span>
                      <span className="text-xs font-bold text-primary">Earn +5 Bonus Stars!</span>
                    </div>

                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
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
                            className={`p-3 rounded-2xl text-xs font-semibold text-left transition-all cursor-pointer border ${isChosen
                                ? opt.correct
                                  ? 'bg-emerald-100/80 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                                  : 'bg-rose-100/80 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-primary/40'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{opt.text}</span>
                              {isChosen && (opt.correct ? <Check className="h-4 w-4 text-emerald-600" /> : '✕')}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {quizAnswered === 2 && (
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 animate-in fade-in pt-1">
                        🌟 Excellent job! You unlocked 5 bonus stars!
                      </p>
                    )}
                  </div>

                  {/* Navigation Footer */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setSelectedVideo(null)}
                      className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1.5 cursor-pointer"
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
                        className="bg-primary hover:bg-primary/90 text-white font-bold text-xs py-2.5 px-6 rounded-full shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <span>Next Lesson</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                </div>
              ) : null}

              {/* VIEW B: Subject Selection Grid (When no subject is picked) */}
              {!selectedSubject && !selectedVideo && (
                <div className="rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        Choose a Learning Subject
                      </h2>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                      {subjects.length} Subjects available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {subjects.map((subj) => (
                      <div
                        key={subj.id}
                        onClick={() => handleSelectSubject(subj)}
                        className="group rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-5 shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            {getSubjectIcon(subj.name)}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                              {subj.name}
                            </h3>
                            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                              Explore fun interactive topics
                            </p>
                          </div>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white flex items-center justify-center text-slate-400 dark:text-slate-500 transition-all shrink-0">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW C: Topic & Video List (When Subject is picked but no video) */}
              {selectedSubject && !selectedTopic && !selectedVideo && (
                <div className="rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 dark:text-primary">
                        {selectedSubject.name}
                      </span>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        Select a Topic to Explore
                      </h2>
                    </div>

                    <button
                      onClick={() => setSelectedSubject(null)}
                      className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary flex items-center gap-1 cursor-pointer"
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
                        className="group rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-5 shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <BookOpen className="h-6 w-6 text-primary" />
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                              {top.title}
                            </h3>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-lg">
                              {top.summary || 'Curated video lesson series designed for young learners.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <span className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold py-1 px-3 rounded-full">
                            {top.videoCount || 1} Video Lesson
                          </span>
                          <button className="bg-primary text-white text-xs font-bold py-2 px-4 rounded-full shadow-sm group-hover:bg-primary/90 flex items-center gap-1.5">
                            <span>Open</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {filteredTopics.length === 0 && (
                      <div className="text-center py-12 space-y-2">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                          No topics found matching "{searchQuery}".
                        </p>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                          Clear search filter
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW D: Video List for selected topic */}
              {selectedTopic && !selectedVideo && (
                <div className="rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 dark:text-primary">
                        {selectedSubject?.name || 'Catalog'} &bull; Lessons
                      </span>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {selectedTopic.title}
                      </h2>
                    </div>

                    <button
                      onClick={() => setSelectedTopic(null)}
                      className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary flex items-center gap-1 cursor-pointer"
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
                          className="group rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-5 shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 cursor-pointer space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            {/* Video Thumbnail placeholder / safe badge */}
                            <div className="relative aspect-video rounded-2xl bg-slate-900/90 overflow-hidden flex items-center justify-center group-hover:scale-[1.01] transition-transform">
                              <img
                                src={`https://img.youtube.com/vi/${vid.youtube_id}/mqdefault.jpg`}
                                alt={vid.title}
                                className="w-full h-full object-cover opacity-85"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                  <Play className="h-5 w-5 fill-primary ml-0.5" />
                                </div>
                              </div>

                              <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold py-0.5 px-2 rounded-md">
                                {Math.floor(vid.duration_seconds / 60)}m
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 group-hover:text-primary transition-colors">
                                {vid.title}
                              </h4>
                              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                {vid.source_channel}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                            {isDone ? (
                              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Finished
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> +10 Stars
                              </span>
                            )}

                            <span className="text-xs font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                              <span>Watch</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {videos.length === 0 && (
                      <div className="col-span-full text-center py-10 text-slate-400 dark:text-slate-500 text-xs font-semibold">
                        Lessons are currently being curated for this topic. Check back soon!
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT SIDEBAR BENTO CARDS (4 COLS) */}
            <div className="col-span-12 lg:col-span-4 space-y-5">

              {/* Card 1: Today's Learning Mission */}
              <div className="rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <Flame className="h-5 w-5 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Study Streak</h3>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        5 Days in a Row
                      </p>
                    </div>
                  </div>

                  <span className="bg-primary/5 text-primary border border-primary/20 text-xs font-bold py-1 px-3 rounded-full">
                    Level 3
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-300">Daily Study Target</span>
                    <span className="text-primary">{todayCompletedCount} / 3 Lessons</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (todayCompletedCount / 3) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    Complete 2 more lessons to earn the Daily Scholar Trophy!
                  </p>
                </div>
              </div>

              {/* Card 2: Safe Learning Guarantee */}
              <div className="rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Parent Verified</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                      Curated Content Only
                    </p>
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every video is reviewed for kid-appropriateness and hosted in safe, distraction-free playback mode with zero external ads or comments.
                </p>

                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>No unapproved YouTube links</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>No comment sections or pop-up ads</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Focus timer integration</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Quick Navigation to Other Fun Quests */}
              <div className="rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  More Kid Adventures
                </span>

                <div className="space-y-2.5">
                  <button
                    onClick={() => router.push('/kid/stories')}
                    className="w-full p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-primary/5 hover:border-primary/30 flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                        📖
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary">Story Quest Trail</p>
                        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Follow Leo the Owl</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary" />
                  </button>

                  <button
                    onClick={() => router.push('/kid/rewards')}
                    className="w-full p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-primary/5 hover:border-primary/30 flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                        🏆
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary">Rewards Store</p>
                        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Spend your stars</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </KidLayout>
  );
}
