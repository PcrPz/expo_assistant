// src/features/booths/api/boothApi.ts
import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';
import type { Booth, CreateBoothRequest, UpdateBoothRequest, BoothType } from '../types/booth.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

/**
 * Transform raw booth data from Backend (PascalCase) to Frontend (lowercase)
 */
function transformBooth(rawBooth: any): Booth {
  return {
    booth_id: rawBooth.BoothID || rawBooth.booth_id || '',
    expo_id: rawBooth.ExpoID || rawBooth.expo_id || '',
    booth_no: rawBooth.BoothNo || rawBooth.booth_no || '',
    type: (rawBooth.Type || rawBooth.type || 'small_booth') as BoothType,
    price: String(rawBooth.Price ?? rawBooth.price ?? '0'),             // ← เพิ่ม
    status: (rawBooth.Status || rawBooth.status || 'available') as import('../types/booth.types').BoothStatus, // ← เพิ่ม
    title: rawBooth.Title || rawBooth.title || null,
    detail: rawBooth.Detail || rawBooth.detail || null,
    company: rawBooth.Company || rawBooth.company || null,
    hall: rawBooth.Hall || rawBooth.hall || null,
    zone_id: rawBooth.ZoneID || rawBooth.zone_id || '',
    zone_name: rawBooth.ZoneName || rawBooth.zoneName || rawBooth.zone_name || null,
    email: rawBooth.Email || rawBooth.email || null,
    tel: rawBooth.Tel || rawBooth.tel || null,
    website1: rawBooth.Website1 || rawBooth.website1 || null,
    website2: rawBooth.Website2 || rawBooth.website2 || null,
    thumbnail: rawBooth.Thumbnail || rawBooth.thumbnail || null,
    booth_group_id: rawBooth.BoothGroupID || rawBooth.booth_group_id || null,  // ← เพิ่ม
    created_at: rawBooth.CreatedAt || rawBooth.created_at || new Date().toISOString(),
    updated_at: rawBooth.UpdatedAt || rawBooth.updated_at || new Date().toISOString(),
  };
}

/**
 * Convert empty strings to null for cleaner data
 */
function cleanEmptyStrings(booth: Booth): Booth {
  return {
    ...booth,
    title: booth.title === '' ? null : booth.title,
    detail: booth.detail === '' ? null : booth.detail,
    company: booth.company === '' ? null : booth.company,
    hall: booth.hall === '' ? null : booth.hall,
    zone_name: booth.zone_name === '' ? null : booth.zone_name,
    email: booth.email === '' ? null : booth.email,
    tel: booth.tel === '' ? null : booth.tel,
    website1: booth.website1 === '' ? null : booth.website1,
    website2: booth.website2 === '' ? null : booth.website2,
    thumbnail: booth.thumbnail === '' ? null : booth.thumbnail,
    booth_group_id: booth.booth_group_id === '' ? null : booth.booth_group_id,
  };
}

/**
 * Get all booths for current user
 */
export async function getMyBooths(): Promise<Booth[]> {
  try {
    console.log('🌐 [BoothAPI] GET /booth/get-my-booths');
    
    const response = await fetchWithAuth(`${API_URL}/booth/get-my-booths`);
    
    if (!response.ok) {
      console.error(`❌ [BoothAPI] Failed: ${response.status}`);
      return [];
    }
    
    const rawData = await response.json();
    console.log('📦 [BoothAPI] Raw data:', rawData);
    
    // ✅ Backend ใหม่ wrap ใน { manage_booth: [...] }
    const list = rawData.manage_booth ?? rawData;
    const booths = Array.isArray(list) 
      ? list.map((b: any) => cleanEmptyStrings(transformBooth(b)))
      : [];
    
    console.log('✅ [BoothAPI] Transformed booths:', booths);
    return booths;
  } catch (error) {
    console.error('💥 [BoothAPI] Error:', error);
    return [];
  }
}

/**
 * Get expo IDs from user's booths
 */
export async function getExpoIdsFromMyBooths(): Promise<string[]> {
  try {
    const booths = await getMyBooths();
    const expoIds = [...new Set(booths.map(booth => booth.expo_id))];
    console.log('📋 [BoothAPI] Unique expo IDs:', expoIds);
    return expoIds;
  } catch (error) {
    console.error('💥 [BoothAPI] Error:', error);
    return [];
  }
}

/**
 * Get all booths for a specific expo
 */
export async function getBoothsByExpoId(expoId: string): Promise<Booth[]> {
  try {
    console.log(`🌐 [BoothAPI] GET /booth/${expoId}/get-booths`);
    
    const response = await fetchWithAuth(`${API_URL}/booth/${expoId}/get-booths`);
    
    console.log(`📡 [BoothAPI] Status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`❌ [BoothAPI] Failed: ${response.status}`);
      return [];
    }
    
    const rawData = await response.json();
    console.log('📦 [BoothAPI] Raw booths data:', rawData);
    
    const booths = Array.isArray(rawData) 
      ? rawData.map(b => cleanEmptyStrings(transformBooth(b)))
      : [];
    
    console.log(`✅ [BoothAPI] Transformed ${booths.length} booths`);
    return booths;
  } catch (error) {
    console.error('💥 [BoothAPI] Error:', error);
    return [];
  }
}

/**
 * Get single booth by ID
 */
export async function getBoothById(expoId: string, boothId: string): Promise<Booth | null> {
  try {
    console.log(`🌐 [BoothAPI] GET /booth/${expoId}/get/${boothId}`);
    
    const response = await fetchWithAuth(`${API_URL}/booth/${expoId}/get/${boothId}`);
    
    if (!response.ok) {
      console.error(`❌ [BoothAPI] Failed: ${response.status}`);
      return null;
    }
    
    const rawData = await response.json();
    console.log('📦 [BoothAPI] Raw booth:', rawData);
    
    const booth = cleanEmptyStrings(transformBooth(rawData));
    console.log('✅ [BoothAPI] Transformed booth:', booth);
    
    return booth;
  } catch (error) {
    console.error('💥 [BoothAPI] Error:', error);
    return null;
  }
}

/**
 * Create a new booth
 * 
 * NOTE: Backend only returns { "boothID": "..." }
 * We need to fetch the full booth data after creation
 */
export async function createBooth(
  expoId: string,
  data: CreateBoothRequest
): Promise<Booth | null> {
  try {
    console.log(`🌐 [BoothAPI] POST /booth/${expoId}/create`, data);
    
    const response = await fetchWithAuth(`${API_URL}/booth/${expoId}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    console.log(`📡 [BoothAPI] Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [BoothAPI] Failed: ${response.status}`, errorText);
      throw new Error(`Failed to create booth: ${response.status}`);
    }

    const result = await response.json();
    console.log('📦 [BoothAPI] Create response:', result);
    
    // ✅ Backend returns: { "boothID": "..." }
    const boothID = result.boothID || result.booth_id;
    
    if (!boothID) {
      console.error('❌ [BoothAPI] No boothID in response');
      throw new Error('No boothID in response');
    }
    
    console.log(`✅ [BoothAPI] Booth created with ID: ${boothID}`);
    
    // 🔄 Fetch full booth data
    console.log('🔄 [BoothAPI] Fetching full booth data...');
    const fullBooth = await getBoothById(expoId, boothID);
    
    if (fullBooth) {
      console.log('✅ [BoothAPI] Full booth data retrieved:', fullBooth);
      return fullBooth;
    }
    
    // Fallback: create minimal booth object from request data
    console.warn('⚠️ [BoothAPI] Could not fetch full booth, using request data');
    return {
      booth_id: boothID,
      expo_id: expoId,
      booth_no: data.booth_no,
      type: data.type,
      price: data.price || '0',
      status: (data.status || 'available') as import('../types/booth.types').BoothStatus,
      title: null,
      detail: null,
      company: null,
      hall: data.hall || null,
      zone_id: data.zone_id || '',
      zone_name: null,
      email: null,
      tel: null,
      website1: null,
      website2: null,
      thumbnail: null,
      booth_group_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('💥 [BoothAPI] Error creating booth:', error);
    throw error;
  }
}

/**
 * Update an existing booth
 * Backend expects multipart/form-data (not JSON)
 * ✅ FIXED: Added /${boothId} to path
 */
export async function updateBooth(
  expoId: string,
  boothId: string,
  data: UpdateBoothRequest
): Promise<Booth | null> {
  try {
    console.log(`🌐 [BoothAPI] PUT /booth/${expoId}/update/${boothId}`);
    console.log('📦 [BoothAPI] Request data:', data);
    
    // ✅ Backend expects multipart/form-data (form fields, not JSON)
    const formData = new FormData();
    
    // Required fields
    formData.append('booth_id', boothId);
    formData.append('booth_no', data.booth_no || '');
    formData.append('type', data.type || '');
    
    // Price & Status (ใหม่)
    if (data.price) formData.append('price', data.price);
    if (data.status) formData.append('status', data.status);
    
    // Optional fields - only append if not null/empty
    if (data.title) formData.append('title', data.title);
    if (data.detail) formData.append('detail', data.detail);
    if (data.company) formData.append('company', data.company);
    if (data.hall) formData.append('hall', data.hall);
    if (data.zone_id) formData.append('zone_id', data.zone_id);
    if (data.email) formData.append('email', data.email);
    if (data.tel) formData.append('tel', data.tel);
    if (data.website1) formData.append('website1', data.website1);
    if (data.website2) formData.append('website2', data.website2);
    
    console.log('📦 [BoothAPI] FormData fields:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    // ✅ FIXED: Added /${boothId} to path
    const response = await fetchWithAuth(`${API_URL}/booth/${expoId}/update/${boothId}`, {
      method: 'PUT',
      body: formData,
      // ⚠️ Don't set Content-Type - browser will set it with boundary
    });

    console.log(`📡 [BoothAPI] Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [BoothAPI] Failed: ${response.status}`, errorText);
      throw new Error(`Failed to update booth: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ [BoothAPI] Update response:', result);
    
    // Fetch updated booth data
    console.log('🔄 [BoothAPI] Fetching updated booth...');
    return await getBoothById(expoId, boothId);
  } catch (error) {
    console.error('💥 [BoothAPI] Error:', error);
    throw error;
  }
}

/**
 * Update booth with new thumbnail
 * Sends everything in one multipart/form-data request
 * ✅ FIXED: Added /${boothId} to path
 */
export async function updateBoothWithThumbnail(
  expoId: string,
  boothId: string,
  file: File,
  updateData: UpdateBoothRequest
): Promise<Booth | null> {
  try {
    console.log('🌐 [BoothAPI] PUT /booth/${expoId}/update/${boothId} (with thumbnail)');
    console.log('📸 [BoothAPI] Thumbnail file:', file.name, file.type, file.size);
    
    // ✅ Send everything in one FormData
    const formData = new FormData();
    
    // Required fields
    formData.append('booth_id', boothId);
    formData.append('booth_no', updateData.booth_no || '');
    formData.append('type', updateData.type || '');
    
    // Price & Status (ใหม่)
    if (updateData.price) formData.append('price', updateData.price);
    if (updateData.status) formData.append('status', updateData.status);
    
    // Thumbnail file
    formData.append('thumbnail_file', file);
    
    // Optional fields
    if (updateData.title) formData.append('title', updateData.title);
    if (updateData.detail) formData.append('detail', updateData.detail);
    if (updateData.company) formData.append('company', updateData.company);
    if (updateData.hall) formData.append('hall', updateData.hall);
    if (updateData.zone_id) formData.append('zone_id', updateData.zone_id);
    if (updateData.email) formData.append('email', updateData.email);
    if (updateData.tel) formData.append('tel', updateData.tel);
    if (updateData.website1) formData.append('website1', updateData.website1);
    if (updateData.website2) formData.append('website2', updateData.website2);
    
    console.log('📦 [BoothAPI] FormData with thumbnail');
    
    // ✅ FIXED: Added /${boothId} to path
    const response = await fetchWithAuth(`${API_URL}/booth/${expoId}/update/${boothId}`, {
      method: 'PUT',
      body: formData,
      // ⚠️ Don't set Content-Type - browser will set it with boundary
    });

    console.log(`📡 [BoothAPI] Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [BoothAPI] Failed: ${response.status}`, errorText);
      throw new Error(`Failed to update booth with thumbnail: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ [BoothAPI] Update with thumbnail response:', result);
    
    // Fetch updated booth
    console.log('🔄 [BoothAPI] Fetching updated booth...');
    return await getBoothById(expoId, boothId);
  } catch (error) {
    console.error('💥 [BoothAPI] Error:', error);
    throw error;
  }
}

/**
 * Delete a booth
 */
export async function deleteBooth(expoId: string, boothId: string): Promise<boolean> {
  try {
    console.log(`🌐 [BoothAPI] DELETE /booth/${expoId}/delete/${boothId}`);
    
    const response = await fetchWithAuth(`${API_URL}/booth/${expoId}/delete/${boothId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      console.log('✅ [BoothAPI] Booth deleted');
      return true;
    } else {
      console.error(`❌ [BoothAPI] Failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('💥 [BoothAPI] Error:', error);
    return false;
  }
}

/**
 * Get booth staff
 */
export async function getBoothStaff(expoId: string, boothId: string): Promise<any[]> {
  try {
    console.log(`🌐 [BoothAPI] GET /booth/${expoId}/get-staff/${boothId}`);
    
    const response = await fetchWithAuth(`${API_URL}/booth/${expoId}/get-staff/${boothId}`);
    
    if (!response.ok) {
      console.error(`❌ [BoothAPI] Failed: ${response.status}`);
      return [];
    }
    
    const rawData = await response.json();
    console.log('📦 [BoothAPI] Raw staff data:', rawData);
    
    // ✅ Transform PascalCase → lowercase
    const transformedStaff = Array.isArray(rawData) 
      ? rawData.map(staff => ({
          id: staff.UserID || staff.id || staff.userId || '',
          firstname: staff.Firstname || staff.firstname || '',
          lastname: staff.Lastname || staff.lastname || '',
          email: staff.Email || staff.email || '',
          role: staff.Role || staff.role || '',
          status: staff.Status || staff.status || '',
          is_staff: staff.IsStaff ?? staff.is_staff ?? false,
        }))
      : [];
    
    console.log('✅ [BoothAPI] Transformed staff:', transformedStaff);
    return transformedStaff;
  } catch (error) {
    console.error('💥 [BoothAPI] Error:', error);
    return [];
  }
}

/**
 * Update booth staff
 * ✅ FIXED: Added /${data.booth_id} to path
 */
export async function updateBoothStaff(
  expoId: string,
  data: {
    booth_id: string;
    add_staff_list: string[];
    delete_staff_list: string[];
  }
): Promise<boolean> {
  try {
    console.log(`🌐 [BoothAPI] POST /booth/${expoId}/update-staff/${data.booth_id}`);
    console.log('📦 [BoothAPI] Request data:', data);
    
    // ✅ FIXED: Added /${data.booth_id} to path
    const response = await fetchWithAuth(`${API_URL}/booth/${expoId}/update-staff/${data.booth_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    console.log(`📡 [BoothAPI] Status: ${response.status}`);

    if (response.ok) {
      console.log('✅ [BoothAPI] Staff updated successfully');
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ [BoothAPI] Failed: ${response.status}`, errorText);
      return false;
    }
  } catch (error) {
    console.error('💥 [BoothAPI] Error:', error);
    return false;
  }
}

/**
 * Helper function: Add staff to booth
 */
export async function addStaffToBooth(
  expoId: string,
  boothId: string,
  staffIds: string[]
): Promise<boolean> {
  return await updateBoothStaff(expoId, {
    booth_id: boothId,
    add_staff_list: staffIds,
    delete_staff_list: [],
  });
}

/**
 * Helper function: Remove staff from booth
 */
export async function removeStaffFromBooth(
  expoId: string,
  boothId: string,
  staffIds: string[]
): Promise<boolean> {
  return await updateBoothStaff(expoId, {
    booth_id: boothId,
    add_staff_list: [],
    delete_staff_list: staffIds,
  });
}