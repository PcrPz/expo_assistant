// src/features/auth/hooks/useAuth.ts
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'next/navigation';

/**
 * Hook สำหรับเช็คและโหลด user data
 */
export function useAuth() {
  const { user, isAuthenticated, setUser, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token && !user) {
        try {
          setLoading(true);
          
          // TODO: เรียก API เพื่อ verify token และดึง user data
          // const response = await getCurrentUser();
          // setUser(response.user);
          
          // ตอนนี้ใช้ mock data ก่อน
          const mockUser = {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user' as const,
          };
          setUser(mockUser);
          
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else if (!token) {
        setUser(null);
        setLoading(false);
      }
    };

    loadUser();
  }, [user, setUser, setLoading]);

  return { user, isAuthenticated };
}

/**
 * Hook สำหรับป้องกันหน้าที่ต้อง Login
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}