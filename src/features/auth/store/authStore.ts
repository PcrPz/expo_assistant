// src/features/auth/store/authStore.ts

import { create } from 'zustand';
import type { User } from '../types/auth.types';

/**
 * State ของ Auth
 */
interface AuthState {
  user: User | null;              // ข้อมูล user ปัจจุบัน
  isAuthenticated: boolean;       // สถานะการ login
  isLoading: boolean;             // กำลังโหลดข้อมูล
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

/**
 * Zustand Store สำหรับ Authentication
 * ใช้สำหรับเก็บข้อมูล user และสถานะการ login
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  /**
   * เซ็ต user และสถานะการ login
   */
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    isLoading: false
  }),
  
  /**
   * เซ็ตสถานะกำลังโหลด
   */
  setLoading: (loading) => set({ isLoading: loading }),
  
  /**
   * ออกจากระบบ - ลบข้อมูล user และ token
   */
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ 
      user: null, 
      isAuthenticated: false,
      isLoading: false
    });
  },
}));