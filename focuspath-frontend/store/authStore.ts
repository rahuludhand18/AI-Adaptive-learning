import { create } from 'zustand';
import { apiRequest } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADULT' | 'PARENT' | 'KID';
  age_group?: '1-3' | '4-6' | '7-8' | '9-10' | '11-12' | null;
  grade_level?: string | null;
  grade?: string | null;
  profile?: {
    grade_level?: string | null;
    grade?: string | null;
  };
  is_locked: boolean;
  tab_switch_count: number;
  temporary_session_until: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Cookie Helper Functions
function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function setCookie(name: string, value: string, days?: number) {
  if (typeof window === 'undefined') return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

function eraseCookie(name: string) {
  if (typeof window === 'undefined') return;
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
}

const getInitialState = () => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
    };
  }

  const accessToken = getCookie('accessToken') || localStorage.getItem('accessToken');
  const refreshToken = getCookie('refreshToken') || localStorage.getItem('refreshToken');
  const userStr = getCookie('user');
  let user = null;

  if (userStr) {
    try {
      user = JSON.parse(decodeURIComponent(userStr));
    } catch (e) {
      console.error('Failed to parse user cookie:', e);
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const initialState = getInitialState();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialState.user,
  accessToken: initialState.accessToken,
  refreshToken: initialState.refreshToken,
  setAuth: (user, accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      setCookie('accessToken', accessToken, 15);
      setCookie('refreshToken', refreshToken, 15);
      setCookie('user', encodeURIComponent(JSON.stringify(user)), 15);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
    set({ user, accessToken, refreshToken });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      // best-effort log so a parent can see when this session ended (fire before the token is erased)
      apiRequest('/api/auth/logout/', { method: 'POST' }).catch(() => {});
      eraseCookie('accessToken');
      eraseCookie('refreshToken');
      eraseCookie('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    set({ user: null, accessToken: null, refreshToken: null });
  },
  updateUser: (updates) => {
    set((state) => {
      const newUser = state.user ? { ...state.user, ...updates } : null;
      if (newUser && typeof window !== 'undefined') {
        setCookie('user', encodeURIComponent(JSON.stringify(newUser)), 15);
      }
      return { user: newUser };
    });
  },
}));
