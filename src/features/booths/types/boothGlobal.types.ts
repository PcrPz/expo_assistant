// src/features/booths/types/boothGlobal.types.ts

// ─── Booth In Expo (from API response) ───────────────────────
export interface BoothInExpo {
  expoID: string
  expoTitle: string
  expoThumbnail?: string | null   // ⭐ เพิ่ม
  boothID: string
  boothNo: string
  type: string
  title: string
  hall?: string
  zoneName?: string
  price?: string | number        // ⭐ เพิ่ม
  status?: string                // ⭐ เพิ่ม
  thumbnail?: string
}

// ─── Booth Global ─────────────────────────────────────────────
export interface BoothGlobal {
  id: string;
  title: string;
  detail?: string;
  company: string;
  email: string;
  tel: string;
  website1?: string;
  website2?: string;
  profilePic?: string;
  booth?: BoothInExpo[];
}

// ─── Booth Global Staff ───────────────────────────────────────
export interface BoothGlobalStaff {
  userId: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  status: string;
}

// ─── Requests ─────────────────────────────────────────────────
export interface CreateBoothGlobalRequest {
  title: string;
  detail?: string;
  company: string;
  email: string;
  tel: string;
  website1?: string;
  website2?: string;
  profile_pic?: File;
}

export interface InviteBoothStaffRequest {
  email: string;
}

// ─── Results ──────────────────────────────────────────────────
export interface JoinBoothByCodeResult {
  success: boolean;
  message: string;
  boothGroupId?: string;
}

// ============================================================
// Phase 2: Event Participation Types
// ============================================================

// ─── Join Form ────────────────────────────────────────────────

export type JoinFormStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
export type JoinFormType = 'request_to_join' | 'invite_to_join';

export interface JoinForm {
  expoId: string;
  expoTitle: string;
  boothId: string;
  boothNo: string;
  boothGroupId: string;
  boothGroupTitle: string;
  requestId: string;
  type: JoinFormType;
  detail: string | null;
  status: JoinFormStatus;
  paymentId?: string | null; // มีเมื่อ accepted + checkout แล้ว (หมดอายุใน 15 นาที)
}

// ─── Available Booth ──────────────────────────────────────────

export type AvailableBoothStatus = 'available' | 'unavailable' | 'pending' | 'reserved';

export interface AvailableBooth {
  boothId: string;
  boothNo: string;
  type: string;
  price: number;
  status: AvailableBoothStatus;
  hall: string;
  zoneId: string;
  zoneName: string;
}

// ─── Expo Search ──────────────────────────────────────────────

export interface ExpoSearchResult {
  id: string;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  thumbnail: string | null;
  status: string;
}

export interface ExpoSearchResponse {
  expos: ExpoSearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Apply to Join ────────────────────────────────────────────

export interface ApplyToJoinRequest {
  booth_id: string;
  booth_group_id: string;
  detail?: string;
}

export interface ApplyToJoinResponse {
  requestId: string;
}

// ─── Payment ──────────────────────────────────────────────────

export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'qr_code';

export interface CheckoutResponse {
  paymentId: string;
}

// ============================================================
// Phase 3: Organizer — Explore & Invite BoothGroup
// ============================================================

// ─── BoothGroup Search (Organizer ค้นหาบูธเพื่อเชิญ) ─────────

export interface BoothGroupSearchItem {
  id: string;       // จาก ID
  title: string;    // จาก Title
  company: string;  // จาก Company
  profilePic: string | null; // จาก ProfilePic
}

export interface BoothGroupSearchResponse {
  boothGroups: BoothGroupSearchItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Invite BoothGroup (Organizer เชิญบูธเข้างาน) ────────────

export interface InviteBoothGroupRequest {
  booth_id: string;
  booth_group_id: string;
  detail?: string;
}

export interface InviteBoothGroupResponse {
  requestId: string;
}

// ─── Join Forms By Expo (Organizer ดูคำขอทั้งหมดในงาน) ───────

export interface JoinFormByExpo {
  expoId: string;
  expoTitle: string;
  boothId: string;
  boothNo: string;
  boothGroupId: string;
  boothGroupTitle: string;
  requestId: string;
  type: JoinFormType;       // 'request_to_join' | 'invite_to_join'
  detail: string | null;
  status: JoinFormStatus;   // 'pending' | 'accepted' | 'rejected' | 'completed'
  paymentId?: string | null; // มีเมื่อ accepted + checkout แล้ว (หมดอายุใน 15 นาที)
}

// ─── Respond Join Booth (Organizer อนุมัติ/ปฏิเสธ) ───────────

export interface RespondJoinBoothRequest {
  accept: boolean;
}