// src/features/zones/types/zone.types.ts

// ✅ Zone type ที่ตรงกับ Backend API response
export interface Zone {
  zone_id: string;           // ← Backend ใช้ zone_id
  title: string;
  description: string | null; // ← Backend ใช้ description (ไม่ใช่ detail)
  map: string | null;
}

// ✅ สำหรับใช้ใน Frontend (ถ้าต้องการ format ที่ต่างออกไป)
export interface ZoneDisplay {
  id: string;
  title: string;
  description: string | null;
  map: string | null;
}

// ✅ Create Zone Request
export interface CreateZoneRequest {
  title: string;
  description?: string;
  map?: string;
}

// ✅ Update Zone Request
export interface UpdateZoneRequest {
  zone_id: string;
  title?: string;
  description?: string;
  map?: string;
}

// ✅ Helper function: แปลง Zone จาก API เป็น ZoneDisplay
export function toZoneDisplay(zone: Zone): ZoneDisplay {
  return {
    id: zone.zone_id,
    title: zone.title,
    description: zone.description,
    map: zone.map,
  };
}