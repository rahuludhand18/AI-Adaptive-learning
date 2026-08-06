'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ParentLayout from '@/components/layout/ParentLayout';
import AddWebsiteModal from '@/components/parent/AddWebsiteModal';
import MorsePatternModal from '@/components/parent/MorsePatternModal';
import {
  BookOpen,
  Compass,
  FileText,
  Plus,
  Clock,
  Eye,
  Smartphone,
  CheckCircle,
  Video
} from 'lucide-react';

interface WebsiteItem {
  id: string;
  name: string;
  category: string;
  icon: 'book' | 'compass' | 'video';
  allowed: boolean;
  color: string;
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
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      id: '2',
      name: 'Wikipedia for Kids',
      category: 'General Knowledge',
      icon: 'compass',
      allowed: true,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      id: '3',
      name: 'YouTube Kids',
      category: 'Video Content',
      icon: 'video',
      allowed: false,
      color: 'bg-teal-50 text-teal-600',
    },
  ]);

  const [filterIntensity, setFilterIntensity] = useState<'Standard' | 'Strict' | 'Curated Only'>('Standard');
  const [timeLimit, setTimeLimit] = useState(3);
  const [eyeBreak, setEyeBreak] = useState(true);
  const [morsePattern, setMorsePattern] = useState('••—•');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMorseModalOpen, setIsMorseModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

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
      color: 'bg-indigo-50 text-indigo-600',
    };
    setWebsites((prev) => [...prev, newItem]);
  };

  const handleSaveChanges = () => {
    setSaveSuccess('Safety boundaries and restrictions updated successfully!');
    setTimeout(() => {
      setSaveSuccess(null);
    }, 3000);
  };

  return (
    <ParentLayout pendingRequestsCount={1}>
      <div className="space-y-6 pb-20">
        
        {/* Title & Description Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Manage Restrictions
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Configure safety boundaries and digital well-being for your child's learning journey.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200">
            <span>{saveSuccess}</span>
            <button onClick={() => setSaveSuccess(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* 2-Column Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column: Allowed Content & Websites Card (Col 7) */}
          <div className="col-span-12 lg:col-span-7 bg-white border border-slate-200/80 rounded-[32px] p-8 shadow-2xs space-y-6">
            
            {/* Allowed Content Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Allowed content & websites</h3>
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
                    className="bg-slate-50/60 border border-slate-100/80 rounded-2xl p-4 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${site.color} flex items-center justify-center shrink-0`}>
                        <IconComp className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{site.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{site.category}</p>
                      </div>
                    </div>

                    {/* Purple Toggle Switch */}
                    <button
                      onClick={() => toggleWebsite(site.id)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        site.allowed ? 'bg-indigo-600' : 'bg-slate-200'
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
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800">Content Filtering Intensity</h4>

              <div className="grid grid-cols-3 gap-3">
                {(['Standard', 'Strict', 'Curated Only'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setFilterIntensity(level)}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      filterIntensity === level
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-2xs'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
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
            <div className="bg-white border border-slate-200/80 rounded-[32px] p-6 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 text-slate-800">
                <Clock className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-bold">Daily time limit</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-indigo-600">{timeLimit}</span>
                  <span className="text-sm font-bold text-slate-500">hours per day</span>
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
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>0h</span>
                    <span>6h</span>
                    <span>12h</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  The app will automatically lock and display a "Rest Time" screen once the limit is reached.
                </p>
              </div>
            </div>

            {/* Eye Break & Morse Code Pattern Card */}
            <div className="bg-white border border-slate-200/80 rounded-[32px] p-6 shadow-2xs space-y-5">
              
              {/* 20-minute Eye-break reminders */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-teal-600" />
                    <span>20-minute Eye-break reminders</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                    Encourages the 20-20-20 rule to reduce digital eye strain.
                  </p>
                </div>

                {/* Teal Switch Toggle */}
                <button
                  onClick={() => setEyeBreak(!eyeBreak)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    eyeBreak ? 'bg-teal-500' : 'bg-slate-200'
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
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">Set/change Morse code pattern</h4>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                    A tactile way for parents to bypass restrictions without using a keyboard.
                  </p>
                </div>

                {/* Dotted Border Button */}
                <button
                  onClick={() => setIsMorseModalOpen(true)}
                  className="w-full border-2 border-dashed border-amber-800 text-amber-900 bg-amber-50/30 hover:bg-amber-50/70 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Smartphone className="h-4 w-4 text-amber-800" />
                  <span>Configure Pattern</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* Bottom Action Footer Bar */}
        <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-slate-200/80 px-8 py-4 flex items-center justify-between z-20 shadow-md">
          <button
            onClick={() => router.push('/parent/dashboard')}
            className="py-2.5 px-6 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Discard
          </button>

          <button
            onClick={handleSaveChanges}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-8 rounded-2xl shadow-sm transition-all cursor-pointer"
          >
            Save Changes
          </button>
        </div>

        {/* Add Website Modal */}
        <AddWebsiteModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddWebsite}
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
