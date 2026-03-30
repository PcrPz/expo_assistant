// src/features/events/api/eventApi.ts

import type { Event, CreateEventRequest, CreateEventResponse } from '../types/event.types';
import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';
import { getZonesByExpoId } from '@/src/features/zones/api/zoneApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// ============================================
// Transform Event Data
// ============================================

function transformEventData(data: any): Event {
  return {
    id: data.ID || data.id || data.expoID || data.expo_id,
    expoID: data.ID || data.id || data.expoID || data.expo_id,
    name: data.Title || data.name || data.title || '',
    title: data.Title || data.name || data.title,
    category: data.Category || data.category || '',
    startDate: data.StartDate || data.start_date || data.startDate || '',
    start_date: data.StartDate || data.start_date || data.startDate,
    endDate: data.EndDate || data.end_date || data.endDate || '',
    end_date: data.EndDate || data.end_date || data.endDate,
    startTime: data.StartTime || data.start_time || data.startTime,
    start_time: data.StartTime || data.start_time || data.startTime,
    endTime: data.EndTime || data.end_time || data.endTime,
    end_time: data.EndTime || data.end_time || data.endTime,
    time: data.time,
    location: data.Location || data.location || data.address || '',
    address: data.Location || data.location || data.address,
    organizer: data.Organizer || data.organizer,
    email: data.Email || data.email,
    tel: data.Tel || data.tel,
    description: data.Detail || data.description || data.detail,
    detail: data.Detail || data.description || data.detail,
    website1: data.Website1 || data.website1,
    website2: data.Website2 || data.website2,
    status: (data.Status || data.status)?.toLowerCase() || 'pending',
    thumbnail: data.Thumbnail || data.thumbnail,
    logo: data.Logo || data.logo,
    banner: data.Banner || data.banner,
    map: data.Map || data.map,
    role: data.Role || data.role,
    
    zones: (data.zones || data.Zones || []).map((zone: any) => ({
      zone_id: zone.ZoneID || zone.zone_id || zone.id || '',
      title: zone.Title || zone.title || zone.name || '',
      description: zone.Description || zone.description || null,
      map: zone.Map || zone.map || null,
    })),
  };
}

// ============================================
// Validation Helper
// ============================================

function isValidEvent(event: any): boolean {
  if (!event) return false;
  
  const hasID = !!(
    event.expoID || 
    event.ID || 
    event.id || 
    event.expo_id ||
    event.ExpoID
  );
  
  const hasTitle = !!(
    event.title || 
    event.Title || 
    event.name ||
    event.Name
  );
  
  return hasID && hasTitle;
}

// ============================================
// Get Organized Events (Role: system_admin, owner, admin, staff)
// ============================================

export async function getOrganizedEvents(): Promise<Event[]> {
  try {
    const response = await fetchWithAuth(`${API_URL}/expo/get-my-expo-list`);
    
    if (!response.ok) {
      console.error('Failed to fetch my expo list:', response.status);
      return [];
    }
    
    const data = await response.json();
    console.log('📦 Raw API response:', data);
    
    let rawEvents: any[] = [];
    
    // ดึงจาก manage_expo
    if (data.manage_expo && Array.isArray(data.manage_expo)) {
      rawEvents = data.manage_expo;
    } else if (Array.isArray(data)) {
      rawEvents = data;
    }
    
    console.log('📋 All events:', rawEvents.length);
    
    // ✅ กรองเฉพาะ Role ที่เป็นผู้จัด
    const organizerRoles = ['system_admin', 'owner', 'admin', 'staff'];
    const organizedEvents = rawEvents.filter(event => {
      const role = (event.Role || event.role || '').toLowerCase();
      const isOrganizer = organizerRoles.includes(role);
      if (isOrganizer) {
        console.log(`  ✅ Organizer: ${event.Title} (Role: ${role})`);
      }
      return isOrganizer;
    });
    
    console.log('👔 Organized events (Role: system_admin/owner/admin/staff):', organizedEvents.length);
    
    const validEvents = organizedEvents.filter(isValidEvent);
    const normalizedEvents = validEvents.map(transformEventData);
    
    return normalizedEvents;
  } catch (error) {
    console.error('Failed to fetch organized events:', error);
    return [];
  }
}

// ============================================
// Get Participated Events (Role: booth_staff)
// ============================================

export async function getParticipatedEvents(): Promise<Event[]> {
  try {
    const response = await fetchWithAuth(`${API_URL}/expo/get-my-expo-list`);
    
    if (!response.ok) {
      console.error('Failed to fetch my expo list:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    let rawEvents: any[] = [];
    
    // ดึงจาก manage_expo
    if (data.manage_expo && Array.isArray(data.manage_expo)) {
      rawEvents = data.manage_expo;
    } else if (Array.isArray(data)) {
      rawEvents = data;
    }
    
    // ✅ กรองเฉพาะ Role: booth_staff
    const boothStaffEvents = rawEvents.filter(event => {
      const role = (event.Role || event.role || '').toLowerCase();
      const isBoothStaff = role === 'booth_staff';
      if (isBoothStaff) {
        console.log(`  🏪 Booth Staff: ${event.Title} (Role: ${role})`);
      }
      return isBoothStaff;
    });
    
    console.log('🏪 Booth staff events (Role: booth_staff):', boothStaffEvents.length);
    
    const validEvents = boothStaffEvents.filter(isValidEvent);
    const normalizedEvents = validEvents.map(transformEventData);
    
    return normalizedEvents;
  } catch (error) {
    console.error('Failed to fetch participated events:', error);
    return [];
  }
}

// ============================================
// Get All My Events (เรียก API ครั้งเดียว แล้ว split ตาม role)
// ============================================

export async function getAllMyEvents(): Promise<{
  organized: Event[];
  participated: Event[];
}> {
  try {
    const response = await fetchWithAuth(`${API_URL}/expo/get-my-expo-list`);

    if (!response.ok) {
      console.error('Failed to fetch my expo list:', response.status);
      return { organized: [], participated: [] };
    }

    const data = await response.json();
    console.log('📦 Raw API response (getAllMyEvents):', data);

    let rawEvents: any[] = [];
    if (data.manage_expo && Array.isArray(data.manage_expo)) {
      rawEvents = data.manage_expo;
    } else if (Array.isArray(data)) {
      rawEvents = data;
    }

    const ORGANIZER_ROLES = ['system_admin', 'owner', 'admin', 'staff'];

    const organized: Event[] = [];
    const participated: Event[] = [];

    for (const event of rawEvents) {
      if (!isValidEvent(event)) continue;
      const role = (event.Role || event.role || '').toLowerCase();
      const normalized = transformEventData(event);
      if (ORGANIZER_ROLES.includes(role)) {
        organized.push(normalized);
      } else if (role === 'booth_staff') {
        participated.push(normalized);
      }
    }

    console.log(`✅ getAllMyEvents: organized=${organized.length}, participated=${participated.length}`);
    return { organized, participated };
  } catch (error) {
    console.error('Failed to fetch all my events:', error);
    return { organized: [], participated: [] };
  }
}

// ============================================
// Get My Events
// ============================================

export async function getMyEvents(): Promise<Event[]> {
  const { organized, participated } = await getAllMyEvents();
  return [...organized, ...participated];
}

// ============================================
// Get Event by ID
// ============================================

export async function getEventById(id: string): Promise<Event | null> {
  try {
    const response = await fetchWithAuth(`${API_URL}/expo/get/${id}`);
    
    if (!response.ok) {
      console.error(`Failed to fetch event ${id}:`, response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (!data) {
      return null;
    }

    // ✅ รองรับ response format ใหม่: { expo: {...}, role: "..." }
    let eventData: any;
    let roleFromResponse: string | undefined;

    if (data.expo) {
      // Format ใหม่
      eventData = data.expo;
      roleFromResponse = data.role;
      console.log('📦 New API format detected - expo + role');
    } else {
      // Format เดิม
      eventData = data;
      roleFromResponse = data.Role || data.role;
      console.log('📦 Old API format detected');
    }
    
    // ดึง zones
    const zones = await getZonesByExpoId(id);
    
    const dataWithIdAndZones = {
      ...eventData,
      ID: id,
      id: id,
      Role: roleFromResponse,
      role: roleFromResponse,
      zones: zones,
    };
    
    const normalized = transformEventData(dataWithIdAndZones);
    
    console.log('✅ Event loaded:', normalized);
    
    return normalized;
  } catch (error) {
    console.error(`Failed to fetch event ${id}:`, error);
    return null;
  }
}

// ============================================
// Get Event with Role
// ============================================

// ─── Helper: ดึง expo detail จาก /expo/get/:id ───────────────
async function fetchExpoDetail(eventId: string): Promise<any | null> {
  try {
    const res = await fetchWithAuth(`${API_URL}/expo/get/${eventId}`);
    if (!res.ok) {
      console.warn(`⚠️ fetchExpoDetail ${eventId} failed: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Main: getEventWithRole ───────────────────────────────────
// Response: { expo: {...}, role: "owner"|"booth_staff_visitor"|... }
export async function getEventWithRole(eventId: string): Promise<Event | null> {
  try {
    // เรียก /expo/get/:id อย่างเดียว — backend ส่ง role มาให้เลย
    const data = await fetchExpoDetail(eventId);

    if (!data) {
      console.error(`❌ Cannot load expo detail for ${eventId}`);
      return null;
    }

    // Response format: { expo: {...}, role: "..." }
    const expoData = data.expo ?? data;
    const role = data.role || expoData.Role || expoData.role || 'booth_staff_visitor';

    const zones = await getZonesByExpoId(eventId).catch(() => []);

    const merged = {
      ...expoData,
      ID: eventId,
      id: eventId,
      expoID: eventId,
      Role: role,
      role: role,
      zones,
    };

    console.log(`✅ getEventWithRole: id=${eventId} role=${role}`);
    return transformEventData(merged);

  } catch (error) {
    console.error('Failed to fetch event with role:', error);
    return null;
  }
}

// ============================================
// Create Event
// ============================================

export async function createEvent(request: CreateEventRequest): Promise<CreateEventResponse | null> {
  try {
    const formData = new FormData();
    
    formData.append('title', request.name);
    formData.append('category', request.category);
    formData.append('start_date', request.startDate);
    formData.append('end_date', request.endDate);
    
    if (request.startTime) {
      const startTime = request.startTime.includes(':') 
        ? `${request.startTime}:00` 
        : request.startTime;
      formData.append('start_time', startTime);
    }
    
    if (request.endTime) {
      const endTime = request.endTime.includes(':') 
        ? `${request.endTime}:00` 
        : request.endTime;
      formData.append('end_time', endTime);
    }
    
    formData.append('location', request.location);
    
    if (request.organizer) formData.append('organizer', request.organizer);
    if (request.email) formData.append('email', request.email);
    if (request.tel) formData.append('tel', request.tel);
    if (request.description) formData.append('detail', request.description);
    if (request.website1) formData.append('website1', request.website1);
    if (request.website2) formData.append('website2', request.website2);
    
    if (request.logoFile) {
      formData.append('thumbnail_file', request.logoFile);
    }
    if (request.bannerFile) {
      formData.append('map_file', request.bannerFile);
    }
    if (request.imageFiles && request.imageFiles.length > 0) {
      request.imageFiles.forEach((file) => {
        formData.append('files', file);
      });
    }
    
    const response = await fetchWithAuth(`${API_URL}/expo/create`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create event failed:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('Failed to create event:', error);
    return null;
  }
}

// ============================================
// Update Event
// ============================================

export async function updateEvent(id: string, request: CreateEventRequest): Promise<boolean> {
  try {
    const formData = new FormData();
    
    formData.append('title', request.name);
    formData.append('category', request.category);
    formData.append('start_date', request.startDate);
    formData.append('end_date', request.endDate);
    
    if (request.startTime) {
      const startTime = request.startTime.includes(':') 
        ? `${request.startTime}:00` 
        : request.startTime;
      formData.append('start_time', startTime);
    }
    
    if (request.endTime) {
      const endTime = request.endTime.includes(':') 
        ? `${request.endTime}:00` 
        : request.endTime;
      formData.append('end_time', endTime);
    }
    
    formData.append('location', request.location);
    
    if (request.organizer) formData.append('organizer', request.organizer);
    if (request.email) formData.append('email', request.email);
    if (request.tel) formData.append('tel', request.tel);
    if (request.description) formData.append('detail', request.description);
    if (request.website1) formData.append('website1', request.website1);
    if (request.website2) formData.append('website2', request.website2);
    
    if (request.logoFile) {
      formData.append('thumbnail_file', request.logoFile);
    } else if (request.thumbnail) {
      formData.append('thumbnail', request.thumbnail);
    }
    
    if (request.bannerFile) {
      formData.append('map_file', request.bannerFile);
    } else if (request.map) {
      formData.append('map', request.map);
    }
    
    if (request.imageFiles && request.imageFiles.length > 0) {
      request.imageFiles.forEach((file) => {
        formData.append('files', file);
      });
    }
    
    if (request.zones && request.zones.length > 0) {
      formData.append('zones', JSON.stringify(request.zones));
    }

    // ส่ง deleted_pics ถ้ามีรูปที่ต้องการลบ
    if (request.deletedPics && request.deletedPics.length > 0) {
      request.deletedPics.forEach(pic => {
        formData.append('deleted_pics', pic);
      });
    }
    
    const response = await fetchWithAuth(`${API_URL}/expo/${id}/update`, {
      method: 'PUT',
      body: formData,
    });
    
    if (!response.ok) {
      console.error(`Update event ${id} failed:`, response.status);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to update event ${id}:`, error);
    return false;
  }
}

// ============================================
// Delete Event
// ============================================

export async function deleteEvent(id: string): Promise<boolean> {
  try {
    const response = await fetchWithAuth(`${API_URL}/expo/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      console.error(`Delete event ${id} failed:`, response.status);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to delete event ${id}:`, error);
    return false;
  }
}

// ============================================
// Update Event Status
// ============================================

export async function updateEventStatus(id: string, status: string): Promise<boolean> {
  try {
    const response = await fetchWithAuth(`${API_URL}/expo/${id}/update-status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      console.error(`Update status failed:`, response.status);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to update event status ${id}:`, error);
    return false;
  }
}
// ============================================
// Get Initial Payment (ดึงข้อมูลการชำระเงินเริ่มต้น)
// ============================================

export async function getPayments(expoId: string): Promise<any> {
  try {
    console.log('🔍 Checkout initial payment for expo:', expoId);
    // ✨ NEW: POST /expo-payment/:expoId/checkout/initial_fee (no body)
    const response = await fetchWithAuth(`${API_URL}/expo-payment/${expoId}/checkout/initial_fee`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      console.error('Failed to checkout initial payment:', response.status);
      return null;
    }
    
    const payment = await response.json();
    console.log('✅ Checkout response:', payment);
    
    return payment;
  } catch (error) {
    console.error('Failed to checkout initial payment:', error);
    return null;
  }
}

// ============================================
// Confirm Payment (ชำระเงินมัดจำ)
// ============================================

export async function confirmPayment(
  expoId: string,
  paymentId: string,
  paymentMethod: 'QRscan' | 'Credit Card'
): Promise<boolean> {
  try {
    console.log('💳 Confirming payment:', { expoId, paymentId, paymentMethod });
    
    // ✨ NEW: POST /expo-payment/:expoId/confirm-payment (paymentId อยู่ใน body)
    const response = await fetchWithAuth(
      `${API_URL}/expo-payment/${expoId}/confirm-payment`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId, payment_method: paymentMethod }),
      }
    );
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Payment confirmation failed:', error);
      throw new Error(error.error || 'การชำระเงินล้มเหลว');
    }
    
    const result = await response.json();
    console.log('✅ Payment confirmed:', result);
    
    return true;
  } catch (error: any) {
    console.error('Failed to confirm payment:', error);
    throw error;
  }
}