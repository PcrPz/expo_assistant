// src/features/zones/api/zoneApi.ts

import { fetchWithAuth } from '@/src/lib/api/fetchWithAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// ============================================
// Types
// ============================================

// ✅ Type สำหรับ Backend Response (Get Zones)
export interface Zone {
  zone_id: string;
  title: string;
  description: string | null;
  map: string | null;
}

// ✅ Type สำหรับ Create Zone (ใช้ใน Create Event)
export interface ZoneWithFile {
  title: string;
  description?: string;
  mapFile?: File;
}

// ✅ Type สำหรับ Update Zone
export interface UpdateZoneRequest {
  zone_id: string;
  title: string;
  description?: string;
  mapFile?: File;
  map?: string; // path map เดิม
}

// ============================================
// Transform Functions
// ============================================

/**
 * Transform raw zone data from Backend to Frontend format
 * รองรับทั้ง PascalCase (Go) และ lowercase
 */
function transformZone(rawZone: any): Zone {
  const transformed: Zone = {
    zone_id: rawZone.zone_id || rawZone.ZoneID || rawZone.ID || '',
    title: rawZone.title || rawZone.Title || '',
    description: rawZone.description || rawZone.Description || null,
    map: rawZone.map || rawZone.Map || null,
  };

  return transformed;
}

// ============================================
// Get Zones by Expo ID
// ============================================

export async function getZonesByExpoId(expoId: string): Promise<Zone[]> {
  try {
    console.log(`🌐 [ZoneAPI] GET /zone/${expoId}/get-zones`);
    
    const response = await fetchWithAuth(`${API_URL}/zone/${expoId}/get-zones`);
    
    console.log(`📡 [ZoneAPI] Response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`❌ [ZoneAPI] Failed to fetch zones: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const rawData = await response.json();
    
    console.log('📦 [ZoneAPI] Raw data from backend:', rawData);
    console.log(`📊 [ZoneAPI] Raw data type: ${typeof rawData}, Is array: ${Array.isArray(rawData)}`);
    
    // Handle different response formats
    let zonesArray: any[] = [];
    
    if (Array.isArray(rawData)) {
      zonesArray = rawData;
    } else if (rawData && typeof rawData === 'object') {
      // Sometimes API wraps data in { data: [...] } or { zones: [...] }
      zonesArray = rawData.data || rawData.zones || rawData.Zones || [];
      console.log('🔄 [ZoneAPI] Unwrapped data from object wrapper');
    }
    
    console.log(`📋 [ZoneAPI] Zones array length: ${zonesArray.length}`);
    
    if (zonesArray.length === 0) {
      console.warn('⚠️ [ZoneAPI] No zones found for this expo');
      return [];
    }
    
    // Transform each zone
    const transformedZones = zonesArray.map((zone, index) => {
      console.log(`🔄 [ZoneAPI] Transforming zone ${index}:`, zone);
      const transformed = transformZone(zone);
      console.log(`✅ [ZoneAPI] Transformed zone ${index}:`, transformed);
      return transformed;
    });
    
    console.log('✨ [ZoneAPI] Final transformed zones:', transformedZones);
    
    return transformedZones;
    
  } catch (error) {
    console.error(`💥 [ZoneAPI] Exception in getZonesByExpoId:`, error);
    return [];
  }
}

// ============================================
// Create Zone (Single)
// ============================================

export async function createZone(
  expoId: string,
  data: {
    title: string;
    description?: string;
    mapFile?: File;
  }
): Promise<{ zoneID: string } | null> {
  try {
    console.log(`🌐 [ZoneAPI] POST /zone/${expoId}/create`, { title: data.title });
    
    const formData = new FormData();
    formData.append('title', data.title);
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    if (data.mapFile) {
      formData.append('map_file', data.mapFile);
      console.log(`📎 [ZoneAPI] Attached map file: ${data.mapFile.name}`);
    }

    const response = await fetchWithAuth(`${API_URL}/zone/${expoId}/create`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error(`❌ [ZoneAPI] Failed to create zone: ${response.status}`);
      return null;
    }

    const result = await response.json();
    console.log('✅ [ZoneAPI] Zone created:', result);
    
    return { zoneID: result.zoneID || result.zone_id };
    
  } catch (error) {
    console.error('💥 [ZoneAPI] Failed to create zone:', error);
    return null;
  }
}

// ============================================
// Create Zones Batch (ใช้ใน Create Event)
// ============================================

export async function createZonesBatch(
  expoId: string,
  zones: ZoneWithFile[]
): Promise<{ success: number; failed: number; errors: string[] }> {
  console.log(`🌐 [ZoneAPI] Creating ${zones.length} zones for expo ${expoId}`);
  
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (let i = 0; i < zones.length; i++) {
    const zone = zones[i];
    console.log(`📝 [ZoneAPI] Creating zone ${i + 1}/${zones.length}: ${zone.title}`);
    
    try {
      const result = await createZone(expoId, zone);
      
      if (result) {
        results.success++;
        console.log(`✅ [ZoneAPI] Zone ${i + 1} created successfully`);
      } else {
        results.failed++;
        results.errors.push(`Failed to create zone: ${zone.title}`);
        console.error(`❌ [ZoneAPI] Zone ${i + 1} failed`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Error creating zone ${zone.title}: ${error}`);
      console.error(`💥 [ZoneAPI] Exception creating zone ${i + 1}:`, error);
    }
  }

  console.log(`📊 [ZoneAPI] Batch results: ${results.success} success, ${results.failed} failed`);
  
  return results;
}

// ============================================
// Update Zone
// ============================================

export async function updateZone(
  expoId: string,
  zoneId: string,
  data: UpdateZoneRequest
): Promise<boolean> {
  try {
    console.log(`🌐 [ZoneAPI] PUT /zone/${expoId}/update`, { zoneId, title: data.title });
    
    const formData = new FormData();
    
    formData.append('zone_id', zoneId);
    formData.append('title', data.title);
    
    if (data.description) {
      formData.append('description', data.description);
    }
    
    // ✅ จัดการ Zone Map
    if (data.mapFile) {
      // มีไฟล์ใหม่ → ส่งไฟล์
      formData.append('map_file', data.mapFile);
      console.log(`📎 [ZoneAPI] Attached new map file: ${data.mapFile.name}`);
    } else if (data.map) {
      // ไม่มีไฟล์ใหม่ แต่มี path เดิม → ส่ง path เดิม
      formData.append('map', data.map);
      console.log(`📎 [ZoneAPI] Keeping existing map: ${data.map}`);
    }

    const response = await fetchWithAuth(`${API_URL}/zone/${expoId}/update`, {
      method: 'PUT',
      body: formData,
    });

    if (response.ok) {
      console.log('✅ [ZoneAPI] Zone updated successfully');
    } else {
      console.error(`❌ [ZoneAPI] Failed to update zone: ${response.status}`);
    }

    return response.ok;
    
  } catch (error) {
    console.error('💥 [ZoneAPI] Failed to update zone:', error);
    return false;
  }
}

// ============================================
// Delete Zone
// ============================================

export async function deleteZone(expoId: string, zoneId: string): Promise<boolean> {
  try {
    console.log(`🌐 [ZoneAPI] DELETE /zone/${expoId}/delete/${zoneId}`);
    
    const response = await fetchWithAuth(`${API_URL}/zone/${expoId}/delete/${zoneId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      console.log('✅ [ZoneAPI] Zone deleted successfully');
    } else {
      console.error(`❌ [ZoneAPI] Failed to delete zone: ${response.status}`);
    }

    return response.ok;
    
  } catch (error) {
    console.error('💥 [ZoneAPI] Failed to delete zone:', error);
    return false;
  }
}