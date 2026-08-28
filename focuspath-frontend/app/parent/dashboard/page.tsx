'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import ParentLayout from '@/components/layout/ParentLayout';
import { apiRequest } from '@/lib/api';
import {
  Clock,
  Eye,
  Star,
  BookOpen,
  Calculator,
  Globe,
  Shield,
  LogOut,
  AlertCircle,
  LogIn,
  Activity,
  AlertTriangle,
  MonitorPlay
} from 'lucide-react';

const fetcher = (url: string) => apiRequest<any>(url);

const formatScreenTime = (seconds: number) => {
  if (!seconds) return '0.0h';
  const h = seconds / 3600;
  return `${h.toFixed(1)}h`;
};

const formatScreenTimeHM = (seconds: number) => {
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
  let msg = '';
  switch (log.action_type) {
    case 'LOGIN': msg = 'Logged In'; break;
    case 'LOGOUT': msg = 'Logged Out'; break;
    case 'MODULE_STARTED': msg = `Started ${log.metadata?.module || 'Module'}`; break;
    case 'VIDEO_WATCHED': msg = `Watched: ${log.metadata?.video_title || 'Video'}`; break;
    case 'TAB_SWITCH': msg = 'Warning: Switched away from study tab'; break;
    case 'QUEST_COMPLETED': msg = 'Completed a learning quest!'; break;
    default: msg = log.action_type; break;
  }
  
  if (log.metadata?.child_name) {
    return `${log.metadata.child_name} - ${msg}`;
  }
  return msg;
};

export default function ParentDashboardPage() {
  const router = useRouter();

  // Multi-child state
  const [kids, setKids] = useState<{ id: number; username: string }[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [networkError, setNetworkError] = useState(false);
  
  useEffect(() => {
    apiRequest<{ id: number; username: string }[]>('/api/parents/kids/')
      .then((data) => {
        setKids(data);
        if (data.length > 0) {
          // If we want to default to the first kid instead of 'all', we could do it here
          // But 'all' is a great default for a summary
        }
      })
      .catch((err) => {
        if (err.status === 0) setNetworkError(true);
      });
  }, []);

  // Fetch Live Analytics
  const { data: analytics, isLoading, error: analyticsError } = useSWR(
    `/api/parent/analytics/${selectedChildId}/`,
    fetcher,
    { refreshInterval: 5000 }
  );

  if (networkError || analyticsError?.status === 0) {
    return (
      <ParentLayout pendingRequestsCount={1}>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-8 max-w-2xl w-full shadow-lg flex flex-col items-center text-center">
            
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-10 w-10 text-red-500" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Backend Connection Failed
              </h2>
            </div>
            
            <div className="font-mono text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full mb-6">
              Error Code: ERR_CONNECTION_REFUSED (Status 0)
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">
              Your Next.js frontend is running, but it cannot communicate with the Django backend. The server is either offline or encountering a fatal error.
            </p>

            <div className="w-full bg-slate-900 text-slate-300 p-5 rounded-xl text-sm font-mono mt-4 text-left space-y-2">
              <div className="text-slate-400 border-b border-slate-700 pb-2 mb-2 font-bold uppercase text-[10px] tracking-wider">
                Developer Troubleshooting Steps
              </div>
              <div>1. Check your Django terminal for a Python Traceback.</div>
              <div>2. Resolve any database lock or syntax errors causing the crash.</div>
              <div>3. Restart the server: <span className="text-emerald-400">python manage.py runserver</span></div>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold px-6 py-2 rounded-xl mt-6 transition-colors shadow-sm cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout pendingRequestsCount={1}>
      <div className="space-y-6">
        
        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Parent Dashboard</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className={`w-2 h-2 rounded-full ${analytics?.current_status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {analytics?.current_status || 'Checking status...'}
              </span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Monitoring your child's learning journey
          </p>
        </div>
        
        {/* Tab UI for Multi-Child Selection */}
        {kids.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {kids.map((kid) => (
              <button
                key={kid.id}
                onClick={() => {
                  setSelectedChildId(kid.id.toString());
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('activeChildId', kid.id.toString());
                  }
                }}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                  selectedChildId === kid.id.toString()
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {kid.username}
              </button>
            ))}
            <button
              onClick={() => setSelectedChildId('all')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                selectedChildId === 'all'
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              All Kids Summary
            </button>
          </div>
        )}

        {/* Row 1: Key Metrics */}
        <div className="grid grid-cols-12 gap-5">
          
          {/* Card 1: Study Time / Screen Time */}
          <div className="col-span-12 md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                 <Clock className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Today's Screen Time</p>
                 <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                   {formatScreenTimeHM(analytics?.total_screen_time_seconds || 0)}
                 </div>
               </div>
             </div>
          </div>

          {/* Card 2: Distractions */}
          <div className="col-span-12 md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                 <AlertTriangle className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Distractions</p>
                 <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                   {analytics?.tab_switch_count_today || 0}
                   <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 ml-1">attempts</span>
                 </div>
               </div>
             </div>
          </div>

          {/* Card 3: Videos Watched */}
          <div className="col-span-12 md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                 <MonitorPlay className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Videos Watched</p>
                 <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                   {analytics?.videos_watched_today || 0}
                 </div>
               </div>
             </div>
          </div>

        </div>

        {/* Live Activity Feed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Live Activity Feed</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Chronological timeline of today&apos;s events</p>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/parent/restrictions')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-full shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Shield className="h-3.5 w-3.5 fill-white/20" />
              <span>Manage Restrictions</span>
            </button>
          </div>

          <div className="relative flex-1 pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-8">
            {isLoading && !analytics && (
              <div className="text-sm text-slate-500 font-medium ml-4">Loading timeline...</div>
            )}
            
            {analytics?.live_timeline?.length === 0 && (
              <div className="text-sm text-slate-500 font-medium ml-4">No activity logged today yet.</div>
            )}
            
            {analytics?.live_timeline?.map((log: any) => (
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
