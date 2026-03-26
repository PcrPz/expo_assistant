// src/features/booths/types/booth.types.ts

// ============================================================================
// BASE TYPES
// ============================================================================

export type BoothType = "booth" | "stage";

// ✅ Booth Status (ใหม่)
export type BoothStatus = "available" | "unavailable" | "pending" | "reserved";

export interface Booth {
  booth_id: string;
  expo_id: string;
  booth_no: string;
  type: BoothType;
  price: string;            // ← เพิ่มใหม่
  status: BoothStatus;      // ← เพิ่มใหม่
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
  booth_group_id: string | null;  // ← เพิ่มใหม่
  created_at: string;
  updated_at: string;
}

export interface CreateBoothRequest {
  booth_no: string;
  type: BoothType;
  price: string;    // ← เพิ่มใหม่ (required)
  status: string;   // ← เพิ่มใหม่ (default: "available")
  hall?: string;
  zone_id?: string;
}

export interface UpdateBoothRequest {
  booth_no: string;
  type: BoothType;
  price?: string;         // ← เพิ่มใหม่
  status?: string;        // ← เพิ่มใหม่
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
// BOOTH STAFF TYPES
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
// CONSTANTS
// ============================================================================

export const BOOTH_TYPES = [
  { value: 'booth' as BoothType, label: 'บูธ', icon: '🏪' },
  { value: 'stage' as BoothType, label: 'เวที', icon: '🎭' },
];

export const BOOTH_TYPE_LABELS: Record<BoothType, string> = {
  booth: "บูธ",
  stage: "เวที",
};

export const BOOTH_TYPE_COLORS: Record<BoothType, string> = {
  booth: "bg-blue-100 text-blue-700",
  stage: "bg-orange-100 text-orange-700",
};

// ✅ Booth Status Labels (ใหม่)
export const BOOTH_STATUS_LABELS: Record<BoothStatus, string> = {
  available:   "ว่าง",
  unavailable: "ไม่เปิดรับ",
  pending:     "รอชำระเงิน",
  reserved:    "จองแล้ว",
};

// ✅ Options สำหรับ Create/Edit (แค่ 2 ตัวแรกที่ organizer เลือกได้)
export const BOOTH_STATUS_OPTIONS = [
  { value: 'available',   label: 'ว่าง (เปิดรับคำขอ)' },
  { value: 'unavailable', label: 'ไม่เปิดรับ (เชิญได้อย่างเดียว)' },
];