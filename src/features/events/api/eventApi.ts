// src/features/events/api/eventApi.ts

import type { Event, CreateEventRequest, CreateEventResponse } from '../types/event.types';
import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';
import { getZonesByExpoId } from '@/src/features/zones/api/zoneApi';
import { getExpoIdsFromMyBooths } from '../../booths/api/boothApi';

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
    
    // ✅✅✅ แก้ส่วนนี้ - Map PascalCase → lowercase ✅✅✅
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
// Get Organized Events
// ============================================

export async function getOrganizedEvents(): Promise<Event[]> {
  try {
    const response = await fetchWithAuth(`${API_URL}/expo/get-my-expo-list`);
    
    if (!response.ok) {
      console.error('Failed to fetch organized events:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    let rawEvents: any[] = [];
    
    if (Array.isArray(data)) {
      rawEvents = data;
    } else if (data.manage_expo) {
      rawEvents = data.manage_expo;
    } else if (data.expos) {
      rawEvents = data.expos;
    } else if (data.data) {
      rawEvents = data.data;
    }
    
    const validEvents = rawEvents.filter(isValidEvent);
    const normalizedEvents = validEvents.map(transformEventData);
    
    return normalizedEvents;
  } catch (error) {
    console.error('Failed to fetch organized events:', error);
    return [];
  }
}

// ============================================
// Get Participated Events (งานที่เป็น Booth Staff)
// ============================================

export async function getParticipatedEvents(): Promise<Event[]> {
  try {
    // ✅ ใช้ Booth API หา Expo IDs ที่เป็น Booth Staff
    const expoIds = await getExpoIdsFromMyBooths();
    
    if (expoIds.length === 0) {
      console.log('📭 No booths found for this user');
      return [];
    }
    
    console.log('🏪 Found booths in expos:', expoIds);
    
    // ดึงรายละเอียด Event จากแต่ละ Expo ID
    const events = await Promise.all(
      expoIds.map(expoId => getEventById(expoId))
    );
    
    // กรองเฉพาะที่ได้ข้อมูล
    const validEvents = events.filter((event): event is Event => event !== null);
    
    console.log('✅ Participated events loaded:', validEvents.length);
    
    return validEvents;
  } catch (error) {
    console.warn('Participated events not available:', error);
    return [];
  }
}

// ============================================
// Get My Events
// ============================================

export async function getMyEvents(): Promise<Event[]> {
  const [organized, participated] = await Promise.all([
    getOrganizedEvents(),
    getParticipatedEvents(),
  ]);
  
  return [...organized, ...participated];
}

// ============================================
// Get Event by ID
// ============================================

export async function getEventById(id: string): Promise<Event | null> {
  try {
    const response = await fetchWithAuth(`${API_URL}/expo/${id}`);
    
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

export async function getEventWithRole(eventId: string): Promise<Event | null> {
  try {
    const myEventsResponse = await fetchWithAuth(`${API_URL}/expo/get-my-expo-list`);
    
    if (myEventsResponse.ok) {
      const myEventsData = await myEventsResponse.json();
      
      const foundEvent = myEventsData.manage_expo?.find(
        (e: any) => e.ID === eventId || e.id === eventId
      );
      
      if (foundEvent) {
        const detailResponse = await fetchWithAuth(`${API_URL}/expo/${eventId}`);
        
        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          
          // ✅ รองรับ response format ใหม่
          let eventData: any;
          let roleFromDetail: string | undefined;

          if (detailData.expo) {
            // Format ใหม่
            eventData = detailData.expo;
            roleFromDetail = detailData.role;
          } else {
            // Format เดิม
            eventData = detailData;
            roleFromDetail = detailData.Role || detailData.role;
          }
          
          const zones = await getZonesByExpoId(eventId);
          
          // ใช้ role จาก manage_expo list เป็นหลัก (เพราะแม่นกว่า)
          const mergedData = {
            ...eventData,
            ID: eventId,
            id: eventId,
            expoID: eventId,
            Role: foundEvent.Role || foundEvent.role || roleFromDetail,
            role: foundEvent.Role || foundEvent.role || roleFromDetail,
            zones: zones,
          };
          
          return transformEventData(mergedData);
        } else {
          const zones = await getZonesByExpoId(eventId);
          
          const listDataWithZones = {
            ...foundEvent,
            ID: eventId,
            id: eventId,
            zones: zones,
          };
          
          return transformEventData(listDataWithZones);
        }
      }
    }
    
    return await getEventById(eventId);
    
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