// src/features/auth/hooks/useAuth.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { getUserDetail } from '../api/authApi';
import { tokenManager } from '@/src/lib/auth/tokenManager';

export function useAuth() {
  const { user, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    async function loadUser() {
      console.log('useAuth - Loading user...');
      
      // ✅ เช็ค token จาก tokenManager
      const token = tokenManager.getAccessToken();
      
      if (!token) {
        console.log('useAuth - No token found');
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('useAuth - Token found, checking user data...');

      // ถ้ามี token แต่ยังไม่มี user → load user
      if (!user) {
        try {
          console.log('useAuth - Fetching user details...');
          const userData = await getUserDetail();
          setUser(userData);
          console.log('useAuth - User loaded:', userData.Firstname, userData.Lastname);
        } catch (error) {
          console.error('useAuth - Failed to load user:', error);
          tokenManager.clearTokens();
          setUser(null);
        }
      } else {
        console.log('useAuth - User already loaded:', user.Firstname);
      }
      
      setLoading(false);
    }

    loadUser();
  }, [user, setUser, setLoading]);

  return { 
    user, 
    isLoading: useAuthStore((state) => state.isLoading),
    isAuthenticated: !!user && !!tokenManager.getAccessToken(),
  };
}

export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      console.log('useRequireAuth - Still loading...');
      return;
    }

    const hasToken = tokenManager.getAccessToken();
    
    console.log('useRequireAuth - Check:', { 
      hasUser: !!user, 
      hasToken: !!hasToken 
    });
    
    if (!user || !hasToken) {
      console.log('❌ Not authenticated, redirecting to /login');
      router.push('/login');
    } else {
      console.log('✅ Authenticated, user:', user.Firstname);
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}