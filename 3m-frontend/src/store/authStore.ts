import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IUser } from '../types';
import { api } from '../services/api';


interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setUser: (user: IUser | null) => void;
  setLoading: (loading: boolean) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAuthModalOpen: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      openAuthModal: () => set({ isAuthModalOpen: true }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),
      
      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null, isAuthenticated: false, isLoading: false });
          localStorage.removeItem('azb-auth-storage');
        }
      },
    }),
    {
      name: 'azb-auth-storage', 
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);


if (typeof window !== 'undefined') {
  window.addEventListener('auth:unauthorized', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
    localStorage.removeItem('azb-auth-storage');
  });
}
