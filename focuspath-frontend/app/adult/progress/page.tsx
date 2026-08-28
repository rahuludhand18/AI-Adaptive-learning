'use client';

import { useEffect, useState } from 'react';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { listTasks, updateTask, Task } from '@/lib/plannerApi';
import { CheckCircle2, RotateCcw, Loader2, Clock, X } from 'lucide-react';

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
function fmtDayHeading(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}
// value for a <input type="datetime-local">
function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdultProgressPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [reschedId, setReschedId] = useState<number | null>(null);
  const [reschedVal, setReschedVal] = useState('');

  const load = async () => {
    try {
      const t = await listTasks();
      setTasks(t.filter((x) => x.status !== 'ARCHIVED'));
    } catch {
      // leave empty on error
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const setStatus = async (t: Task, status: 'COMPLETED' | 'ACTIVE') => {
    setBusyId(t.id);
    try {
      await updateTask(t.id, { status });
      await load();
    } catch {
      // ignore
    } finally {
      setBusyId(null);
    }
  };

  const doReschedule = async (t: Task) => {
    const newStart = new Date(reschedVal);
    if (isNaN(newStart.getTime())) return;
    const dur = new Date(t.end_time).getTime() - new Date(t.start_time).getTime();
    const newEnd = new Date(newStart.getTime() + dur);
    setBusyId(t.id);
    try {
      await updateTask(t.id, {
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString(),
        status: 'UPDATED',
      });
      setReschedId(null);
      await load();
    } catch {
      // ignore
    } finally {
      setBusyId(null);
    }
  };

  // group by calendar day, chronologically
  const sorted = [...tasks].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
  );
  const groups: Record<string, Task[]> = {};
  sorted.forEach((t) => {
    const k = new Date(t.start_time).toDateString();
    (groups[k] = groups[k] || []).push(t);
  });

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-100 relative overflow-hidden flex flex-col font-sans antialiased text-textPrimary dark:text-slate-100 transition-colors">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-300/20 blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-300/20 blur-[100px] rounded-full pointer-events-none z-0" />

      <div className="z-10 w-full relative">
        <TopNav />
        <PageContainer>
        {/* Header + overall progress */}
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Study Progress</h1>
            <p className="text-sm text-textSecondary dark:text-slate-400">
              Mark each block done or pending. Missed a block? Reschedule it for when you want.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-border dark:border-slate-800 shadow-card space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-textSecondary dark:text-slate-400">{done} / {total} completed</span>
              <span className="text-indigo dark:text-indigo-400">{pct}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-textSecondary dark:text-slate-400 font-semibold py-16 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading your plan…
          </div>
        ) : total === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-border dark:border-slate-800 shadow-card text-center space-y-2">
            <h3 className="text-lg font-bold">No study plan yet</h3>
            <p className="text-xs text-textSecondary dark:text-slate-400">
              Create a timetable from the onboarding page, then track it here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groups).map(([day, dayTasks]) => (
              <div key={day} className="space-y-3">
                <h3 className="text-sm font-extrabold text-textSecondary dark:text-slate-400 uppercase tracking-wider">
                  {fmtDayHeading(dayTasks[0].start_time)}
                </h3>

                {dayTasks.map((t) => {
                  const isDone = t.status === 'COMPLETED';
                  const isBusy = busyId === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`rounded-2xl p-4 border shadow-sm ${
                        isDone
                          ? 'bg-indigo-light/40 dark:bg-indigo-950/30 border-indigo-light dark:border-indigo-900/30'
                          : 'bg-white dark:bg-slate-900 border-border dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-textSecondary dark:text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{fmtTime(t.start_time)} – {fmtTime(t.end_time)}</span>
                            {t.status === 'UPDATED' && (
                              <span className="text-[9px] font-extrabold bg-teal text-white px-1.5 py-0.5 rounded uppercase">Rescheduled</span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold truncate">{t.title}</h4>
                          {t.description && (
                            <p className="text-[11px] text-textSecondary dark:text-slate-400 truncate">{t.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isBusy ? (
                            <Loader2 className="w-4 h-4 animate-spin text-textSecondary" />
                          ) : isDone ? (
                            <button
                              onClick={() => setStatus(t, 'ACTIVE')}
                              className="text-[11px] font-bold text-textSecondary dark:text-slate-400 hover:text-textPrimary dark:hover:text-slate-100 py-2 px-3 rounded-xl cursor-pointer"
                            >
                              Mark pending
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => setStatus(t, 'COMPLETED')}
                                className="flex items-center gap-1.5 bg-indigo text-white text-[11px] font-bold py-2 px-3.5 rounded-xl hover:bg-indigo-dark transition-all cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Done
                              </button>
                              <button
                                onClick={() => {
                                  setReschedId(t.id);
                                  setReschedVal(toLocalInput(t.start_time));
                                }}
                                className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 text-textPrimary dark:text-slate-200 text-[11px] font-bold py-2 px-3 rounded-xl hover:border-indigo/40 transition-all cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Reschedule
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Inline reschedule picker */}
                      {reschedId === t.id && (
                        <div className="mt-3 pt-3 border-t border-border dark:border-slate-800 flex flex-wrap items-center gap-2">
                          <input
                            type="datetime-local"
                            value={reschedVal}
                            onChange={(e) => setReschedVal(e.target.value)}
                            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-xs text-textPrimary dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo"
                          />
                          <button
                            onClick={() => doReschedule(t)}
                            className="bg-indigo text-white text-[11px] font-bold py-2 px-4 rounded-xl hover:bg-indigo-dark cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setReschedId(null)}
                            className="text-textSecondary dark:text-slate-400 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </PageContainer>
      </div>
    </div>
  );
}
