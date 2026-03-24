// src/features/booths/api/boothGlobalApi.ts

import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';
import type { 
  BoothGlobal,
  BoothGlobalStaff,
  BoothInExpo,
  CreateBoothGlobalRequest,
  JoinBoothByCodeResult,
  JoinForm,
  JoinFormStatus,
  JoinFormType,
  AvailableBooth,
  AvailableBoothStatus,
  ExpoSearchResult,
  ExpoSearchResponse,
  PaymentMethod,
  // Phase 3 (Organizer)
  BoothGroupSearchItem,
  BoothGroupSearchResponse,
  JoinFormByExpo,
} from '../types/boothGlobal.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// ============================================
// Transform Functions
// ============================================

function transformBoothInExpo(b: any): BoothInExpo {
  return {
    expoID:    b.ExpoID    || b.expo_id    || '',
    expoTitle: b.ExpoTitle || b.expo_title || '',
    expoThumbnail: b.ExpoThumbnail || b.expo_thumbnail || null,   // ⭐ เพิ่ม

    boothID:   b.BoothID   || b.booth_id   || '',
    boothNo:   b.BoothNo   || b.booth_no   || '',
    type:      b.Type      || b.type       || '',
    title:     b.Title     || b.title      || '',
    hall:      b.Hall      || b.hall       || '',
    zoneName:  b.ZoneName  || b.zone_name  || '',

    price:     b.Price     || b.price      || 0,    // ⭐ เพิ่ม
    status:    b.Status    || b.status     || '',   // ⭐ เพิ่ม

    thumbnail: b.Thumbnail || b.thumbnail  || '',
  };
}

function transformBooth(data: any): BoothGlobal {
  const booth = data.BoothGroup || data.booth_group || data;
  const rawBooths = booth.Booth || booth.booth || [];
  
  return {
    id: booth.ID || booth.id,
    title: booth.Title || booth.title,
    detail: booth.Detail || booth.detail,
    company: booth.Company || booth.company,
    email: booth.Email || booth.email,
    tel: booth.Tel || booth.tel,
    website1: booth.Website1 || booth.website1,
    website2: booth.Website2 || booth.website2,
    profilePic: booth.ProfilePic || booth.profile_pic,
    booth: Array.isArray(rawBooths) ? rawBooths.map(transformBoothInExpo) : [],
  };
}

function transformStaff(data: any): BoothGlobalStaff {
  return {
    userId: data.UserID || data.user_id,
    firstname: data.Firstname || data.firstname,
    lastname: data.Lastname || data.lastname,
    email: data.Email || data.email,
    role: data.Role || data.role,
    status: data.Status || data.status,
  };
}

// ============================================
// 1. Get My Booth Group
// ============================================

export async function getMyBoothGlobal(): Promise<{ booth: BoothGlobal | null; role: string }> {
  try {
    console.log('🔍 Getting my booth group...');
    const response = await fetchWithAuth(`${API_URL}/booth-group-staff/my-booth`);
    
    if (response.status === 404) {
      console.log('📭 No booth group found (404)');
      return { booth: null, role: '' };
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get booth group');
    }
    
    const data = await response.json();
    console.log('✅ My booth group:', data);
    
    const booth = data.BoothGroup ? transformBooth(data) : null;
    const role = data.role || '';
    
    return { booth, role };
  } catch (error: any) {
    console.error('❌ Failed to get my booth group:', error);
    throw error;
  }
}

// ============================================
// 2. Create Booth Group
// ============================================

export async function createBoothGlobal(req: CreateBoothGlobalRequest): Promise<string> {
  try {
    console.log('📦 Creating booth group...');
    
    const formData = new FormData();
    formData.append('title', req.title);
    formData.append('company', req.company);
    formData.append('email', req.email);
    formData.append('tel', req.tel);
    
    if (req.detail) formData.append('detail', req.detail);
    if (req.website1) formData.append('website1', req.website1);
    if (req.website2) formData.append('website2', req.website2);
    if (req.profile_pic) formData.append('profile_pic', req.profile_pic);
    
    const response = await fetchWithAuth(`${API_URL}/booth-group/create`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to create booth group');
    }
    
    const data = await response.json();
    console.log('✅ Booth group created:', data);
    
    return data.booth_group_id || data.boothGroupId || '';
  } catch (error: any) {
    console.error('❌ Failed to create booth group:', error);
    throw error;
  }
}

// ============================================
// 3. Update Booth Group
// ============================================

export async function updateBoothGlobal(boothId: string, req: CreateBoothGlobalRequest): Promise<boolean> {
  try {
    console.log('📝 Updating booth group:', boothId);
    
    const formData = new FormData();
    formData.append('title', req.title);
    formData.append('company', req.company);
    formData.append('email', req.email);
    formData.append('tel', req.tel);
    
    if (req.detail) formData.append('detail', req.detail);
    if (req.website1) formData.append('website1', req.website1);
    if (req.website2) formData.append('website2', req.website2);
    if (req.profile_pic) formData.append('profile_pic', req.profile_pic);
    
    const response = await fetchWithAuth(`${API_URL}/booth-group/${boothId}/update`, {
      method: 'PUT',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to update booth group');
    }
    
    console.log('✅ Booth group updated');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to update booth group:', error);
    throw error;
  }
}

// ============================================
// 4. Delete Booth Group
// ============================================

export async function deleteBoothGlobal(boothId: string): Promise<boolean> {
  try {
    const response = await fetchWithAuth(`${API_URL}/booth-group/${boothId}/delete`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to delete booth group');
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to delete booth group:', error);
    throw error;
  }
}

// ============================================
// 5. Get Booth Group Detail
// ============================================

export async function getBoothGroupDetail(boothId: string): Promise<{ booth: BoothGlobal; role: string }> {
  try {
    const response = await fetchWithAuth(`${API_URL}/booth-group/get/${boothId}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get booth group detail');
    }
    
    const data = await response.json();
    const booth = transformBooth(data);
    const role = data.role || '';
    
    return { booth, role };
  } catch (error: any) {
    console.error('❌ Failed to get booth group detail:', error);
    throw error;
  }
}

// ============================================
// 6. Get Booth Staff
// ============================================

export async function getBoothStaff(boothId: string): Promise<BoothGlobalStaff[]> {
  try {
    const response = await fetchWithAuth(`${API_URL}/booth-group-staff/${boothId}/get-staff`);
    
    if (response.status === 404) return [];
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get booth staff');
    }
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data.map(transformStaff);
    }
    
    return [];
  } catch (error: any) {
    console.error('❌ Failed to get booth staff:', error);
    return [];
  }
}

// ============================================
// 7. Invite Booth Staff
// ============================================

export async function inviteBoothStaff(boothId: string, email: string): Promise<boolean> {
  try {
    const response = await fetchWithAuth(`${API_URL}/booth-group-staff/${boothId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to invite staff');
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to invite staff:', error);
    throw error;
  }
}

// ============================================
// 8. Create Invite Code
// ============================================

export async function createBoothInviteCode(boothId: string): Promise<string | null> {
  try {
    const response = await fetchWithAuth(`${API_URL}/booth-group-staff/${boothId}/create-invite-code`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to create invite code');
    }
    
    const data = await response.json();
    return data.code || null;
  } catch (error: any) {
    console.error('❌ Failed to create invite code:', error);
    return null;
  }
}

// ============================================
// 9. Remove Booth Staff
// ============================================

export async function removeBoothStaff(boothId: string, userId: string): Promise<boolean> {
  try {
    const response = await fetchWithAuth(`${API_URL}/booth-group-staff/${boothId}/remove/${userId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to remove staff');
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to remove staff:', error);
    throw error;
  }
}

// ============================================
// 10. Leave Booth Group
// ============================================

export async function leaveBoothGroup(boothId: string): Promise<boolean> {
  try {
    const response = await fetchWithAuth(`${API_URL}/booth-group-staff/${boothId}/leave`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to leave booth group');
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to leave booth group:', error);
    throw error;
  }
}

// ============================================
// 11. Respond to Invitation (Booth Staff)
// ============================================

export async function respondToInvitation(notiId: string, isAccepted: boolean): Promise<boolean> {
  try {
    const response = await fetchWithAuth(`${API_URL}/booth-group-staff/respond-invitation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        noti_id: notiId,
        is_accepted: isAccepted,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to respond to invitation');
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to respond to invitation:', error);
    throw error;
  }
}

// ============================================
// 12. Join Booth Group with Code
// ============================================

export async function joinBoothByCode(code: string): Promise<{ success: boolean; message: string; boothGroupId?: string }> {
  try {
    const response = await fetchWithAuth(`${API_URL}/booth-group-staff/join-with-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      
      if (response.status === 400) return { success: false, message: 'รหัสเชิญไม่ถูกต้อง' };
      if (response.status === 404) return { success: false, message: 'ไม่พบรหัสเชิญนี้' };
      if (response.status === 409) return { success: false, message: 'คุณเป็นสมาชิกของบูธนี้อยู่แล้ว' };
      
      throw new Error(error.error || 'เข้าร่วมบูธล้มเหลว');
    }
    
    const data = await response.json();
    return {
      success: true,
      message: 'เข้าร่วมบูธสำเร็จ',
      boothGroupId: data.booth_group_id,
    };
  } catch (error: any) {
    console.error('❌ Failed to join booth:', error);
    return { success: false, message: error.message || 'เข้าร่วมบูธล้มเหลว' };
  }
}

// ============================================================
// ✅ Phase 2: Event Participation (Booth Manager)
// ============================================================

// ─── Transform helpers ────────────────────────────────────────

function transformJoinForm(data: any): JoinForm {
  return {
    expoId: data.ExpoID || data.expo_id || '',
    expoTitle: data.ExpoTitle || data.expo_title || '',
    boothId: data.BoothID || data.booth_id || '',
    boothNo: data.BoothNo || data.booth_no || '',
    boothGroupId: data.BoothGroupID || data.booth_group_id || '',
    boothGroupTitle: data.BoothGroupTitle || data.booth_group_title || '',
    requestId: data.RequestID || data.request_id || '',
    type: (data.Type || data.type || 'request_to_join') as JoinFormType,
    detail: data.Detail || data.detail || null,
    status: (data.Status || data.status || 'pending') as JoinFormStatus,
    paymentId: data.PaymentID || data.payment_id || null,
  };
}

function transformAvailableBooth(data: any): AvailableBooth {
  return {
    boothId: data.BoothID || data.booth_id || '',
    boothNo: data.BoothNo || data.booth_no || '',
    type: data.Type || data.type || '',
    price: data.Price || data.price || 0,
    status: (data.Status || data.status || 'available') as AvailableBooth['status'],
    hall: data.Hall || data.hall || '',
    zoneId: data.ZoneID || data.zone_id || '',
    zoneName: data.ZoneName || data.zone_name || '',
  };
}

function transformExpo(data: any): ExpoSearchResult {
  return {
    id: data.ID || data.id || '',
    title: data.Title || data.title || '',
    category: data.Category || data.category || '',
    startDate: data.StartDate || data.start_date || '',
    endDate: data.EndDate || data.end_date || '',
    location: data.Location || data.location || '',
    thumbnail: data.Thumbnail || data.thumbnail || null,
    status: (data.Status || data.status || '').toLowerCase(),
  };
}

// ============================================
// 13. Search Expos (Booth Manager ค้นหางาน)
// GET /expo/:boothGroupID/search-unpublish?search=&category=&page=1&page_size=10
// ============================================

export async function searchExpos(params: {
  boothGroupId: string;
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<ExpoSearchResponse> {
  try {
    const { boothGroupId, search = '', category = '', page = 1, pageSize = 10 } = params;

    const query = new URLSearchParams({
      search,
      category,
      page: String(page),
      page_size: String(pageSize),
    });

    console.log(`🔍 [searchExpos] boothGroupId=${boothGroupId} query=${query.toString()}`);

    const response = await fetchWithAuth(`${API_URL}/expo/${boothGroupId}/search-unpublish?${query}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to search expos');
    }

    const data = await response.json();
    console.log('✅ [searchExpos] raw response:', JSON.stringify(data, null, 2));

    return {
      expos: Array.isArray(data.Expos) ? data.Expos.map(transformExpo) : [],
      total: data.Total || data.total || 0,
      page: data.Page || data.page || 1,
      pageSize: data.PageSize || data.page_size || 10,
      totalPages: data.TotalPages || data.total_pages || 1,
    };
  } catch (error: any) {
    console.error('❌ [searchExpos] error:', error);
    throw error;
  }
}

// ============================================
// 14. Get Available Booths in Expo
// GET /booth/:expoID/:boothGroupID/available-booths
// ============================================

export async function getAvailableBooths(expoId: string, boothGroupId: string): Promise<AvailableBooth[]> {
  try {
    console.log(`🔍 [getAvailableBooths] expoId=${expoId} boothGroupId=${boothGroupId}`);

    const response = await fetchWithAuth(`${API_URL}/booth/${expoId}/${boothGroupId}/available-booths`);

    if (response.status === 404) return [];

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get available booths');
    }

    const data = await response.json();
    console.log('✅ [getAvailableBooths] raw response:', JSON.stringify(data, null, 2));

    return Array.isArray(data) ? data.map(transformAvailableBooth) : [];
  } catch (error: any) {
    console.error('❌ [getAvailableBooths] error:', error);
    throw error;
  }
}

// ============================================
// 15. Apply to Join Expo Booth (Booth Manager ขอเข้าร่วม)
// POST /booth/join-to-booth/:expoID
// Body: { booth_id, booth_group_id, detail? }
// ============================================

export async function applyToJoinBooth(
  expoId: string,
  boothId: string,
  boothGroupId: string,
  detail?: string
): Promise<{ requestId: string }> {
  try {
    console.log(`📤 Applying to join booth: expo=${expoId}, booth=${boothId}`);
    
    const body: any = {
      booth_id: boothId,
      booth_group_id: boothGroupId,
    };
    if (detail?.trim()) body.detail = detail.trim();
    
    const response = await fetchWithAuth(`${API_URL}/booth/join-to-booth/${expoId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to apply for booth');
    }
    
    const data = await response.json();
    console.log('✅ Applied to booth:', data);
    
    return { requestId: data.request_id || '' };
  } catch (error: any) {
    console.error('❌ Failed to apply to booth:', error);
    throw error;
  }
}

// ============================================
// 16. Get My Join Forms (Booth Manager ดูคำขอของตัวเอง)
// GET /booth/get-join-forms-by-booth-group/:boothGroupID?type=request_to_join|invite_to_join
// ============================================

export async function getMyJoinForms(
  boothGroupId: string,
  type: JoinFormType
): Promise<JoinForm[]> {
  try {
    console.log(`📋 Getting join forms: boothGroup=${boothGroupId}, type=${type}`);
    
    const response = await fetchWithAuth(
      `${API_URL}/booth/get-join-forms-by-booth-group/${boothGroupId}?type=${type}`
    );
    
    if (response.status === 404) return [];
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get join forms');
    }
    
    const data = await response.json();
    console.log('✅ Join forms:', data);
    
    return Array.isArray(data) ? data.map(transformJoinForm) : [];
  } catch (error: any) {
    console.error('❌ Failed to get join forms:', error);
    throw error;
  }
}

// ============================================
// 17. Respond to Join Request (Booth Manager ตอบรับ/ปฏิเสธ invitation)
// PUT /booth/respond-join-booth/:requestID
// Body: { accept: true/false }
// ============================================

export async function respondToJoinRequest(
  requestId: string,
  accept: boolean
): Promise<boolean> {
  try {
    console.log(`📨 Responding to join request: ${requestId}, accept=${accept}`);
    
    const response = await fetchWithAuth(`${API_URL}/booth/respond-join-booth/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accept }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to respond to join request');
    }
    
    console.log('✅ Responded to join request');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to respond to join request:', error);
    throw error;
  }
}

// ============================================
// 17b. Cancel Join Booth (ยกเลิกคำขอ/คำเชิญ)
// PUT /booth/cancel-join-booth/:requestId
// ============================================
export async function cancelJoinBooth(requestId: string): Promise<boolean> {
  try {
    console.log(`🚫 Cancelling join booth: ${requestId}`);
    const response = await fetchWithAuth(`${API_URL}/booth/cancel-join-booth/${requestId}`, {
      method: 'PUT',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to cancel join booth');
    }
    console.log('✅ Join booth cancelled');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to cancel join booth:', error);
    throw error;
  }
}

// ============================================
// 18. Checkout Payment
// POST /booth-group-payment/:boothGroupID/checkout
// Body: { request_id }
// ============================================

export async function checkoutPayment(
  boothGroupId: string,
  requestId: string
): Promise<{ paymentId: string; price: string; boothNo: string; expoTitle: string }> {
  try {
    console.log(`💳 Checkout payment: boothGroup=${boothGroupId}, request=${requestId}`);
    
    const response = await fetchWithAuth(`${API_URL}/booth-group-payment/${boothGroupId}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to checkout payment');
    }
    
    const data = await response.json();
    console.log('✅ Checkout successful:', data);
    
    return {
      paymentId: data.PaymentID || data.payment_id || '',
      price: data.Price || data.price || '0',
      boothNo: data.BoothNo || data.booth_no || '',
      expoTitle: data.ExpoTitle || data.expo_title || '',
    };
  } catch (error: any) {
    console.error('❌ Failed to checkout:', error);
    throw error;
  }
}

// ============================================
// 19. Confirm Payment
// POST /booth-group-payment/:boothGroupID/confirm-payment
// Body: { payment_id, payment_method }
// ============================================

export async function confirmPayment(
  boothGroupId: string,
  paymentId: string,
  paymentMethod: string = 'bank_transfer'
): Promise<boolean> {
  try {
    console.log(`✅ Confirming payment: ${paymentId}`);
    
    const response = await fetchWithAuth(`${API_URL}/booth-group-payment/${boothGroupId}/confirm-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id: paymentId, payment_method: paymentMethod }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to confirm payment');
    }
    
    console.log('✅ Payment confirmed');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to confirm payment:', error);
    throw error;
  }
}

// ============================================================
// ✅ Phase 3: Organizer — Explore & Invite BoothGroup
// ============================================================

// ─── Transform BoothGroup Search ──────────────────────────────

function transformBoothGroupSearchItem(data: any): BoothGroupSearchItem {
  return {
    id: data.ID || data.id || '',
    title: data.Title || data.title || '',
    company: data.Company || data.company || '',
    profilePic: data.ProfilePic || data.profile_pic || null,
  };
}

// ─── Transform JoinFormByExpo ──────────────────────────────────

function transformJoinFormByExpo(data: any): JoinFormByExpo {
  // normalize type — backend อาจส่งมาหลายรูปแบบ
  const rawType = data.Type || data.type || '';
  let normalizedType: JoinFormType;
  if (rawType.toLowerCase().includes('invite')) {
    normalizedType = 'invite_to_join';
  } else if (rawType.toLowerCase().includes('request')) {
    normalizedType = 'request_to_join';
  } else {
    normalizedType = rawType as JoinFormType;
  }

  console.log(`🔍 transformJoinFormByExpo: raw Type="${rawType}" → normalized="${normalizedType}"`);

  return {
    expoId: data.ExpoID || data.expo_id || '',
    expoTitle: data.ExpoTitle || data.expo_title || '',
    boothId: data.BoothID || data.booth_id || '',
    boothNo: data.BoothNo || data.booth_no || '',
    boothGroupId: data.BoothGroupID || data.booth_group_id || '',
    boothGroupTitle: data.BoothGroupTitle || data.booth_group_title || '',
    requestId: data.RequestID || data.request_id || '',
    type: normalizedType,
    detail: data.Detail ?? data.detail ?? null,
    status: (data.Status || data.status || 'pending').toLowerCase() as JoinFormStatus,
    paymentId: data.PaymentID || data.payment_id || null,
  };
}

// ============================================
// 20. Search Booth Groups (Organizer ค้นหาบูธเพื่อเชิญ)
// GET /booth-group/search?search=&category=&page=1&page_size=10
// ============================================

export async function searchBoothGroups(params: {
  expoId: string;
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<BoothGroupSearchResponse> {
  try {
    const { expoId, search = '', category = '', page = 1, pageSize = 9 } = params;
    const query = new URLSearchParams({ search, category, page: String(page), page_size: String(pageSize) });
    console.log(`🔍 [searchBoothGroups] expoId=${expoId} query=${query.toString()}`);
    const response = await fetchWithAuth(`${API_URL}/booth-group/${expoId}/search?${query}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to search booth groups');
    }
    const data = await response.json();
    console.log('✅ [searchBoothGroups] raw response:', JSON.stringify(data, null, 2));
    return {
      boothGroups: Array.isArray(data.BoothGroups) ? data.BoothGroups.map(transformBoothGroupSearchItem) : [],
      total:      data.Total      || data.total      || 0,
      page:       data.Page       || data.page       || 1,
      pageSize:   data.PageSize   || data.page_size  || 9,
      totalPages: data.TotalPages || data.total_pages || 1,
    };
  } catch (error: any) {
    console.error('❌ [searchBoothGroups] error:', error);
    throw error;
  }
}

// ============================================
// 21. Invite BoothGroup to Expo (Organizer ส่งคำเชิญ)
// POST /booth/invite-to-booth/:expoID
// Body: { booth_id, booth_group_id, detail? }
// ============================================

export async function inviteBoothGroupToExpo(
  expoId: string,
  boothId: string,
  boothGroupId: string,
  detail?: string
): Promise<string> {
  try {
    console.log(`📨 Inviting booth group: expo=${expoId}, booth=${boothId}, boothGroup=${boothGroupId}`);
    
    const body: any = {
      booth_id: boothId,
      booth_group_id: boothGroupId,
      detail: detail ?? '',
    };
    
    const response = await fetchWithAuth(`${API_URL}/booth/invite-to-booth/${expoId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to invite booth group');
    }
    
    const data = await response.json();
    console.log('✅ Invitation sent, request_id:', data.request_id);
    
    // Response: { request_id: "..." }
    return data.request_id || '';
  } catch (error: any) {
    console.error('❌ Failed to invite booth group:', error);
    throw error;
  }
}

// ============================================
// 22. Get Join Forms By Expo (Organizer ดูคำขอทั้งหมดในงาน)
// GET /booth/get-join-forms-by-expo/:expoID?type=request_to_join|invite_to_join
// type ถ้าไม่ส่ง = ดึงทั้งหมด
// ============================================

export async function getJoinFormsByExpo(
  expoId: string,
  type?: 'request_to_join' | 'invite_to_join'
): Promise<JoinFormByExpo[]> {
  try {
    const query = new URLSearchParams();
    if (type) query.set('type', type);
    
    console.log(`📋 Getting join forms by expo: ${expoId}, type=${type || 'all'}`);
    
    const response = await fetchWithAuth(
      `${API_URL}/booth/get-join-forms-by-expo/${expoId}?${query}`
    );
    
    if (response.status === 404) return [];
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get join forms by expo');
    }
    
    const data = await response.json();
    console.log('✅ Join forms by expo:', data);
    
    return Array.isArray(data) ? data.map(transformJoinFormByExpo) : [];
  } catch (error: any) {
    console.error('❌ Failed to get join forms by expo:', error);
    throw error;
  }
}

export async function getBoothUnavailability(expoId: string): Promise<AvailableBooth[]> {
  try {
    console.log(`🔍 [getBoothUnavailability] expoId=${expoId}`);
    const response = await fetchWithAuth(`${API_URL}/booth/${expoId}/unavailable-booths`);
    if (response.status === 404) return [];
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to get booth unavailability');
    }
    const data = await response.json();
    console.log('✅ [getBoothUnavailability] raw response:', JSON.stringify(data, null, 2));
    return Array.isArray(data) ? data.map(transformAvailableBooth) : [];
  } catch (error: any) {
    console.error('❌ [getBoothUnavailability] error:', error);
    throw error;
  }
}