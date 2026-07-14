import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Admin } from '@/types';

interface AuthState {
  admin: Admin | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (admin: Admin, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      admin: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (admin, accessToken) => set({ admin, accessToken, isAuthenticated: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ admin: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'cd-admin-auth',
      partialize: (state) => ({ admin: state.admin, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
    }
  )
);
