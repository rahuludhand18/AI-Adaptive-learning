'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ParentLayout from '@/components/layout/ParentLayout';
import AddWebsiteModal from '@/components/parent/AddWebsiteModal';
import AddVideoModal from '@/components/parent/AddVideoModal';
import MorsePatternModal from '@/components/parent/MorsePatternModal';
import { apiRequest } from '@/lib/api';
import { listMyVideos, deleteMyVideo, MyVideo } from '@/lib/parentApi';
import {
  BookOpen,
  Compass,
  Plus,
  Clock,
  Eye,
  Smartphone,
  Video,
  MonitorPlay,
  Trash2,
} from 'lucide-react';

interface WebsiteItem {
  id: string;
  name: string;
  category: string;
  icon: 'book' | 'compass' | 'video';
  allowed: boolean;
  color: string;
}

// Rebuild the UI website list from the backend's whitelist/blacklist string arrays.
function buildWebsites(whitelist: string[], blacklist: string[]): WebsiteItem[] {
  const mk = (name: string, allowed: boolean, i: number): WebsiteItem => ({
    id: `${allowed ? 'w' : 'b'}-${i}`,
    name,
    category: 'Website',
    icon: 'compass',
    allowed,
    color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
  });
  return [...whitelist.map((n, i) => mk(n, true, i)), ...blacklist.map((n, i) => mk(n, false, i))];
}

export default function ManageRestrictionsPage() {
  const router = useRouter();

  const [websites, setWebsites] = useState<WebsiteItem[]>([
    {
      id: '1',
      name: 'Khan Academy',
      category: 'Educational Platform',
      icon: 'book',
      allowed: true,
      color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: '2',
      name: 'Wikipedia for Kids',
      category: 'General Knowledge',
      icon: 'compass',
      allowed: true,
      color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400',
    },
    {
      id: '3',
      name: 'YouTube Kids',
      category: 'Video Content',
      icon: 'video',
      allowed: false,
      color: 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400',
    },
  ]);

  const [filterIntensity, setFilterIntensity] = useState<'Standard' | 'Strict' | 'Curated Only'>('Standard');
  const [timeLimit, setTimeLimit] = useState(3);
  const [eyeBreak, setEyeBreak] = useState(true);
  const [morsePattern, setMorsePattern] = useState('••—•');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);
  const [isMorseModalOpen, setIsMorseModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // videos this parent has added — the real content that appears in the child's Learn page
  const [myVideos, setMyVideos] = useState<MyVideo[]>([]);
  const loadMyVideos = () => listMyVideos().then(setMyVideos).catch(() => {});
  useEffect(() => { loadMyVideos(); }, []);

  const handleDeleteVideo = async (id: number) => {
    try {
      await deleteMyVideo(id);
      setMyVideos((prev) => prev.filter((v) => v.id !== id));
    } catch {
      // ignore; list stays as-is if delete fails
    }
  };

  // real restriction wiring: target the parent's first child
  const [childId, setChildId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const kids = await apiRequest<{ id: number; username: string }[]>('/api/parents/kids/');
        if (!kids.length) {
          setLoadError('Add a child account first to configure restrictions.');
          return;
        }
        const cid = kids[0].id;
        setChildId(cid);
        const r = await apiRequest<{
          daily_screen_time_limit: number; eye_break_interval: number;
          content_filter_intensity?: string; morse_pattern?: string;
          whitelisted_websites: string[]; blacklisted_websites: string[];
        }>(`/api/parents/restrictions/${cid}/`);
        setTimeLimit(Math.max(0, Math.round((r.daily_screen_time_limit ?? 180) / 60)));
        setEyeBreak((r.eye_break_interval ?? 20) > 0);
        if (r.content_filter_intensity === 'Standard' || r.content_filter_intensity === 'Strict' || r.content_filter_intensity === 'Curated Only') {
          setFilterIntensity(r.content_filter_intensity);
        }
        if (r.morse_pattern) setMorsePattern(r.morse_pattern);
        setWebsites(buildWebsites(r.whitelisted_websites || [], r.blacklisted_websites || []));
      } catch {
        setLoadError('Could not load restrictions. Please try again.');
      }
    })();
  }, []);

  const toggleWebsite = (id: string) => {
    setWebsites((prev) =>
      prev.map((site) => (site.id === id ? { ...site, allowed: !site.allowed } : site))
    );
  };

  const handleAddWebsite = (newSite: { name: string; category: string; icon: string; allowed: boolean }) => {
    const newItem: WebsiteItem = {
      id: Date.now().toString(),
      name: newSite.name,
      category: newSite.category,
      icon: 'book',
      allowed: newSite.allowed,
      color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
    };
    setWebsites((prev) => [...prev, newItem]);
  };

  const handleSaveChanges = async () => {
    if (!childId) {
      setLoadError('No child account selected.');
      return;
    }
    setSaving(true);
    setLoadError(null);
    try {
      await apiRequest(`/api/parents/restrictions/${childId}/`, {
        method: 'PUT',
        body: JSON.stringify({
          daily_screen_time_limit: timeLimit * 60,            // hours -> minutes
          eye_break_interval: eyeBreak ? 20 : 0,              // toggle -> interval
          content_filter_intensity: filterIntensity,
          morse_pattern: morsePattern,
          whitelisted_websites: websites.filter((w) => w.allowed).map((w) => w.name),
          blacklisted_websites: websites.filter((w) => !w.allowed).map((w) => w.name),
        }),
      });
      setSaveSuccess('Safety boundaries and restrictions updated successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      setLoadError(err.message || 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ParentLayout pendingRequestsCount={1}>
      <div className="space-y-6 pb-20">
        
        {/* Title & Description Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Manage Restrictions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Configure safety boundaries and digital well-being for your child's learning journey.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
            <span>{saveSuccess}</span>
            <button onClick={() => setSaveSuccess(null)} className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {loadError && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-semibold">
            {loadError}
          </div>
        )}

        {/* 2-Column Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column: Allowed Content & Websites Card (Col 7) */}
          <div className="col-span-12 lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-8 shadow-2xs space-y-6">
            
            {/* Allowed Content Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Allowed content & websites</h3>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add New</span>
              </button>
            </div>

            {/* Websites List */}
            <div className="space-y-3">
              {websites.map((site) => {
                let IconComp = BookOpen;
                if (site.icon === 'compass') IconComp = Compass;
                if (site.icon === 'video') IconComp = Video;

                return (
                  <div
                    key={site.id}
                    className="bg-slate-50/60 dark:bg-slate-800/60 border border-slate-100/80 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${site.color} flex items-center justify-center shrink-0`}>
                        <IconComp className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{site.name}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{site.category}</p>
                      </div>
                    </div>

                    {/* Purple Toggle Switch */}
                    <button
                      onClick={() => toggleWebsite(site.id)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        site.allowed ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-2xs ${
                          site.allowed ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Content Filtering Intensity Section */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Content Filtering Intensity</h4>

              <div className="grid grid-cols-3 gap-3">
                {(['Standard', 'Strict', 'Curated Only'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setFilterIntensity(level)}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      filterIntensity === level
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Daily Time Limit & Reminders Cards (Col 5) */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            
            {/* Daily Time Limit Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold">Daily time limit</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{timeLimit}</span>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">hours per day</span>
                </div>

                {/* Range Slider */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min={0}
                    max={12}
                    step={1}
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    <span>0h</span>
                    <span>6h</span>
                    <span>12h</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                  The app will automatically lock and display a "Rest Time" screen once the limit is reached.
                </p>
              </div>
            </div>

            {/* Eye Break & Morse Code Pattern Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 shadow-2xs space-y-5">
              
              {/* 20-minute Eye-break reminders */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <span>20-minute Eye-break reminders</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                    Encourages the 20-20-20 rule to reduce digital eye strain.
                  </p>
                </div>

                {/* Teal Switch Toggle */}
                <button
                  onClick={() => setEyeBreak(!eyeBreak)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    eyeBreak ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-2xs ${
                      eyeBreak ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Morse Code Pattern Row */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Set/change Morse code pattern</h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                    A tactile way for parents to bypass restrictions without using a keyboard.
                  </p>
                </div>

                {/* Dotted Border Button */}
                <button
                  onClick={() => setIsMorseModalOpen(true)}
                  className="w-full border-2 border-dashed border-amber-800 dark:border-amber-600 text-amber-900 dark:text-amber-300 bg-amber-50/30 dark:bg-amber-950/30 hover:bg-amber-50/70 dark:hover:bg-amber-950/50 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Smartphone className="h-4 w-4 text-amber-800 dark:text-amber-400" />
                  <span>Configure Pattern</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* Approved Learning Videos — the real content that shows up in the child's Learn page */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-8 shadow-2xs space-y-6 mb-24">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Approved learning videos</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                Only videos you add here ever appear in your child&apos;s Learn page.
              </p>
            </div>
            <button
              onClick={() => setIsAddVideoModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <MonitorPlay className="h-4 w-4" />
              <span>Add Video</span>
            </button>
          </div>

          {myVideos.length > 0 ? (
            <div className="space-y-3">
              {myVideos.map((v) => (
                <div
                  key={v.id}
                  className="bg-slate-50/60 dark:bg-slate-800/60 border border-slate-100/80 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <MonitorPlay className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{v.title}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate">
                        {v.level_name} · {v.subject_name} · {v.topic_title}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteVideo(v.id)}
                    title="Remove this video"
                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-1">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500">No videos added yet</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Click &quot;Add Video&quot; to paste a YouTube link for your child.</p>
            </div>
          )}
        </div>

        {/* Bottom Action Footer Bar */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 px-8 py-4 flex items-center justify-between z-20 shadow-md">
          <button
            onClick={() => router.push('/parent/dashboard')}
            className="py-2.5 px-6 rounded-2xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Discard
          </button>

          <button
            onClick={handleSaveChanges}
            disabled={saving || !childId}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-8 rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {/* Add Website Modal */}
        <AddWebsiteModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddWebsite}
        />

        {/* Add Video Modal */}
        <AddVideoModal
          isOpen={isAddVideoModalOpen}
          onClose={() => setIsAddVideoModalOpen(false)}
          onAdded={loadMyVideos}
        />

        {/* Morse Pattern Modal */}
        <MorsePatternModal
          isOpen={isMorseModalOpen}
          onClose={() => setIsMorseModalOpen(false)}
          currentPattern={morsePattern}
          onSavePattern={(pat) => setMorsePattern(pat)}
        />

      </div>
    </ParentLayout>
  );
}
