'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { apiRequest } from '@/lib/api';
import {
  Brain,
  ShieldAlert,
  UserPlus,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  Settings
} from 'lucide-react';

interface ApprovalRequest {
  id: number;
  child: {
    id: number;
    username: string;
    is_locked: boolean;
  };
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export default function ParentDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [newKidUsername, setNewKidUsername] = useState('');
  const [newKidPassword, setNewKidPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadParentData();
  }, [user]);

  const loadParentData = async () => {
    try {
      const pendingRequests = await apiRequest('/api/parents/approvals/');
      setRequests(pendingRequests);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveRequest = async (id: number, action: 'APPROVED' | 'REJECTED') => {
    try {
      await apiRequest(`/api/parents/approvals/${id}/resolve/`, {
        method: 'POST',
        body: JSON.stringify({ action, duration: 120 }), // Default to 2 hours
      });
      loadParentData();
      setSuccess(`Successfully resolved request as ${action}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddKid = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await apiRequest('/api/parents/kids/', {
        method: 'POST',
        body: JSON.stringify({
          username: newKidUsername,
          password: newKidPassword,
        }),
      });

      setNewKidUsername('');
      setNewKidPassword('');
      setSuccess(`Kid account "${newKidUsername}" created successfully and linked to you!`);
      loadParentData();
    } catch (err: any) {
      setError(err.message || 'Failed to create kid profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        
        {/* Parent Header */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center">
              <img
                src="/focuspath_logo.png"
                alt="FocusPath Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Parent Dashboard</h1>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                Manage your children's access, schedules, and restrictions
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/auth/login');
            }}
            className="flex items-center gap-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 rounded-full py-2.5 px-5 font-semibold text-sm transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* Message alerts */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-medium">
            {success}
          </div>
        )}

        {/* 12-Column Grid */}
        <div className="grid grid-cols-12 gap-5">
          
          {/* List of outstanding login request approvals (Col span 7) */}
          <div className="col-span-12 lg:col-span-7 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm space-y-6 min-h-[300px]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-800">Pending Login Approvals</h3>
            </div>
            
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center text-xs font-semibold text-slate-400 py-12">
                  No pending lockout requests. All child accounts are in good standing!
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center justify-between hover:border-indigo-100 transition-all duration-300">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{req.child.username}</span>
                        <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100/50 py-0.5 px-2 rounded-full">
                          LOCKED
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{req.reason}</p>
                      <div className="text-[9px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Requested: {new Date(req.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleResolveRequest(req.id, 'REJECTED')}
                        className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                        title="Reject Request"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleResolveRequest(req.id, 'APPROVED')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl flex items-center gap-1 text-xs font-bold shadow-sm cursor-pointer transition-colors"
                        title="Approve Login (2 Hrs)"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Grant Access
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add a Child Account Bento Box (Col span 5) */}
          <div className="col-span-12 lg:col-span-5 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-800">Add Child Profile</h3>
              </div>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Create a restricted student account for your child. They will follow study quests and gamification rules.
              </p>
              
              <form onSubmit={handleAddKid} className="space-y-3 pt-2">
                <input
                  type="text"
                  placeholder="Child Username"
                  value={newKidUsername}
                  onChange={(e) => setNewKidUsername(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 py-3 px-4 text-xs font-medium outline-none focus:border-indigo-600/40 focus:ring-1 focus:ring-indigo-600/20 bg-slate-50/20"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newKidPassword}
                  onChange={(e) => setNewKidPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 py-3 px-4 text-xs font-medium outline-none focus:border-indigo-600/40 focus:ring-1 focus:ring-indigo-600/20 bg-slate-50/20"
                  required
                />
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-5 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
                >
                  <UserPlus className="h-4 w-4" />
                  {loading ? 'Creating...' : 'Register Child'}
                </button>
              </form>
            </div>
            
            <div className="border-t border-slate-100 pt-4 flex items-center gap-2 text-xs text-slate-500 font-semibold">
              <Users className="h-4 w-4 text-slate-400" />
              <span>Children accounts automatically synchronized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
