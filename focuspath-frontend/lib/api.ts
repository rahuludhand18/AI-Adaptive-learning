const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

// Cookie Helper Functions
export function getCookie(name: string): string | null {
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

export function setCookie(name: string, value: string, days?: number) {
  if (typeof window === 'undefined') return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

export function eraseCookie(name: string) {
  if (typeof window === 'undefined') return;
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
}

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, headers, ...restOptions } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Attach token if exists
  if (typeof window !== 'undefined') {
    const token = getCookie('accessToken') || localStorage.getItem('accessToken');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...restOptions,
  });

  // Handle 401 Unauthorized (exclude endpoints under /api/auth/ except for user profile)
  if (response.status === 401 && (!endpoint.startsWith('/api/auth/') || endpoint === '/api/auth/profile/')) {
    if (typeof window !== 'undefined') {
      const refreshToken = getCookie('refreshToken') || localStorage.getItem('refreshToken');
      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              const retryHeaders = {
                ...defaultHeaders,
                ...headers,
                'Authorization': `Bearer ${token}`,
              };
              return fetch(url, {
                headers: retryHeaders,
                ...restOptions,
              }).then((res) => {
                if (!res.ok) throw new Error('Retry failed');
                return res.json();
              });
            })
            .catch((err) => {
              throw err;
            });
        }

        isRefreshing = true;

        try {
          const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (!refreshRes.ok) {
            throw new Error('Refresh token expired');
          }

          const refreshData = await refreshRes.json();
          const newAccess = refreshData.access;
          const newRefresh = refreshData.refresh || refreshToken;

          // Save new tokens
          setCookie('accessToken', newAccess, 15);
          setCookie('refreshToken', newRefresh, 15);
          localStorage.setItem('accessToken', newAccess);
          localStorage.setItem('refreshToken', newRefresh);

          // Update Zustand store
          const { useAuthStore } = await import('@/store/authStore');
          const store = useAuthStore.getState();
          if (store.user) {
            store.setAuth(store.user, newAccess, newRefresh);
          }

          processQueue(null, newAccess);
          isRefreshing = false;

          // Retry original request
          const retryHeaders = {
            ...defaultHeaders,
            ...headers,
            'Authorization': `Bearer ${newAccess}`,
          };
          const retryRes = await fetch(url, {
            headers: retryHeaders,
            ...restOptions,
          });

          if (!retryRes.ok) {
            const errorData = await retryRes.json().catch(() => ({}));
            throw {
              status: retryRes.status,
              message: errorData.detail || 'Something went wrong',
              code: errorData.code || null,
            };
          }

          return retryRes.json();
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;

          // Clear credentials
          eraseCookie('accessToken');
          eraseCookie('refreshToken');
          eraseCookie('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          const { useAuthStore } = await import('@/store/authStore');
          useAuthStore.getState().logout();

          window.location.href = '/auth/login?notice=parent_required';
          throw {
            status: 401,
            message: 'Session expired. Please log in again.',
          };
        }
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      message: errorData.detail || 'Something went wrong',
      code: errorData.code || null,
    };
  }

  return response.json();
}
