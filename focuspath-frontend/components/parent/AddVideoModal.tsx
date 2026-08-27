'use client';

import { useState } from 'react';
import { X, Plus, MonitorPlay } from 'lucide-react';
import { addVideo } from '@/lib/parentApi';

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void; // called after a successful save, so the caller can refresh its list
}

// The parent-facing flow that was missing: paste a real YouTube link + tell FocusPath which
// level/subject/topic it belongs to. It shows up in the child's Learn page immediately —
// the backend auto-approves videos a parent adds for their own child.
export default function AddVideoModal({ isOpen, onClose, onAdded }: AddVideoModalProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [levelName, setLevelName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const reset = () => {
    setYoutubeUrl(''); setTitle(''); setLevelName(''); setSubjectName(''); setTopicTitle(''); setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim() || !title.trim() || !levelName.trim() || !subjectName.trim() || !topicTitle.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await addVideo({
        youtube_url: youtubeUrl.trim(),
        title: title.trim(),
        level_name: levelName.trim(),
        subject_name: subjectName.trim(),
        topic_title: topicTitle.trim(),
      });
      reset();
      onAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Could not add this video. Check the link and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 max-w-md w-full shadow-lg space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <MonitorPlay className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Add Learning Video</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Paste a YouTube link for your child to watch</p>
            </div>
          </div>
          <button onClick={() => { reset(); onClose(); }} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">YouTube Link</label>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-xs font-medium outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 bg-slate-50/40 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Video Title</label>
            <input
              type="text"
              placeholder="e.g. Learning the Alphabet with Songs"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-xs font-medium outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 bg-slate-50/40 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Grade Level</label>
              <input
                type="text"
                placeholder="e.g. Kindergarten & Early Years"
                value={levelName}
                onChange={(e) => setLevelName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-xs font-medium outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 bg-slate-50/40 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Alphabet & Phonics"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-xs font-medium outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 bg-slate-50/40 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Letter Sounds"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-xs font-medium outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 bg-slate-50/40 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
            This video is added straight to your child&apos;s catalog under this level/subject/topic — no other videos are shown unless you add them here.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={() => { reset(); onClose(); }} className="flex-1 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50">
              <Plus className="h-4 w-4" />
              {saving ? 'Adding…' : 'Add Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
