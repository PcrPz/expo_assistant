// src/features/booths/utils/announcement-helper.ts

import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';

/**
 * ✅ ดึงรูป Announcement ผ่าน MinIO API ที่มีอยู่แล้ว
 */
export function getAnnouncementImageUrl(picId: string | undefined | null): string | null {
  return getMinioFileUrl(picId);
}

/**
 * ดึงรูปหลายรูป
 */
export function getAnnouncementImageUrls(picIds: string[]): (string | null)[] {
  return picIds.map(getAnnouncementImageUrl);
}

/**
 * Format announcement status for display
 */
export function formatAnnouncementStatus(status: 'publish' | 'unpublish'): string {
  return status === 'publish' ? 'เผยแพร่แล้ว' : 'ยังไม่เผยแพร่';
}

/**
 * Get status badge variant
 */
export function getStatusBadgeVariant(status: 'publish' | 'unpublish'): 'default' | 'secondary' {
  return status === 'publish' ? 'default' : 'secondary';
}

/**
 * Get status badge color classes
 */
export function getStatusBadgeClasses(status: 'publish' | 'unpublish'): string {
  return status === 'publish'
    ? 'bg-green-100 text-green-700 hover:bg-green-100'
    : 'bg-gray-100 text-gray-600 hover:bg-gray-100';
}