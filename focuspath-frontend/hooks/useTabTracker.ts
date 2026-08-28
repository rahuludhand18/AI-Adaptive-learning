import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { apiRequest } from '@/lib/api';

// This hook is mounted from two places at once on every kid page (the route layout AND the
// per-page KidLayout wrapper), so a single real tab-switch would otherwise fire every side
// effect below twice (double-counted lockout, duplicate parent-facing activity log rows).
// Dedupe by timestamp so only the first instance's handler actually does anything per event.
let lastVisibilityFiredAt = 0;
function claimVisibilityEvent(): boolean {
  const now = Date.now();
  if (now - lastVisibilityFiredAt < 300) return false;
  lastVisibilityFiredAt = now;
  return true;
}

export function useTabTracker() {
  const { user, logout, updateUser } = useAuthStore();
  const router = useRouter();
  
  const [showWarning, setShowWarning] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // Sync local state from the shared auth store
  useEffect(() => {
    if (user) {
      setTabSwitchCount(user.tab_switch_count ?? 0);
      setIsLockedOut(Boolean(user.is_locked));
    }
  }, [user?.tab_switch_count, user?.is_locked]);

  useEffect(() => {
    if (!user) return;

    // Tab-switch lockout applies ONLY to a real KID account that has entered via the
    // child profile selector (activeRole=child cookie). A parent browsing /kid/* pages,
    // or a stale cookie left over from a previous child session, must NOT trigger the lockout.
    const isKidMode = user.role === 'KID' &&
      (typeof document !== 'undefined' && document.cookie.includes('activeRole=child'));

    if (!isKidMode) return;

    const handleVisibilityChange = async () => {
      // this hook is mounted twice per page — only the first instance to see a given
      // transition actually acts on it, so nothing gets logged or counted twice
      if (!claimVisibilityEvent()) return;

      if (document.visibilityState === 'hidden') {
        const allowedSite = sessionStorage.getItem('allowed_website_visit');
        if (allowedSite) {
          apiRequest('/api/focus/tab-event/', { method: 'POST', body: JSON.stringify({ event_type: 'LEFT', note: `Visited allowed site: ${allowedSite}` }) }).catch(() => {});
          return;
        }
        // Just log the departure timestamp
        apiRequest('/api/focus/tab-event/', { method: 'POST', body: JSON.stringify({ event_type: 'LEFT' }) }).catch(() => {});

      } else if (document.visibilityState === 'visible') {
        const allowedSite = sessionStorage.getItem('allowed_website_visit');
        if (allowedSite) {
          sessionStorage.removeItem('allowed_website_visit');
          apiRequest('/api/focus/tab-event/', { method: 'POST', body: JSON.stringify({ event_type: 'RETURN', note: `Returned from allowed site: ${allowedSite}` }) }).catch(() => {});
          return;
        }

        // UNAUTHORIZED RETURN - Apply Penalty Here!
        apiRequest('/api/focus/tab-event/', { method: 'POST', body: JSON.stringify({ event_type: 'RETURN' }) }).catch(() => {});
        
        try {
          const res = await apiRequest('/api/focus/tab-switch/', {
            method: 'POST',
          });

          if (res.tab_switch_count) {
            updateUser({ tab_switch_count: res.tab_switch_count });
            setTabSwitchCount(res.tab_switch_count);
            setShowWarning(true);
          }
        } catch (err: any) {
          if (err.status === 403 && err.code === 'account_locked') {
            updateUser({ is_locked: true, tab_switch_count: 3 });
            setTabSwitchCount(3);
            setIsLockedOut(true);
            
            // Auto logout after showing the red screen for 5 seconds
            setTimeout(() => {
              logout();
              router.push('/auth/login?locked=true');
            }, 5000);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, logout, updateUser, router]);

  return { showWarning, setShowWarning, isLockedOut, setIsLockedOut, tabSwitchCount };
}
