// src/features/events/api/expoFormApi.ts
import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';
import type {
  GetExpoFormResponse,
  CreateExpoFormRequest,
  UpdateExpoFormRequest,
  ExpoFormStatus,
} from '../types/expoForm.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
const DASH_URL = (expoId: string) => `${API_URL}/expo-dashboard/${expoId}`;

// ══════════════════════════════════════════════════════════════
// CRUD
// ══════════════════════════════════════════════════════════════

/**
 * GET /expo-form/:expoID/get
 * Returns null if form not found (404)
 */
export async function getExpoForm(expoId: string): Promise<GetExpoFormResponse | null> {
  try {
    const res = await fetchWithAuth(`${API_URL}/expo-form/${expoId}/get`);
    if (res.status === 404) return null;
    if (!res.ok) { console.error(`getExpoForm failed: ${res.status}`); return null; }
    const data = await res.json();
    return { expo_id: data.expo_id, status: data.status, questions: data.questions ?? [] };
  } catch (err) {
    console.error('getExpoForm error:', err);
    return null;
  }
}

/**
 * POST /expo-form/:expoID/create
 */
export async function createExpoForm(
  expoId: string,
  data: CreateExpoFormRequest
): Promise<{ expo_id: string }> {
  const res = await fetchWithAuth(`${API_URL}/expo-form/${expoId}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'ไม่สามารถสร้างแบบสอบถามได้');
  }
  return res.json();
}

/**
 * PUT /expo-form/:expoID/update
 */
export async function updateExpoForm(
  expoId: string,
  data: UpdateExpoFormRequest
): Promise<{ message: string }> {
  const res = await fetchWithAuth(`${API_URL}/expo-form/${expoId}/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'ไม่สามารถแก้ไขแบบสอบถามได้');
  }
  return res.json();
}

/**
 * PUT /expo-form/:expoID/update-status
 */
export async function updateExpoFormStatus(
  expoId: string,
  status: ExpoFormStatus
): Promise<{ message: string }> {
  const res = await fetchWithAuth(`${API_URL}/expo-form/${expoId}/update-status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'ไม่สามารถเปลี่ยนสถานะแบบสอบถามได้');
  }
  return res.json();
}

/**
 * DELETE /expo-form/:expoID/delete
 */
export async function deleteExpoForm(expoId: string): Promise<{ message: string }> {
  const res = await fetchWithAuth(`${API_URL}/expo-form/${expoId}/delete`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'ไม่สามารถลบแบบสอบถามได้');
  }
  return res.json();
}

// ══════════════════════════════════════════════════════════════
// RESULTS — expo-dashboard
// ══════════════════════════════════════════════════════════════

/**
 * GET /expo-dashboard/:expoID/form-avg
 * Response: [{ ResponseID, Title, AverageRating, ResponseCount }]
 */
export async function getExpoFormAvg(expoId: string) {
  try {
    const res = await fetchWithAuth(`${DASH_URL(expoId)}/form-avg`);
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((d: any) => ({
      responseId:    String(d.ResponseID   ?? d.response_id   ?? ''),
      title:         d.Title              ?? d.title          ?? '',
      averageRating: parseFloat(d.AverageRating ?? d.average_rating ?? 0),
      responseCount: d.ResponseCount      ?? d.response_count ?? 0,
    }));
  } catch { return []; }
}

/**
 * GET /expo-dashboard/:expoID/form-rating-count
 * Response: [{ question_no, question_title, "1":n, "2":n, "3":n, "4":n, "5":n }]
 */
export async function getExpoFormRatingCount(expoId: string) {
  try {
    const res = await fetchWithAuth(`${DASH_URL(expoId)}/form-rating-count`);
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((d: any) => ({
      questionNo:    String(d.question_no ?? d.QuestionNo ?? ''),
      questionTitle: d.question_title ?? d.QuestionTitle ?? '',
      rating1: d['1'] ?? 0,
      rating2: d['2'] ?? 0,
      rating3: d['3'] ?? 0,
      rating4: d['4'] ?? 0,
      rating5: d['5'] ?? 0,
    }));
  } catch { return []; }
}

/**
 * GET /expo-dashboard/:expoID/form-response
 * Response: { questions: { "1": "title" }, responses: [...] }
 */
export async function getExpoFormResponse(expoId: string) {
  try {
    const res = await fetchWithAuth(`${DASH_URL(expoId)}/form-response`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      questions: (data.questions ?? {}) as Record<string, string>,
      responses: (data.responses ?? []) as Record<string, string>[],
    };
  } catch { return null; }
}