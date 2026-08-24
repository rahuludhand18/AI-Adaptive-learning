import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { apiRequest } from '@/lib/api';

export function useTabTracker() {
  const { user, logout, updateUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'KID') return; // tab-switch lockout applies to children only

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden') {
        // log the exact moment they left, so a parent can see when + how long (paired with RETURN below)
        apiRequest('/api/focus/tab-event/', { method: 'POST', body: JSON.stringify({ event_type: 'LEFT' }) }).catch(() => {});
        try {
          const res = await apiRequest('/api/focus/tab-switch/', {
            method: 'POST',
          });

          if (res.tab_switch_count) {
            updateUser({ tab_switch_count: res.tab_switch_count });
          }
        } catch (err: any) {
          if (err.status === 403 && err.code === 'account_locked') {
            updateUser({ is_locked: true, tab_switch_count: 3 });
            logout();
            router.push('/auth/login?locked=true');
          }
        }
      } else if (document.visibilityState === 'visible') {
        apiRequest('/api/focus/tab-event/', { method: 'POST', body: JSON.stringify({ event_type: 'RETURN' }) }).catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, logout, updateUser, router]);
}
