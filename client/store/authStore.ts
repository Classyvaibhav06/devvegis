import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  isEmailVerified: boolean;
  wallet?: { balance: number };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

// ── Cookie helpers (SameSite=Strict; Secure in production) ───────────────────
// The Edge middleware reads this cookie to perform server-side route protection
// before the SPA bundle is downloaded by the browser.

function setAuthCookie(token: string): void {
  if (typeof document === 'undefined') return;
  const isSecure = window.location.protocol === 'https:';
  const maxAgeSeconds = 15 * 60; // 15 minutes — matches JWT access token TTL
  const secure = isSecure ? '; Secure' : '';
  document.cookie = `accessToken=${token}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Strict${secure}`;
}

function clearAuthCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = 'accessToken=; Path=/; Max-Age=0; SameSite=Strict';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) => {
        localStorage.setItem('accessToken', accessToken);
        setAuthCookie(accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      updateUser: (updates) => set(state => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
      logout: () => {
        localStorage.removeItem('accessToken');
        clearAuthCookie();
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'devvegis-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

