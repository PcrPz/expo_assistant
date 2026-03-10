// src/features/booths/api/eventApi.ts

import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';
import type {
  BoothEvent,
  BoothEventDetail,
  CreateBoothEventRequest,
  UpdateBoothEventRequest,
  CreateBoothEventResponse,
} from '../types/event.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

/**
 * GET /event/:expoID/get-events/:boothID
 * ดึงรายการ Event ทั้งหมดของบูธ
 */
export async function getBoothEvents(
  expoID: string,
  boothID: string
): Promise<BoothEvent[]> {
  const response = await fetchWithAuth(
    `${API_BASE}/event/${expoID}/get-events/${boothID}`,
    { method: 'GET' }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch booth events');
  }
  return response.json();
}

/**
 * GET /event/:expoID/get/:eventID
 * ดึงรายละเอียด Event
 */
export async function getBoothEventDetail(
  expoID: string,
  eventID: string
): Promise<BoothEventDetail> {
  const response = await fetchWithAuth(
    `${API_BASE}/event/${expoID}/get/${eventID}`,
    { method: 'GET' }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch event detail');
  }
  return response.json();
}

/**
 * POST /event/:expoID/:boothID/create
 * สร้าง Event ใหม่
 */
export async function createBoothEvent(
  expoID: string,
  boothID: string,
  data: CreateBoothEventRequest
): Promise<CreateBoothEventResponse> {
  const formData = new FormData();
  formData.append('booth_id', data.booth_id);
  formData.append('title', data.title);
  formData.append('start_date', data.start_date);
  formData.append('end_date', data.end_date);
  if (data.detail) formData.append('detail', data.detail);
  if (data.company) formData.append('company', data.company);
  if (data.email) formData.append('email', data.email);
  if (data.tel) formData.append('tel', data.tel);
  if (data.website1) formData.append('website1', data.website1);
  if (data.website2) formData.append('website2', data.website2);
  if (data.thumbnail_file) formData.append('thumbnail_file', data.thumbnail_file);
  if (data.files && data.files.length > 0) {
    data.files.forEach((file) => formData.append('files', file));
  }

  const response = await fetchWithAuth(
    `${API_BASE}/event/${expoID}/${boothID}/create`,
    { method: 'POST', body: formData }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create event');
  }
  return response.json();
}

/**
 * PUT /event/:expoID/:boothID/update
 * แก้ไข Event (รองรับการลบรูปแบบ booth-noti)
 */
export async function updateBoothEvent(
  expoID: string,
  boothID: string,
  data: UpdateBoothEventRequest
): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append('event_id', data.event_id);
  formData.append('title', data.title);
  formData.append('start_date', data.start_date);
  formData.append('end_date', data.end_date);
  if (data.detail) formData.append('detail', data.detail);
  if (data.company) formData.append('company', data.company);
  if (data.email) formData.append('email', data.email);
  if (data.tel) formData.append('tel', data.tel);
  if (data.website1) formData.append('website1', data.website1);
  if (data.website2) formData.append('website2', data.website2);
  if (data.thumbnail) formData.append('thumbnail', data.thumbnail);
  if (data.deleted_pics && data.deleted_pics.length > 0) {
    data.deleted_pics.forEach((picId) => formData.append('deleted_pics', picId));
  }
  if (data.thumbnail_file) formData.append('thumbnail_file', data.thumbnail_file);
  if (data.files && data.files.length > 0) {
    data.files.forEach((file) => formData.append('files', file));
  }

  const response = await fetchWithAuth(
    `${API_BASE}/event/${expoID}/${boothID}/update`,
    { method: 'PUT', body: formData }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update event');
  }
  return response.json();
}

/**
 * DELETE /event/:expoID/:boothID/remove/:eventID
 * ลบ Event
 */
export async function deleteBoothEvent(
  expoID: string,
  boothID: string,
  eventID: string
): Promise<{ message: string }> {
  const response = await fetchWithAuth(
    `${API_BASE}/event/${expoID}/${boothID}/remove/${eventID}`,
    { method: 'DELETE' }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete event');
  }
  return response.json();
}