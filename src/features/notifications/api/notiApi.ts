// src/features/notifications/api/notiApi.ts
import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';
import type {
  GetNotiResult,
  NotiDetail,
  NotiType,
  OtherUserInfo,
  ExpoInfo,
  BoothInfo,
  BoothGroupInfo,
  JoinFormInfo,
  EventInfo,
} from '../types/noti.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// ─── 1. Check unread dot ──────────────────────────────────────
export async function checkNotiRead(): Promise<boolean> {
  try {
    const res = await fetchWithAuth(`${API_URL}/noti/check-read`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.IsRead ?? false;
  } catch {
    return false;
  }
}

// ─── 2. Get noti list ─────────────────────────────────────────
export async function getNotiList(
  page = 1,
  pageSize = 20
): Promise<GetNotiResult | null> {
  try {
    const res = await fetchWithAuth(
      `${API_URL}/noti/get-notis?page=${page}&page_size=${pageSize}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    console.log('🔔 [Noti List Raw]:', JSON.stringify(data, null, 2));
    return data as GetNotiResult;
  } catch {
    return null;
  }
}

// ─── 3. Get noti detail + mark as read ───────────────────────
export async function getNotiDetail(
  notiId: string,
  type: NotiType
): Promise<NotiDetail | null> {
  try {
    const res = await fetchWithAuth(`${API_URL}/noti/get/${notiId}/${type}`);
    if (!res.ok) {
      console.warn(`⚠️ [Noti Detail] 400/error type=${type} id=${notiId}`);
      return null;
    }
    const data = await res.json();
    console.log(`📨 [Noti Detail] type=${type}:`, JSON.stringify(data, null, 2));
    return data;
  } catch {
    return null;
  }
}

// ─── Action APIs ──────────────────────────────────────────────

// new_follower → ติดตามกลับ
export async function followBack(notiId: string): Promise<boolean> {
  try {
    const res = await fetchWithAuth(`${API_URL}/users/follow-back`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noti_id: notiId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// following_request → ตอบรับ/ปฏิเสธ
export async function followResponse(
  notiId: string,
  isAccepted: boolean
): Promise<boolean> {
  try {
    const res = await fetchWithAuth(`${API_URL}/users/follow-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noti_id: notiId, is_accepted: isAccepted }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// expo_invitation → ตอบรับ/ปฏิเสธ
export async function respondExpoInvitation(
  notiId: string,
  isAccepted: boolean
): Promise<boolean> {
  try {
    const res = await fetchWithAuth(`${API_URL}/staff/respond-invitation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noti_id: notiId, is_accepted: isAccepted }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// booth_group_invitation → ตอบรับ/ปฏิเสธ
export async function respondBoothGroupInvitation(
  notiId: string,
  isAccepted: boolean
): Promise<boolean> {
  try {
    const res = await fetchWithAuth(
      `${API_URL}/booth-group-staff/respond-invitation`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noti_id: notiId, is_accepted: isAccepted }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// booth_request_join / booth_invite_join → อนุมัติ/ปฏิเสธ
export async function respondJoinBooth(
  requestId: string,
  accept: boolean
): Promise<boolean> {
  try {
    const res = await fetchWithAuth(
      `${API_URL}/booth/respond-join-booth/${requestId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accept }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Extra fetch APIs (for display enrichment) ────────────────

// GET /users/other/:userID
export async function getOtherUser(userId: string): Promise<OtherUserInfo | null> {
  try {
    const res = await fetchWithAuth(`${API_URL}/users/other/${userId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// GET /expo/get/:expoID
export async function getExpoInfo(expoId: string): Promise<ExpoInfo | null> {
  try {
    const res = await fetchWithAuth(`${API_URL}/expo/get/${expoId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.expo ?? null;
  } catch {
    return null;
  }
}

// GET /booth/:expoID/get/:boothID
export async function getBoothInfo(
  expoId: string,
  boothId: string
): Promise<BoothInfo | null> {
  try {
    const res = await fetchWithAuth(`${API_URL}/booth/${expoId}/get/${boothId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// GET /booth-group/get/:boothGroupID
export async function getBoothGroupInfo(
  boothGroupId: string
): Promise<BoothGroupInfo | null> {
  try {
    const res = await fetchWithAuth(`${API_URL}/booth-group/get/${boothGroupId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.BoothGroup ?? null;
  } catch {
    return null;
  }
}

// GET /booth/get-join-form/:requestID
export async function getJoinFormInfo(
  requestId: string
): Promise<JoinFormInfo | null> {
  try {
    const res = await fetchWithAuth(`${API_URL}/booth/get-join-form/${requestId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// GET /event/:expoID/get/:eventID
export async function getEventInfo(
  expoId: string,
  eventId: string
): Promise<EventInfo | null> {
  try {
    const res = await fetchWithAuth(`${API_URL}/event/${expoId}/get/${eventId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}