// src/features/auth/store/authStore.ts
import { create } from 'zustand';
import { User } from '../types/auth.types';
import { getUserDetail } from '../api/authApi';
import { tokenManager } from '@/src/lib/auth/tokenManager';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    console.log('📝 authStore.setUser:', user);
    set({ 
      user, 
      isAuthenticated: !!user,
      isLoading: false 
    });
  },

  setLoading: (loading) => {
    console.log('⏳ authStore.setLoading:', loading);
    set({ isLoading: loading });
  },

  logout: () => {
    console.log('🚪 authStore.logout - Clearing user data');
    tokenManager.clearTokens();
    set({ 
      user: null, 
      isAuthenticated: false,
      isLoading: false 
    });
  },

  refreshUser: async () => {
    console.log('🔄 authStore.refreshUser - Reloading user data');
    try {
      const userData = await getUserDetail();
      console.log('✅ authStore.refreshUser - Success:', userData);
      set({ 
        user: userData, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      console.error('❌ authStore.refreshUser - Failed:', error);
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      });
    }
  },
}));