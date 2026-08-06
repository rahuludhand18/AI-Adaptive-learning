'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ParentLayout from '@/components/layout/ParentLayout';
import {
  Lock,
  User,
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  ArrowRight,
  Tv,
  Check,
  X
} from 'lucide-react';

export default function AccessRequestsPage() {
  const router = useRouter();
  const [selectedAction, setSelectedAction] = useState<'always' | '15min' | 'deny'>('15min');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleAction = (action: 'always' | '15min' | 'deny') => {
    setSelectedAction(action);
    if (action === 'always') setActionSuccess('Access granted permanently to YouTube.');
    if (action === '15min') setActionSuccess('Access granted for 15 minutes. YouTube will auto-lock.');
    if (action === 'deny') setActionSuccess('Access request denied. YouTube remains blocked.');
  };

  return (
    <ParentLayout pendingRequestsCount={1}>
      <div className="space-y-6">
        
        {/* Header Security Notification */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Lock className="h-4 w-4 text-indigo-600" />
            <span>SECURITY NOTIFICATION</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Access Request
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-3xl">
            A child user is requesting temporary or permanent access to a restricted platform.
            Please review the details below to make an informed decision.
          </p>
        </div>

        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column: Request Details (Col 8) */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200/80 rounded-[32px] p-8 shadow-2xs space-y-6">
            
            {/* User Request Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Alex's Request</h3>
                  <p className="text-xs text-slate-400 font-semibold">
                    2 minutes ago via Samsung Tablet
                  </p>
                </div>
              </div>
              <span className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">
                Blocked
              </span>
            </div>

            {/* Middle Blocked App Banner */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 flex items-center gap-4">
              <div className="relative w-16 h-12 bg-white rounded-xl border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                <div className="bg-rose-600 text-white p-2 rounded-lg flex items-center justify-center">
                  <Tv className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 ring-2 ring-white">
                  <X className="h-3 w-3" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-slate-900">
                  Alex tried to open: YouTube
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  Reason for block: <span className="font-semibold text-slate-800">Entertainment category restricted during study hours.</span>
                </p>
              </div>
            </div>

            {/* Action Required Section */}
            <div className="space-y-4 pt-2">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                ACTION REQUIRED
              </span>

              {/* 3 Action Cards */}
              <div className="grid grid-cols-3 gap-4">
                
                {/* Option 1: Allow Always */}
                <button
                  onClick={() => handleAction('always')}
                  className={`p-5 rounded-2xl border text-center space-y-3 transition-all cursor-pointer ${
                    selectedAction === 'always'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-white border-slate-200 hover:border-indigo-200 text-slate-800'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full mx-auto flex items-center justify-center ${
                      selectedAction === 'always'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">Allow always</h5>
                    <p
                      className={`text-[10px] font-medium ${
                        selectedAction === 'always' ? 'text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      Remove restriction
                    </p>
                  </div>
                </button>

                {/* Option 2: Allow for 15 min */}
                <button
                  onClick={() => handleAction('15min')}
                  className={`p-5 rounded-2xl border text-center space-y-3 transition-all cursor-pointer ${
                    selectedAction === '15min'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-white border-slate-200 hover:border-indigo-200 text-slate-800'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full mx-auto flex items-center justify-center ${
                      selectedAction === '15min'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">Allow for 15 min</h5>
                    <p
                      className={`text-[10px] font-medium ${
                        selectedAction === '15min' ? 'text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      Auto-lock after
                    </p>
                  </div>
                </button>

                {/* Option 3: Deny */}
                <button
                  onClick={() => handleAction('deny')}
                  className={`p-5 rounded-2xl border text-center space-y-3 transition-all cursor-pointer ${
                    selectedAction === 'deny'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-white border-slate-200 hover:border-indigo-200 text-slate-800'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full mx-auto flex items-center justify-center ${
                      selectedAction === 'deny'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">Deny</h5>
                    <p
                      className={`text-[10px] font-medium ${
                        selectedAction === 'deny' ? 'text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      Keep blocked
                    </p>
                  </div>
                </button>

              </div>
            </div>

          </div>

          {/* Right Column: Daily Usage & Security Advice (Col 4) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Daily Usage Card */}
            <div className="bg-white border border-slate-200/80 rounded-[32px] p-6 shadow-2xs space-y-4">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                ALEX'S DAILY USAGE
              </span>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-600">2h 14m</span>
                <span className="text-xs font-bold text-slate-400">~12%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-indigo-600 w-[78%]" />
                <div className="h-full bg-amber-700 w-[22%]" />
              </div>

              {/* Breakdown List */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    <span className="text-slate-700">Education</span>
                  </div>
                  <span className="font-bold text-slate-900">1h 45m</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-700"></span>
                    <span className="text-slate-700">Entertainment</span>
                  </div>
                  <span className="font-bold text-slate-900">29m</span>
                </div>
              </div>
            </div>

            {/* Security Advice Card */}
            <div className="relative bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-[32px] p-6 shadow-md shadow-indigo-600/20 space-y-4 overflow-hidden">
              {/* Subtle background shield graphic */}
              <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
                <Shield className="w-36 h-36 text-white" />
              </div>

              <h3 className="text-base font-bold tracking-tight">Security Advice</h3>
              <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                Alex has already reached the daily 30-minute limit for Entertainment apps.
              </p>

              <button
                onClick={() => router.push('/parent/dashboard')}
                className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>View Study Plan</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </ParentLayout>
  );
}
