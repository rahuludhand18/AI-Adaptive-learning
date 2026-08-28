'use client';

import { use, useEffect } from 'react';
import useSWR from 'swr';
import ParentLayout from '@/components/layout/ParentLayout';
import { apiRequest } from '@/lib/api';
import { Clock, AlertTriangle, MonitorPlay, Activity } from 'lucide-react';

const fetcher = (url: string) => apiRequest<any>(url);

const formatScreenTime = (seconds: number) => {
  if (!seconds) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const formatTime = (iso: string) => {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getTimelineIcon = (action: string) => {
  switch (action) {
    case 'LOGIN': return '🟢';
    case 'LOGOUT': return '🔴';
    case 'MODULE_STARTED': return '📖';
    case 'VIDEO_WATCHED': return '📺';
    case 'TAB_SWITCH': return '⚠️';
    case 'QUEST_COMPLETED': return '🏆';
    default: return '📝';
  }
};

const getTimelineMessage = (log: any) => {
  switch (log.action_type) {
    case 'LOGIN': return 'Logged In';
    case 'LOGOUT': return 'Logged Out';
    case 'MODULE_STARTED': return `Started ${log.metadata?.module || 'Module'}`;
    case 'VIDEO_WATCHED': return `Watched: ${log.metadata?.video_title || 'Video'}`;
    case 'TAB_SWITCH': return 'Warning: Switched away from study tab';
    case 'QUEST_COMPLETED': return 'Completed a learning quest!';
    default: return log.action_type;
  }
};

export default function LiveAnalyticsPage({ params }: { params: Promise<{ child_id: string }> }) {
  const unwrappedParams = use(params);
  const childId = unwrappedParams.child_id;

  const { data, error, isLoading } = useSWR(
    childId ? `/api/analytics/parent/${childId}/` : null,
    fetcher,
    { refreshInterval: 5000 } // Poll every 5 seconds
  );

  return (
    <ParentLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Live Analytics Engine</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className={`w-2 h-2 rounded-full ${data?.current_status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {data?.current_status || 'Checking status...'}
              </span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Real-time surveillance of your child&apos;s activity.
          </p>
        </div>

        {/* Top Row: Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Total Screen Time */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Screen Time</p>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {formatScreenTime(data?.total_screen_time_seconds || 0)}
              </div>
            </div>
          </div>

          {/* Distractions / Tab Switches */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Distractions</p>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {data?.tab_switch_count_today || 0}
                <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 ml-1">attempts</span>
              </div>
            </div>
          </div>

          {/* Videos Completed */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <MonitorPlay className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Videos Watched</p>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {data?.videos_watched_today || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Activity Feed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Live Activity Feed</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Chronological timeline of today&apos;s events</p>
            </div>
          </div>

          <div className="relative flex-1 pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-8">
            {isLoading && !data && (
              <div className="text-sm text-slate-500 font-medium ml-4">Loading timeline...</div>
            )}
            
            {data?.live_timeline?.length === 0 && (
              <div className="text-sm text-slate-500 font-medium ml-4">No activity logged today yet.</div>
            )}
            
            {data?.live_timeline?.map((log: any) => (
              <div key={log.id} className="relative">
                <div className="absolute -left-[25px] flex items-center justify-center w-6 h-6 bg-white dark:bg-slate-900 rounded-full text-sm shadow-xs border border-slate-200 dark:border-slate-700">
                  {getTimelineIcon(log.action_type)}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 ml-4">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 shrink-0">
                    {formatTime(log.timestamp)}
                  </span>
                  <span className={`text-sm font-semibold ${log.action_type === 'TAB_SWITCH' ? 'text-amber-600 dark:text-amber-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    {getTimelineMessage(log)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ParentLayout>
  );
}
