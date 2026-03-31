// src/features/booths/api/announcementApi.ts

import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';
import type {
  BoothAnnouncement,
  BoothAnnouncementDetail,
  CreateBoothAnnouncementRequest,
  UpdateBoothAnnouncementRequest,
  CreateAnnouncementResponse,
} from '../types/announcement.types';

// ✅ แก้ port เป็น 5001
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

/**
 * Get all announcements for a specific booth
 * GET /booth-noti/:expoID/get-notis/:boothID
 */
export async function getBoothAnnouncements(
  expoID: string,
  boothID: string
): Promise<BoothAnnouncement[]> {
  const response = await fetchWithAuth(
    `${API_BASE}/booth-noti/${expoID}/get-notis/${boothID}`,
    {
      method: 'GET',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch booth announcements');
  }

  return response.json();
}

/**
 * Get announcement detail by ID
 * GET /booth-noti/:expoID/get/:notiID
 */
export async function getBoothAnnouncementDetail(
  expoID: string,
  notiID: string
): Promise<BoothAnnouncementDetail> {
  const response = await fetchWithAuth(
    `${API_BASE}/booth-noti/${expoID}/get/${notiID}`,
    {
      method: 'GET',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch announcement detail');
  }

  return response.json();
}

/**
 * Create a new booth announcement
 * POST /booth-noti/:expoID/:boothID/create
 * ✅ เพิ่ม boothID parameter
 */
export async function createBoothAnnouncement(
  expoID: string,
  boothID: string, // ✅ เพิ่ม parameter
  data: CreateBoothAnnouncementRequest
): Promise<CreateAnnouncementResponse> {
  const formData = new FormData();
  
  formData.append('booth_id', data.booth_id);
  formData.append('title', data.title);
  if (data.detail) {
    formData.append('detail', data.detail);
  }
  formData.append('status', data.status);

  // Append files if any
  if (data.files && data.files.length > 0) {
    data.files.forEach((file) => {
      formData.append('files', file);
    });
  }

  // ✅ เพิ่ม boothID ใน path
  const response = await fetchWithAuth(
    `${API_BASE}/booth-noti/${expoID}/${boothID}/create`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create announcement');
  }

  return response.json();
}

/**
 * Update booth announcement
 * PUT /booth-noti/:expoID/:boothID/update
 * ✅ เพิ่ม boothID parameter
 */
export async function updateBoothAnnouncement(
  expoID: string,
  boothID: string, // ✅ เพิ่ม parameter
  data: UpdateBoothAnnouncementRequest
): Promise<{ message: string }> {
  const formData = new FormData();
  
  formData.append('noti_id', data.noti_id);
  formData.append('title', data.title);
  if (data.detail) {
    formData.append('detail', data.detail);
  }
  formData.append('status', data.status);

  // Append deleted pics if any
  if (data.deleted_pics && data.deleted_pics.length > 0) {
    data.deleted_pics.forEach((picId) => {
      formData.append('deleted_pics', picId);
    });
  }

  // Append new files if any
  if (data.files && data.files.length > 0) {
    data.files.forEach((file) => {
      formData.append('files', file);
    });
  }

  // ✅ เพิ่ม boothID ใน path
  const response = await fetchWithAuth(
    `${API_BASE}/booth-noti/${expoID}/${boothID}/update`,
    {
      method: 'PUT',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update announcement');
  }

  return response.json();
}

/**
 * Delete booth announcement
 * DELETE /booth-noti/:expoID/:boothID/remove/:notiID
 * ✅ เพิ่ม boothID parameter
 */
export async function deleteBoothAnnouncement(
  expoID: string,
  boothID: string, // ✅ เพิ่ม parameter
  notiID: string
): Promise<{ message: string }> {
  // ✅ เพิ่ม boothID ใน path
  const response = await fetchWithAuth(
    `${API_BASE}/booth-noti/${expoID}/${boothID}/remove/${notiID}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete announcement');
  }

  return response.json();
}

/**
 * Publish announcement
 * GET /booth-noti/:expoID/:boothID/publish/:notiID
 */
export async function publishBoothAnnouncement(
  expoID: string,
  boothID: string,
  announcement: BoothAnnouncementDetail
): Promise<{ message: string }> {
  const response = await fetchWithAuth(
    `${API_BASE}/booth-noti/${expoID}/${boothID}/publish/${announcement.NotiID}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to publish announcement');
  }

  return response.json();
}

/**
 * Unpublish announcement (update status to 'unpublish')
 * ✅ เพิ่ม boothID parameter
 */
export async function unpublishBoothAnnouncement(
  expoID: string,
  boothID: string, // ✅ เพิ่ม parameter
  announcement: BoothAnnouncementDetail
): Promise<{ message: string }> {
  const formData = new FormData();
  
  formData.append('noti_id', announcement.NotiID);
  formData.append('title', announcement.Title);
  if (announcement.Detail) {
    formData.append('detail', announcement.Detail);
  }
  formData.append('status', 'unpublish');

  // ✅ เพิ่ม boothID ใน path
  const response = await fetchWithAuth(
    `${API_BASE}/booth-noti/${expoID}/${boothID}/update`,
    {
      method: 'PUT',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to unpublish announcement');
  }

  return response.json();
}