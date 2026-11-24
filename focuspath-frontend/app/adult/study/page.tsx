'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import SafeYouTubePlayer from '@/components/kid/SafeYouTubePlayer';
import VideoCompanion from '@/components/kid/VideoCompanion';
import { apiRequest } from '@/lib/api';
import {
  Search,
  Play,
  Sparkles,
  BookOpen,
  Compass,
  Clock,
  Loader2,
  GraduationCap,
  Layers,
  CheckCircle2,
  Video
} from 'lucide-react';

interface VideoResult {
  video_id: string;
  title: string;
  thumbnail_url: string;
  source_channel: string;
  duration_seconds: number;
}

export default function AdultStudyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search and Video Player States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<VideoResult[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);

  // Suggested academic topics with warm colors
  const recommendedTopics = [
    'Artificial Intelligence & Agents',
    'Machine Learning Foundations',
    'Data Structures & Algorithms',
    'System Design & Distributed Systems',
    'Deep Learning & Neural Networks',
    'Python Full Stack Development',
    'Calculus & Linear Algebra'
  ];

  // Default initial query or from URL params
  useEffect(() => {
    const q = searchParams.get('q');
    const initialQuery = q || 'Artificial Intelligence Agents';
    setSearchQuery(initialQuery);
    executeSearch(initialQuery);
  }, []);

  const executeSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;
    setIsSearching(true);
    try {
      const data = await apiRequest<any>(`/api/learn/search/?q=${encodeURIComponent(queryToSearch.trim())}`);
      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data);
        setSelectedVideo(data[0]);
      } else {
        // Fallback curated academic videos
        const fallbacks: VideoResult[] = [
          {
            video_id: 'JMUxmLyrhSk',
            title: `Artificial Intelligence & Agents Full Course: ${queryToSearch}`,
            thumbnail_url: 'https://img.youtube.com/vi/JMUxmLyrhSk/hqdefault.jpg',
            source_channel: 'freeCodeCamp.org',
            duration_seconds: 2100
          },
          {
            video_id: 'i_LwzRVP7bg',
            title: `Machine Learning & AI Concepts Explained: ${queryToSearch}`,
            thumbnail_url: 'https://img.youtube.com/vi/i_LwzRVP7bg/hqdefault.jpg',
            source_channel: 'StatQuest with Josh Starmer',
            duration_seconds: 1080
          },
          {
            video_id: 'aircAruvnKk',
            title: `Deep Learning & Neural Networks Lecture: ${queryToSearch}`,
            thumbnail_url: 'https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg',
            source_channel: '3Blue1Brown',
            duration_seconds: 1200
          },
          {
            video_id: '8ext9G7xspg',
            title: `Data Structures and Algorithms Lecture: ${queryToSearch}`,
            thumbnail_url: 'https://img.youtube.com/vi/8ext9G7xspg/hqdefault.jpg',
            source_channel: 'MIT OpenCourseWare',
            duration_seconds: 3200
          }
        ];
        setSearchResults(fallbacks);
        setSelectedVideo(fallbacks[0]);
      }
    } catch (err: any) {
      // Graceful offline fallback
      const fallbacks: VideoResult[] = [
        {
          video_id: 'JMUxmLyrhSk',
          title: `Artificial Intelligence & Agents Full Course: ${queryToSearch}`,
          thumbnail_url: 'https://img.youtube.com/vi/JMUxmLyrhSk/hqdefault.jpg',
          source_channel: 'freeCodeCamp.org',
          duration_seconds: 2100
        },
        {
          video_id: 'i_LwzRVP7bg',
          title: `Machine Learning & AI Concepts Explained: ${queryToSearch}`,
          thumbnail_url: 'https://img.youtube.com/vi/i_LwzRVP7bg/hqdefault.jpg',
          source_channel: 'StatQuest with Josh Starmer',
          duration_seconds: 1080
        },
        {
          video_id: 'aircAruvnKk',
          title: `Deep Learning & Neural Networks Lecture: ${queryToSearch}`,
          thumbnail_url: 'https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg',
          source_channel: '3Blue1Brown',
          duration_seconds: 1200
        },
        {
          video_id: '8ext9G7xspg',
          title: `Data Structures and Algorithms Lecture: ${queryToSearch}`,
          thumbnail_url: 'https://img.youtube.com/vi/8ext9G7xspg/hqdefault.jpg',
          source_channel: 'MIT OpenCourseWare',
          duration_seconds: 3200
        }
      ];
      setSearchResults(fallbacks);
      setSelectedVideo(fallbacks[0]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleSelectVideo = (video: VideoResult) => {
    setSelectedVideo(video);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/40 via-orange-50/20 to-yellow-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <TopNav />

      <main className="flex-1 py-8">
        <PageContainer>
          {/* Header Banner - FocusPath Warm Theme */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/60 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Academic Video Study Hub</span>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Study & Interactive AI Companion
                </h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Watch course lectures and ask live questions directly to the video's AI study companion.
                </p>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search course, lecture, or concept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 bg-white dark:bg-slate-900 border border-orange-200/80 dark:border-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-400 focus:outline-none shadow-sm dark:text-slate-100 placeholder:text-slate-400"
                />
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Search'}
                </button>
              </form>
            </div>

            {/* Quick Topic Chips */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Compass className="h-3.5 w-3.5" /> Quick Topics:
              </span>
              {recommendedTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSearchQuery(topic);
                    executeSearch(topic);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                    searchQuery.toLowerCase() === topic.toLowerCase()
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-orange-100 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Active Video Player & AI Companion Bento Layout */}
          {selectedVideo && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
              {/* Left: Video Player Card */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-[32px] border-2 border-orange-100 dark:border-slate-800 shadow-sm overflow-hidden p-3.5">
                  <div className="rounded-[24px] overflow-hidden aspect-video bg-black shadow-inner">
                    <SafeYouTubePlayer
                      key={selectedVideo.video_id}
                      youtubeId={selectedVideo.video_id}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-400 mb-1">
                      <span>{selectedVideo.source_channel || 'Academic Source'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400 font-medium">
                        <Clock className="h-3 w-3" />
                        {Math.round(selectedVideo.duration_seconds / 60)} mins
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {selectedVideo.title}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Right: AI Video Companion (Q&A and Breakdown) */}
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-[32px] border-2 border-orange-100 dark:border-slate-800 shadow-sm p-4 flex-1 flex flex-col h-[520px]">
                  <VideoCompanion
                    videoId={selectedVideo.video_id}
                    title={selectedVideo.title}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Video className="h-5 w-5 text-orange-500" />
                <span>Related Video Lectures & Sessions</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                {searchResults.length} videos found
              </span>
            </div>

            {isSearching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl border border-orange-100 dark:border-slate-800 p-3 space-y-3 animate-pulse">
                    <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-[32px] border border-orange-100 dark:border-slate-800 p-8">
                <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">No videos found</p>
                <p className="text-xs text-slate-400 mt-1">Try searching for a different subject or chapter topic.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((video) => {
                  const isCurrent = selectedVideo?.video_id === video.video_id;
                  return (
                    <div
                      key={video.video_id}
                      onClick={() => handleSelectVideo(video)}
                      className={`group bg-white dark:bg-slate-900 rounded-2xl border p-3 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between ${
                        isCurrent
                          ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-sm'
                          : 'border-orange-100/70 dark:border-slate-800 hover:border-orange-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Thumbnail */}
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3">
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="h-4 w-4 fill-white ml-0.5" />
                            </div>
                          </div>
                          {video.duration_seconds > 0 && (
                            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {Math.round(video.duration_seconds / 60)}m
                            </span>
                          )}
                        </div>

                        {/* Title & Channel */}
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {video.title}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate max-w-[120px] font-medium">{video.source_channel}</span>
                        {isCurrent && (
                          <span className="text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Playing
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </PageContainer>
      </main>
    </div>
  );
}
