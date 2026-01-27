// src/features/minio/api/minioApi.ts
import { tokenManager } from '@/src/lib/auth/tokenManager';

/**
 * ✅ ดึง Access Token จาก tokenManager
 */
function getAccessToken(): string | null {
  const token = tokenManager.getAccessToken();
  
  if (!token) {
    console.warn('⚠️ No accessToken found');
    return null;
  }
  
  console.log('✅ Token found:', token.substring(0, 20) + '...');
  return token;
}

/**
 * ดึงรูปผ่าน Next.js API Route (Proxy)
 * 
 * @param encodedPath - encoded path จาก Backend
 * @returns URL ของรูป (Next.js API Route)
 */
export function getFileUrl(encodedPath: string | undefined | null): string | null {
  if (!encodedPath || encodedPath === '') {
    console.warn('⚠️ getFileUrl: encodedPath is empty');
    return null;
  }
  
  // ถ้าเป็น URL เต็มอยู่แล้ว
  if (encodedPath.startsWith('http://') || encodedPath.startsWith('https://')) {
    console.log('ℹ️ getFileUrl: Using full URL:', encodedPath);
    return encodedPath;
  }
  
  // ✅ ดึง token จาก tokenManager
  const token = getAccessToken();
  
  if (!token) {
    console.error('❌ getFileUrl: No access token found!');
    return null;
  }
  
  const url = `/api/minio/file/${encodedPath}?token=${encodeURIComponent(token)}`;
  
  console.log('✅ getFileUrl created:', {
    input: encodedPath,
    output: url.substring(0, 80) + '...',
    hasToken: !!token,
  });
  
  return url;
}

/**
 * ดึงรูปโปรไฟล์
 */
export function getProfilePicUrl(profilePic: string | undefined | null): string | null {
  return getFileUrl(profilePic);
}

/**
 * ดึงรูป Event Banner
 */
export function getEventBannerUrl(bannerPath: string | undefined | null): string | null {
  return getFileUrl(bannerPath);
}

/**
 * ดึงรูป Event Logo/Thumbnail
 */
export function getEventLogoUrl(logoPath: string | undefined | null): string | null {
  return getFileUrl(logoPath);
}

/**
 * ดึงรูป Document
 */
export function getDocumentUrl(documentPath: string | undefined | null): string | null {
  return getFileUrl(documentPath);
}

/**
 * ดึงรูปใดๆ จาก MinIO (ใช้อันนี้ได้กับทุกอย่าง!)
 */
export function getMinioFileUrl(filePath: string | undefined | null): string | null {
  return getFileUrl(filePath);
}