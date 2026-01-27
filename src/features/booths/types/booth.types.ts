// src/features/booths/types/booth.types.ts

// ============================================================================
// BASE TYPES
// ============================================================================

export type BoothType = "small_booth" | "big_booth" | "stage";

export interface Booth {
  booth_id: string;
  expo_id: string;
  booth_no: string;
  type: BoothType;
  title: string | null;
  detail: string | null;
  company: string | null;
  hall: string | null;
  zone_id: string;
  zone_name: string | null;
  email: string | null;
  tel: string | null;
  website1: string | null;
  website2: string | null;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBoothRequest {
  booth_no: string;
  type: BoothType;
  title?: string;
  detail?: string;
  company?: string;
  hall?: string;
  zone_id?: string;
  email?: string;
  tel?: string;
  website1?: string;
  website2?: string;
}

export interface UpdateBoothRequest {
  booth_no: string;
  type: BoothType;
  title?: string | null;
  detail?: string | null;
  company?: string | null;
  hall?: string | null;
  zone_id?: string;
  email?: string | null;
  tel?: string | null;
  website1?: string | null;
  website2?: string | null;
}

// ============================================================================
// 🆕 BOOTH STAFF TYPES
// ============================================================================

export interface BoothStaff {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  status: string;
  is_staff: boolean;
}

export interface AssignStaffRequest {
  booth_id: string;
  add_staff_list: string[];
  delete_staff_list: string[];
}

// ============================================================================
// CONSTANTS (เพิ่มเข้ามา - สำหรับ EditBoothModal)
// ============================================================================

export const BOOTH_TYPES = [
  { value: 'small_booth' as BoothType, label: 'บูธขนาดเล็ก', icon: '🏪' },
  { value: 'big_booth' as BoothType, label: 'บูธขนาดใหญ่', icon: '🏬' },
  { value: 'stage' as BoothType, label: 'เวที', icon: '🎭' },
];

export const BOOTH_TYPE_LABELS: Record<BoothType, string> = {
  small_booth: "บูธขนาดเล็ก",
  big_booth: "บูธขนาดใหญ่",
  stage: "เวที",
};

export const BOOTH_TYPE_COLORS: Record<BoothType, string> = {
  small_booth: "bg-blue-100 text-blue-700",
  big_booth: "bg-purple-100 text-purple-700",
  stage: "bg-orange-100 text-orange-700",
};