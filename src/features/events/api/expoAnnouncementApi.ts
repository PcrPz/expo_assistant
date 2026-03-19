// src/features/events/api/expoAnnouncementApi.ts
import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';
import type {
  ExpoAnnouncement,
  ExpoAnnouncementDetail,
  CreateExpoAnnouncementRequest,
  UpdateExpoAnnouncementRequest,
} from '../types/expoAnnouncement.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// GET /expo-noti/:expoID/get-notis
export async function getExpoAnnouncements(
  expoID: string
): Promise<ExpoAnnouncement[]> {
  const res = await fetchWithAuth(`${API_BASE}/expo-noti/${expoID}/get-notis`);
  if (!res.ok) throw new Error('Failed to fetch expo announcements');
  return res.json();
}

// GET /expo-noti/:expoID/get/:notiID
export async function getExpoAnnouncementDetail(
  expoID: string,
  notiID: string
): Promise<ExpoAnnouncementDetail> {
  const res = await fetchWithAuth(`${API_BASE}/expo-noti/${expoID}/get/${notiID}`);
  if (!res.ok) throw new Error('Failed to fetch announcement detail');
  return res.json();
}

// POST /expo-noti/:expoID/create
export async function createExpoAnnouncement(
  expoID: string,
  data: CreateExpoAnnouncementRequest
): Promise<{ notiID: string }> {
  const formData = new FormData();
  formData.append('title', data.title);
  if (data.detail) formData.append('detail', data.detail);
  formData.append('status', data.status);
  if (data.files?.length) {
    data.files.forEach(f => formData.append('files', f));
  }
  const res = await fetchWithAuth(`${API_BASE}/expo-noti/${expoID}/create`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to create announcement');
  return res.json();
}

// PUT /expo-noti/:expoID/update
export async function updateExpoAnnouncement(
  expoID: string,
  data: UpdateExpoAnnouncementRequest
): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append('noti_id', data.noti_id);
  formData.append('title', data.title);
  if (data.detail) formData.append('detail', data.detail);
  formData.append('status', data.status);
  if (data.deleted_pics?.length) {
    data.deleted_pics.forEach(p => formData.append('deleted_pics', p));
  }
  if (data.files?.length) {
    data.files.forEach(f => formData.append('files', f));
  }
  const res = await fetchWithAuth(`${API_BASE}/expo-noti/${expoID}/update`, {
    method: 'PUT',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to update announcement');
  return res.json();
}

// DELETE /expo-noti/:expoID/remove/:notiID
export async function deleteExpoAnnouncement(
  expoID: string,
  notiID: string
): Promise<{ message: string }> {
  const res = await fetchWithAuth(`${API_BASE}/expo-noti/${expoID}/remove/${notiID}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete announcement');
  return res.json();
}

// GET /expo-noti/:expoID/publish/:notiID
export async function publishExpoAnnouncement(
  expoID: string,
  notiID: string
): Promise<{ message: string }> {
  const res = await fetchWithAuth(`${API_BASE}/expo-noti/${expoID}/publish/${notiID}`);
  if (!res.ok) throw new Error('Failed to publish announcement');
  return res.json();
}