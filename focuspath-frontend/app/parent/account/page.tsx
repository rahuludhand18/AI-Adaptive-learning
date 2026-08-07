'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ParentLayout from '@/components/layout/ParentLayout';
import { useAuthStore } from '@/store/authStore';
import { apiRequest } from '@/lib/api';
import {
  User,
  UserPlus,
  Shield,
  Key,
  CheckCircle,
  Users,
  Settings,
  Lock
} from 'lucide-react';

export default function ParentAccountPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [newKidUsername, setNewKidUsername] = useState('');
  const [newKidPassword, setNewKidPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [kids, setKids] = useState<any[]>([]);

  const fetchKids = async () => {
    try {
      const data = await apiRequest('/api/parents/kids/');
      setKids(data);
    } catch (err: any) {
      console.error('Failed to fetch kids:', err);
    }
  };

  useEffect(() => {
    fetchKids();
  }, []);

  const handleAddKid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKidUsername.trim() || !newKidPassword.trim()) return;

    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const newKid = await apiRequest('/api/parents/kids/', {
        method: 'POST',
        body: JSON.stringify({
          username: newKidUsername.trim(),
          password: newKidPassword.trim(),
        }),
      });
      setSuccess(`Child account "${newKid.username}" created and linked to your Parent account.`);
      setNewKidUsername('');
      setNewKidPassword('');
      fetchKids();
    } catch (err: any) {
      setError(err.message || 'Failed to create child profile. Username might be already taken or password does not meet security requirements.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParentLayout pendingRequestsCount={1}>
      <div className="space-y-6">
        
        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Account & Child Profiles
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage your parent profile, credentials, and registered child devices.
          </p>
        </div>

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess(null)} className="text-emerald-700 font-bold cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-rose-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-700 font-bold cursor-pointer">
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          
          {/* Parent Profile Card (Col 6) */}
          <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200/80 rounded-[32px] p-8 shadow-2xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'P'}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{user?.username || 'Parent Profile'}</h3>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  Primary Guardian
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs py-2">
                <span className="font-semibold text-slate-500">Role Authority</span>
                <span className="font-bold text-slate-900">PARENT</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2">
                <span className="font-semibold text-slate-500">Protection Status</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-2">
                <span className="font-semibold text-slate-500">Linked Children</span>
                <span className="font-bold text-slate-900">{kids.length} Student Profiles</span>
              </div>
            </div>
          </div>

          {/* Add Child Profile Bento Box (Col 6) */}
          <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200/80 rounded-[32px] p-8 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 text-indigo-600">
              <UserPlus className="h-5 w-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Add Child Profile</h3>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Create a managed student profile for your child. They will receive automated eye break reminders and category restrictions.
            </p>

            <form onSubmit={handleAddKid} className="space-y-3 pt-1">
              <input
                type="text"
                placeholder="Child Username (e.g. Alex)"
                value={newKidUsername}
                onChange={(e) => setNewKidUsername(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 py-3 px-4 text-xs font-medium outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 bg-slate-50/40"
                required
              />
              <input
                type="password"
                placeholder="Create Password"
                value={newKidPassword}
                onChange={(e) => setNewKidPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 py-3 px-4 text-xs font-medium outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 bg-slate-50/40"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" />
                {loading ? 'Creating Profile...' : 'Register Child Profile'}
              </button>
            </form>
          </div>

          {/* Linked Child Accounts Table (Col 12) */}
          <div className="col-span-12 bg-white border border-slate-200/80 rounded-[32px] p-8 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <Users className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-bold">Managed Child Accounts</h3>
              </div>
            </div>

            <div className="space-y-3">
              {kids.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold bg-slate-50/40 border border-slate-100/50 rounded-2xl">
                  No managed child accounts yet. Create one above to get started.
                </div>
              ) : (
                kids.map((kid) => (
                  <div
                    key={kid.id}
                    className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                        {kid.username ? kid.username.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{kid.username}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Device: Managed Device
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        kid.is_locked
                          ? 'bg-rose-50 text-rose-700 border-rose-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {kid.is_locked ? 'Locked' : 'Active'}
                      </span>
                      <button
                        onClick={() => router.push('/parent/restrictions')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 p-2 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        Configure Restrictions →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </ParentLayout>
  );
}
