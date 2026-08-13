'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ParentLayout from '@/components/layout/ParentLayout';
import { apiRequest } from '@/lib/api';
import {
  Lock,
  User,
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  ArrowRight,
  Tv,
  X,
  Loader2,
} from 'lucide-react';

// Shape of a pending approval coming from /api/parents/approvals/
interface ApprovalRequest {
  id: number;
  child: { id: number; username: string; email?: string; role?: string };
  reason: string;
  status: string;
  created_at: string;
}

// "2 minutes ago" style relative time from an ISO timestamp
function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AccessRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  // load pending approvals for this parent on mount
  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest<ApprovalRequest[]>('/api/parents/approvals/');
      setRequests(data);
    } catch {
      setError('Could not load access requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // resolve a request via the backend, then drop it from the list
  async function resolve(id: number, action: 'APPROVED' | 'REJECTED', duration: number, msg: string) {
    setResolvingId(id);
    setError('');
    try {
      await apiRequest(`/api/parents/approvals/${id}/resolve/`, {
        method: 'POST',
        body: JSON.stringify({ action, duration }),
      });
      setActionSuccess(msg);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError('Could not resolve the request. Please try again.');
    } finally {
      setResolvingId(null);
    }
  }

  const active = requests[0]; // show the most recent pending request
  const busy = resolvingId !== null;

  return (
    <ParentLayout pendingRequestsCount={requests.length}>
      <div className="space-y-6">

        {/* Header Security Notification */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Lock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>SECURITY NOTIFICATION</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Access Request
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-3xl">
            A child user is requesting access after being locked. Review the details below to make an informed decision.
          </p>
        </div>

        {actionSuccess && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-12 gap-6">

          {/* Left Column: Request Details (Col 8) */}
          <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-8 shadow-2xs space-y-6">

            {loading ? (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold text-sm py-8 justify-center">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading requests…
              </div>
            ) : !active ? (
              /* Empty state — no pending requests */
              <div className="flex flex-col items-center justify-center text-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">All clear!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-xs">
                  There are no pending access requests from your children right now.
                </p>
              </div>
            ) : (
              <>
                {/* User Request Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {active.child?.username || 'Child'}&apos;s Request
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                        {timeAgo(active.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800/50">
                    Locked
                  </span>
                </div>

                {/* Reason Banner */}
                <div className="bg-blue-50/60 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4">
                  <div className="relative w-16 h-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    <div className="bg-rose-600 text-white p-2 rounded-lg flex items-center justify-center">
                      <Tv className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 ring-2 ring-white dark:ring-slate-800">
                      <X className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      {active.child?.username || 'Your child'} needs your approval
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Reason: <span className="font-semibold text-slate-800 dark:text-slate-200">{active.reason}</span>
                    </p>
                  </div>
                </div>

                {/* Action Required Section */}
                <div className="space-y-4 pt-2">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                    ACTION REQUIRED
                  </span>

                  {/* 3 Action Cards */}
                  <div className="grid grid-cols-3 gap-4">

                    {/* Option 1: Allow Always (unlock for the full day) */}
                    <button
                      disabled={busy}
                      onClick={() => resolve(active.id, 'APPROVED', 1440, `${active.child?.username || 'Child'} unlocked for the day.`)}
                      className="p-5 rounded-2xl border text-center space-y-3 transition-all cursor-pointer bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 text-slate-800 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-9 h-9 rounded-full mx-auto flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold">Allow (today)</h5>
                        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Unlock for the day</p>
                      </div>
                    </button>

                    {/* Option 2: Allow for 15 min */}
                    <button
                      disabled={busy}
                      onClick={() => resolve(active.id, 'APPROVED', 15, `${active.child?.username || 'Child'} unlocked for 15 minutes.`)}
                      className="p-5 rounded-2xl border text-center space-y-3 transition-all cursor-pointer bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 text-slate-800 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-9 h-9 rounded-full mx-auto flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {resolvingId === active.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Clock className="h-5 w-5" />}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold">Allow 15 min</h5>
                        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Auto-lock after</p>
                      </div>
                    </button>

                    {/* Option 3: Deny */}
                    <button
                      disabled={busy}
                      onClick={() => resolve(active.id, 'REJECTED', 120, `Request denied. ${active.child?.username || 'Child'} stays locked.`)}
                      className="p-5 rounded-2xl border text-center space-y-3 transition-all cursor-pointer bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-rose-300 text-slate-800 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-9 h-9 rounded-full mx-auto flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        <XCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold">Deny</h5>
                        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Keep blocked</p>
                      </div>
                    </button>

                  </div>

                  {requests.length > 1 && (
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                      +{requests.length - 1} more pending request{requests.length - 1 > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </>
            )}

          </div>

          {/* Right Column: Guidance (Col 4) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">

            {/* Pending count card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[32px] p-6 shadow-2xs space-y-4">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                PENDING REQUESTS
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{requests.length}</span>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">awaiting review</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Requests appear here when a child is locked out (for example, after repeated tab switches during study).
              </p>
            </div>

            {/* Security Advice Card */}
            <div className="relative bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-[32px] p-6 shadow-md shadow-indigo-600/20 space-y-4 overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
                <Shield className="w-36 h-36 text-white" />
              </div>
              <h3 className="text-base font-bold tracking-tight">Security Advice</h3>
              <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                Approve briefly (15 min) when unsure — the child re-locks automatically, keeping study time protected.
              </p>
              <button
                onClick={() => router.push('/parent/dashboard')}
                className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </ParentLayout>
  );
}
