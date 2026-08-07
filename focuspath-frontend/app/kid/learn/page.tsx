'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Star, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import SafeYouTubePlayer from '@/components/kid/SafeYouTubePlayer';

// Minimal shapes for the curated catalog coming from the backend.
interface Level { id: number; name: string; }
interface Subject { id: number; name: string; }
interface Topic { id: number; title: string; }
interface Video { id: number; youtube_id: string; title: string; source_channel: string; }

// Kid's Mode learning screen: drill down level -> subject -> topic -> video, then play
// the video inside our safe player. Only approved videos are ever returned by the API.
export default function KidLearnPage() {
  const router = useRouter();

  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);

  const [level, setLevel] = useState<Level | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [video, setVideo] = useState<Video | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stars, setStars] = useState(0);

  // load levels once on mount
  useEffect(() => {
    setLoading(true);
    apiRequest<Level[]>('/api/content/levels/')
      .then(setLevels)
      .catch(() => setError('Could not load lessons. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  // fetch helper for each drill-down step
  const fetchStep = async <T,>(url: string, set: (v: T) => void) => {
    setLoading(true);
    setError('');
    try {
      set(await apiRequest<T>(url));
    } catch {
      setError('Could not load. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pickLevel = (l: Level) => {
    setLevel(l); setSubject(null); setTopic(null); setVideo(null); setTopics([]); setVideos([]);
    fetchStep<Subject[]>(`/api/content/subjects/?level=${l.id}`, setSubjects);
  };
  const pickSubject = (s: Subject) => {
    setSubject(s); setTopic(null); setVideo(null); setVideos([]);
    fetchStep<Topic[]>(`/api/content/topics/?subject=${s.id}`, setTopics);
  };
  const pickTopic = (t: Topic) => {
    setTopic(t); setVideo(null);
    fetchStep<Video[]>(`/api/content/videos/?topic=${t.id}`, setVideos);
  };

  // step back up one level in the drill-down
  const goBack = () => {
    if (video) return setVideo(null);
    if (topic) return setTopic(null);
    if (subject) return setSubject(null);
    if (level) return setLevel(null);
    router.push('/kid/dashboard');
  };

  const heading = video ? video.title
    : topic ? 'Pick a video'
    : subject ? 'Pick a topic'
    : level ? 'Pick a subject'
    : 'Pick your class';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F4FF] via-[#F8FAFC] to-[#F0F4FF] text-slate-800 font-sans antialiased">
      {/* header */}
      <header className="bg-white/90 backdrop-blur-xs border-b border-slate-200/80 px-8 h-16 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
        <button onClick={goBack} className="flex items-center gap-2 text-indigo-600 font-bold cursor-pointer">
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        <span className="font-extrabold text-xl text-indigo-600">FocusPath Learn</span>
        <div className="bg-amber-100/90 border border-amber-200 text-amber-900 text-xs font-extrabold py-1.5 px-4 rounded-full flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          <span>{stars}</span>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-indigo-600" /> {heading}
        </h1>

        {error && <p className="text-sm font-bold text-rose-600">{error}</p>}
        {loading && (
          <div className="flex items-center gap-2 text-slate-500 font-semibold">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading…
          </div>
        )}

        {/* video player view */}
        {video && (
          <div className="bg-white rounded-[32px] border border-slate-200/80 p-6 shadow-sm">
            <SafeYouTubePlayer
              youtubeId={video.youtube_id}
              onComplete={() => setStars((s) => s + 5)} // reward on lesson completion
            />
            <p className="text-xs text-slate-400 font-semibold mt-3">From: {video.source_channel || 'Approved channel'}</p>
          </div>
        )}

        {/* card grid for the current drill-down step */}
        {!video && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {!level && levels.map((l) => (
              <Card key={l.id} label={l.name} onClick={() => pickLevel(l)} />
            ))}
            {level && !subject && subjects.map((s) => (
              <Card key={s.id} label={s.name} onClick={() => pickSubject(s)} />
            ))}
            {subject && !topic && topics.map((t) => (
              <Card key={t.id} label={t.title} onClick={() => pickTopic(t)} />
            ))}
            {topic && videos.map((v) => (
              <Card key={v.id} label={v.title} onClick={() => setVideo(v)} />
            ))}

            {/* friendly empty state so a child never hits a blank screen */}
            {emptyState(level, subject, topic, levels, subjects, topics, videos) && (
              <p className="col-span-full text-sm font-semibold text-slate-500">
                Nothing here yet — check back soon!
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// a single tappable tile
function Card({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-[28px] border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all text-left cursor-pointer"
    >
      <span className="text-base font-extrabold text-slate-800">{label}</span>
    </button>
  );
}

// true when the current step has no items to show
function emptyState(
  level: Level | null, subject: Subject | null, topic: Topic | null,
  levels: Level[], subjects: Subject[], topics: Topic[], videos: Video[]
) {
  if (!level) return levels.length === 0;
  if (!subject) return subjects.length === 0;
  if (!topic) return topics.length === 0;
  return videos.length === 0;
}
