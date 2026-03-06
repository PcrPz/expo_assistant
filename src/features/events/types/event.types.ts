// src/features/events/types/event.types.ts

// ============================================
// Event Role Types
// ============================================

export type EventRole = 
  | 'system_admin'        // ระดับสูงสุด - จัดการระบบ
  | 'owner'               // เจ้าของงาน - คนสร้างงาน (มีเพียงคนเดียว)
  | 'admin'               // ผู้จัดการ - จัดการงาน
  | 'staff'               // เจ้าหน้าที่
  | 'event_staff'         // เจ้าหน้าที่งาน
  | 'booth_staff'         // ผู้ออกบูธ (ชำระเงินแล้ว มีบูธในงาน)
  | 'booth_staff_visitor' // booth_manager ที่เข้าดูข้อมูลงาน (read-only)
  | null
  | undefined;

// ============================================
// Zone Interface - ตรงกับ Backend
// ============================================

export interface Zone {
  zone_id: string;           // ← Backend ใช้ zone_id (ไม่ใช่ id)
  title: string;             // ← Backend ใช้ title (ไม่ใช่ name)
  description?: string | null;
  map?: string | null;
}

// ============================================
// Event Interface
// ============================================

export interface Event {
  id: string;
  expoID: string;
  name: string;
  title: string;
  category: string;
  startDate: string;
  start_date: string;
  endDate: string;
  end_date: string;
  startTime?: string;
  start_time?: string;
  endTime?: string;
  end_time?: string;
  time?: string;
  location: string;
  address: string;
  organizer?: string;
  email?: string;
  tel?: string;
  description?: string;
  detail?: string;
  website1?: string;
  website2?: string;
  status: string;
  thumbnail?: string;
  logo?: string;
  banner?: string;
  map?: string;
  role?: EventRole;
  zones?: Zone[];  // ← ใช้ Zone interface ที่แก้แล้ว
}

// ============================================
// Create Event Request
// ============================================

export interface CreateEventRequest {
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  location: string;
  organizer?: string;
  email?: string;
  tel?: string;
  description?: string;
  website1?: string;
  website2?: string;
  logoFile?: File;
  bannerFile?: File;
  imageFiles?: File[];
  zones?: Zone[];
  thumbnail?: string;  // path เดิม
  map?: string;        // path เดิม
}

// ============================================
// Create Event Response
// ============================================

export interface CreateEventResponse {
  expoID: string;
  message?: string;
}

// ============================================
// Role Helper Functions
// ============================================

export function isEventOrganizer(role: EventRole): boolean {
  return ['system_admin', 'owner', 'admin', 'staff', 'event_staff'].includes(role || '');
}

export function isBoothStaff(role: EventRole): boolean {
  return role === 'booth_staff';
}

// ✅ booth_staff_visitor = booth_manager ที่ดูข้อมูลงานได้อย่างเดียว
export function isBoothStaffVisitor(role: EventRole): boolean {
  return role === 'booth_staff_visitor';
}

// ✅ ทั้ง booth_staff และ booth_staff_visitor ถือว่าเป็น booth side
export function isBoothSide(role: EventRole): boolean {
  return role === 'booth_staff' || role === 'booth_staff_visitor';
}

export function canEditEvent(role: EventRole): boolean {
  return ['system_admin', 'owner', 'admin'].includes(role || '');
}

export function canManageAllStaff(role: EventRole): boolean {
  return ['system_admin', 'owner'].includes(role || '');
}

export function canManageStaff(role: EventRole): boolean {
  return ['system_admin', 'owner', 'admin', 'staff'].includes(role || '');
}

export function canAddAdmin(role: EventRole): boolean {
  return ['system_admin', 'owner', 'admin'].includes(role || '');
}

export function canEditAdmin(role: EventRole): boolean {
  return ['system_admin', 'owner'].includes(role || '');
}

export function canChangeStaffRole(userRole: EventRole, targetRole: EventRole): boolean {
  if (userRole === 'system_admin') return true;
  if (userRole === 'owner' && targetRole !== 'system_admin') return true;
  if (userRole === 'admin' && ['staff', 'event_staff', 'booth_staff'].includes(targetRole || '')) {
    return true;
  }
  if (userRole === 'staff' && ['event_staff', 'booth_staff'].includes(targetRole || '')) {
    return true;
  }
  return false;
}

export function canRemoveStaff(userRole: EventRole, targetStaffRole: EventRole): boolean {
  if (userRole === 'system_admin') return true;
  if (userRole === 'owner' && targetStaffRole !== 'system_admin') return true;
  if (userRole === 'admin' && !['admin', 'owner', 'system_admin'].includes(targetStaffRole || '')) {
    return true;
  }
  if (userRole === 'staff' && ['event_staff', 'booth_staff'].includes(targetStaffRole || '')) {
    return true;
  }
  return false;
}

export function getAvailableTabs(role: EventRole): Array<'detail' | 'staff' | 'booth' | 'dashboard' | 'applications'> {
  if (isEventOrganizer(role)) {
    return ['detail', 'staff', 'booth', 'dashboard', 'applications'];
  }
  if (isBoothStaff(role)) {
    return ['detail', 'dashboard', 'booth'];
  }
  // ✅ booth_staff_visitor ดูได้แค่ detail อย่างเดียว
  if (isBoothStaffVisitor(role)) {
    return ['detail'];
  }
  return ['detail'];
}

// ============================================
// Normalize Event Data from Backend
// ============================================

// เพิ่มใน normalizeEvent function (ท้ายสุดก่อน return)

export function normalizeEvent(data: any): Event {
  // 🔍 เพิ่มบรรทัดนี้เพื่อ debug
  console.log('🔍 normalizeEvent called!');
  console.log('🔍 Raw data.zones:', data.zones || data.Zones);
  
  const result = {
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
  
  // 🔍 เพิ่มบรรทัดนี้เพื่อ debug
  console.log('🔍 Normalized zones:', result.zones);
  console.log('🔍 First zone:', result.zones[0]);
  
  return result;
}