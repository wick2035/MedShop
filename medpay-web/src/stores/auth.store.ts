import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginResponse, UserInfoResponse } from '@/types/auth';

interface AuthState {
  user: UserInfoResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (loginResponse: LoginResponse) => void;
  setUser: (user: UserInfoResponse) => void;
  logout: () => void;
  getAccessToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (loginResponse: LoginResponse) => {
        set({
          user: loginResponse.user,
          accessToken: loginResponse.accessToken,
          refreshToken: loginResponse.refreshToken,
          isAuthenticated: true,
        });
      },

      setUser: (user: UserInfoResponse) => {
        set({ user });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('medpay_access_token');
        localStorage.removeItem('medpay_refresh_token');
        localStorage.removeItem('medpay_user');
      },

      getAccessToken: () => {
        return get().accessToken;
      },
    }),
    {
      name: 'medpay-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.accessToken !== null,
      }),
      storage: {
        getItem: (name) => {
          const accessToken = localStorage.getItem('medpay_access_token');
          const refreshToken = localStorage.getItem('medpay_refresh_token');
          const userRaw = localStorage.getItem('medpay_user');
          const user = userRaw ? JSON.parse(userRaw) as UserInfoResponse : null;

          return {
            state: {
              user,
              accessToken,
              refreshToken,
              isAuthenticated: accessToken !== null,
            },
            version: 0,
          };
        },
        setItem: (_name, value) => {
          const { state } = value as { state: Pick<AuthState, 'user' | 'accessToken' | 'refreshToken'> };
          if (state.accessToken) {
            localStorage.setItem('medpay_access_token', state.accessToken);
          } else {
            localStorage.removeItem('medpay_access_token');
          }
          if (state.refreshToken) {
            localStorage.setItem('medpay_refresh_token', state.refreshToken);
          } else {
            localStorage.removeItem('medpay_refresh_token');
          }
          if (state.user) {
            localStorage.setItem('medpay_user', JSON.stringify(state.user));
          } else {
            localStorage.removeItem('medpay_user');
          }
        },
        removeItem: (_name) => {
          localStorage.removeItem('medpay_access_token');
          localStorage.removeItem('medpay_refresh_token');
          localStorage.removeItem('medpay_user');
        },
      },
    },
  ),
);
