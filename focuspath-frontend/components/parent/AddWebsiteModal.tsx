'use client';

import { useState } from 'react';
import { X, Plus, Globe, ShieldCheck } from 'lucide-react';

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newSite: { name: string; category: string; icon: string; allowed: boolean }) => void;
}

export default function AddWebsiteModal({ isOpen, onClose, onAdd }: AddWebsiteModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Educational Platform');
  const [allowed, setAllowed] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      category,
      icon: 'globe',
      allowed,
    });

    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-[32px] p-6 max-w-md w-full shadow-lg space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Add New Site or App</h3>
              <p className="text-xs text-slate-400 font-medium">Configure custom access permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Platform / Website Name
            </label>
            <input
              type="text"
              placeholder="e.g. Duolingo, Coursera, YouTube"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-medium outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 bg-slate-50/40"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-xs font-medium outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 bg-slate-50/40"
            >
              <option value="Educational Platform">Educational Platform</option>
              <option value="General Knowledge">General Knowledge</option>
              <option value="Video Content">Video Content</option>
              <option value="Gaming & Entertainment">Gaming & Entertainment</option>
              <option value="Social Media">Social Media</option>
            </select>
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-800">Initial Access State</span>
              <p className="text-[10px] text-slate-400 font-medium">Allow child access by default</p>
            </div>
            <button
              type="button"
              onClick={() => setAllowed(!allowed)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                allowed ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                  allowed ? 'right-1' : 'left-1'
                }`}
              ></span>
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Website
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
