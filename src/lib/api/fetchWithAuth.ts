// src/lib/api/fetchWithAuth.ts

import { tokenManager } from '@/src/lib/auth/tokenManager';

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  
  // 1. ดึง access token
  const token = tokenManager.getAccessToken();
  
  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No access token available');
  }

  // 2. เรียก API ด้วย access token
  const response = await fetch(url, {
    ...options,
    credentials: 'include', 
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });

  // 3. ถ้าได้ 401 Unauthorized → Refresh Token
  if (response.status === 401) {
    console.log('⚠️ Got 401, refreshing token...');
    
    const refreshed = await tokenManager.refreshToken();
    
    if (refreshed) {
      // 4. ลองเรียก API อีกครั้งด้วย token ใหม่
      console.log('🔄 Retrying API with new token...');
      
      const newToken = tokenManager.getAccessToken();
      
      return fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
        },
      });
    } else {
      throw new Error('Token refresh failed');
    }
  }

  return response;
}