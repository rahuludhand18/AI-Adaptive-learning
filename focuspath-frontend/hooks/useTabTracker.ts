import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { apiRequest } from '@/lib/api';

export function useTabTracker() {
  const { user, logout, updateUser } = useAuthStore();
  const router = useRouter();
  
  const [showWarning, setShowWarning] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Kid mode can be entered by both KID accounts AND adult/parent accounts
    // that switched profiles using the activeRole cookie. Check both.
    const isKidMode = user.role === 'KID' ||
      (typeof document !== 'undefined' && document.cookie.includes('activeRole=child'));
    
    if (!isKidMode) return; // tab-switch lockout applies to kid mode only

    const handleVisibilityChange = async () => {
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
            // Show custom modal instead of alert
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
