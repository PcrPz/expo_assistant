// src/features/booths/utils/permissions.ts

import type { EventRole } from '@/src/features/events/types/event.types';

/**
 * Permission System สำหรับ Booth Management
 *
 * Role Summary:
 * ─────────────────────────────────────────────────────────────
 *  system_admin / owner / admin  → จัดการได้ทุกอย่างทุกบูธ
 *  staff                         → จัดการได้ทุกอย่างทุกบูธ (ยกเว้น สร้าง/ลบบูธ)
 *  event_staff                   → ดูได้อย่างเดียว (read-only ทุก tab)
 *  booth_staff (assigned)        → จัดการได้เฉพาะบูธตัวเอง
 *  booth_staff (not assigned)    → ดูได้อย่างเดียว (read-only)
 *  booth_staff_visitor           → ไม่มีสิทธิ์เข้า booth detail เลย (block ที่ page)
 * ─────────────────────────────────────────────────────────────
 */

// ─── Role Groups ───────────────────────────────────────────────
const ORGANIZER_ROLES: EventRole[] = ['system_admin', 'owner', 'admin'];
const ALL_MANAGE_ROLES: EventRole[] = ['system_admin', 'owner', 'admin', 'staff'];
const READ_ONLY_ROLES: EventRole[]  = ['event_staff', 'booth_staff_visitor'];

// ─── Helper ────────────────────────────────────────────────────

/** เป็น role ที่จัดการได้ทุกบูธ */
function isFullManager(role: EventRole): boolean {
  return ALL_MANAGE_ROLES.includes(role);
}

/** เป็น role ที่ดูได้อย่างเดียว (ห้ามแก้ไขทุกอย่าง) */
function isReadOnly(role: EventRole): boolean {
  return READ_ONLY_ROLES.includes(role);
}

// ============================================================
// BOOTH CRUD
// ============================================================

/** สร้างบูธ — เฉพาะ organizer เท่านั้น */
export function canCreateBooth(userRole: EventRole | undefined): boolean {
  if (!userRole) return false;
  return ORGANIZER_ROLES.includes(userRole);
}

/** แก้ไขบูธ */
export function canEditBooth(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  if (!userRole) return false;
  if (isReadOnly(userRole)) return false;
  if (isFullManager(userRole)) return true;
  if (userRole === 'booth_staff') return isAssignedStaff;
  return false;
}

/** ลบบูธ — เฉพาะ organizer เท่านั้น */
export function canDeleteBooth(userRole: EventRole | undefined): boolean {
  if (!userRole) return false;
  return ORGANIZER_ROLES.includes(userRole);
}

/**
 * ดูบูธ
 * - booth_staff_visitor ไม่มีสิทธิ์ (ถูก block ที่ page level แล้ว แต่ใส่ไว้ครบ)
 * - ทุก role อื่นดูได้
 */
export function canViewBooth(userRole: EventRole | undefined): boolean {
  if (!userRole) return false;
  if (userRole === 'booth_staff_visitor') return false;
  return true;
}

// ============================================================
// BOOTH STAFF MANAGEMENT
// ============================================================

/** จัดการ staff (เชิญ/ลบ) */
export function canManageBoothStaff(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  if (!userRole) return false;
  if (isReadOnly(userRole)) return false;
  if (isFullManager(userRole)) return true;
  if (userRole === 'booth_staff') return isAssignedStaff;
  return false;
}

export function canAddStaffToBooth(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageBoothStaff(userRole, isAssignedStaff);
}

/** ลบ staff — booth_staff ลบตัวเองไม่ได้ */
export function canRemoveStaffFromBooth(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean,
  targetStaffEmail: string | undefined,
  currentUserEmail: string | undefined
): boolean {
  if (!userRole) return false;
  if (!targetStaffEmail) return false;
  if (isReadOnly(userRole)) return false;
  if (isFullManager(userRole)) return true;
  if (userRole === 'booth_staff' && isAssignedStaff && currentUserEmail) {
    return targetStaffEmail !== currentUserEmail;
  }
  return false;
}

// ============================================================
// TAB VISIBILITY
// ============================================================

/** Staff Tab */
export function canViewStaffTab(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageBoothStaff(userRole, isAssignedStaff);
}

/** Documents / Products / Announcements / Queue Tabs
 *  ทุกคนดูได้ ยกเว้น booth_staff_visitor (ถูก block ก่อนถึง tab แล้ว)
 */
export function canViewContentTabs(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  if (!userRole) return false;
  if (userRole === 'booth_staff_visitor') return false;
  return true;
}

// ============================================================
// DOCUMENTS
// ============================================================

export function canViewDocuments(userRole: EventRole | undefined): boolean {
  if (!userRole) return false;
  if (userRole === 'booth_staff_visitor') return false;
  return true;
}

export function canManageDocuments(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  if (!userRole) return false;
  if (isReadOnly(userRole)) return false;
  if (isFullManager(userRole)) return true;
  if (userRole === 'booth_staff') return isAssignedStaff;
  return false;
}

export function canCreateDocument(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageDocuments(userRole, isAssignedStaff);
}

export function canEditDocument(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageDocuments(userRole, isAssignedStaff);
}

export function canDeleteDocument(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageDocuments(userRole, isAssignedStaff);
}

export function canPublishDocument(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageDocuments(userRole, isAssignedStaff);
}

export function canDownloadDocument(userRole: EventRole | undefined): boolean {
  if (!userRole) return false;
  if (userRole === 'booth_staff_visitor') return false;
  return true;
}

// ============================================================
// PRODUCTS
// ============================================================

export function canViewProducts(role?: EventRole): boolean {
  if (!role) return false;
  if (role === 'booth_staff_visitor') return false;
  return true;
}

export function canManageProducts(role?: EventRole, isAssignedStaff?: boolean): boolean {
  if (!role) return false;
  if (isReadOnly(role)) return false;
  if (isFullManager(role)) return true;
  if (role === 'booth_staff') return isAssignedStaff ?? false;
  return false;
}

export function canCreateProduct(role?: EventRole, isAssignedStaff?: boolean): boolean {
  return canManageProducts(role, isAssignedStaff);
}

export function canEditProduct(role?: EventRole, isAssignedStaff?: boolean): boolean {
  return canManageProducts(role, isAssignedStaff);
}

export function canDeleteProduct(role?: EventRole, isAssignedStaff?: boolean): boolean {
  return canManageProducts(role, isAssignedStaff);
}

// ============================================================
// ANNOUNCEMENTS
// ============================================================

export function canViewAnnouncements(userRole: EventRole | undefined): boolean {
  if (!userRole) return false;
  if (userRole === 'booth_staff_visitor') return false;
  return true;
}

export function canManageAnnouncements(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  if (!userRole) return false;
  if (isReadOnly(userRole)) return false;
  if (isFullManager(userRole)) return true;
  if (userRole === 'booth_staff') return isAssignedStaff;
  return false;
}

export function canCreateAnnouncement(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageAnnouncements(userRole, isAssignedStaff);
}

export function canEditAnnouncement(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageAnnouncements(userRole, isAssignedStaff);
}

export function canDeleteAnnouncement(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageAnnouncements(userRole, isAssignedStaff);
}

export function canPublishAnnouncement(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageAnnouncements(userRole, isAssignedStaff);
}

// ============================================================
// QUEUE
// ============================================================

export function canViewQueue(userRole: EventRole | undefined): boolean {
  if (!userRole) return false;
  if (userRole === 'booth_staff_visitor') return false;
  return true;
}

export function canManageQueue(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  if (!userRole) return false;
  if (isReadOnly(userRole)) return false;
  if (isFullManager(userRole)) return true;
  if (userRole === 'booth_staff') return isAssignedStaff;
  return false;
}

export function canCreateQueue(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageQueue(userRole, isAssignedStaff);
}

export function canEditQueue(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageQueue(userRole, isAssignedStaff);
}

export function canDeleteQueue(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageQueue(userRole, isAssignedStaff);
}

export function canCallNextQueue(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageQueue(userRole, isAssignedStaff);
}

export function canToggleQueueStatus(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageQueue(userRole, isAssignedStaff);
}

// ============================================================
// FORMS / SURVEY
// ============================================================

export function canViewForms(userRole: EventRole | undefined): boolean {
  if (!userRole) return false;
  if (userRole === 'booth_staff_visitor') return false;
  return true;
}

export function canManageForms(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  if (!userRole) return false;
  if (isReadOnly(userRole)) return false;
  if (isFullManager(userRole)) return true;
  if (userRole === 'booth_staff') return isAssignedStaff;
  return false;
}

export function canCreateForm(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageForms(userRole, isAssignedStaff);
}

export function canEditForm(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageForms(userRole, isAssignedStaff);
}

export function canDeleteForm(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageForms(userRole, isAssignedStaff);
}

export function canViewFormResponses(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  if (!userRole) return false;
  if (userRole === 'booth_staff_visitor') return false;
  if (isFullManager(userRole)) return true;
  if (userRole === 'booth_staff') return isAssignedStaff;
  return false;
}

// ============================================================
// HELPERS
// ============================================================

/** รวม permissions ทั้งหมดในออบเจ็กต์เดียว */
// ─── Events ───────────────────────────────────────────────────────────────────
export function canViewEvents(userRole: EventRole | undefined): boolean {
  return true; // ทุก role ที่ผ่านเข้ามาดูได้
}

export function canManageEvents(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  if (!userRole) return false;
  if (ORGANIZER_ROLES.includes(userRole)) return true;
  if (userRole === 'booth_staff' && isAssignedStaff) return true;
  return false;
}

export function canCreateEvent(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageEvents(userRole, isAssignedStaff);
}

export function canEditEvent(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageEvents(userRole, isAssignedStaff);
}

export function canDeleteEvent(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageEvents(userRole, isAssignedStaff);
}

export function getBoothPermissions(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean,
  currentUserEmail?: string | undefined
) {
  return {
    canView:            canViewBooth(userRole),
    canCreate:          canCreateBooth(userRole),
    canEdit:            canEditBooth(userRole, isAssignedStaff),
    canDelete:          canDeleteBooth(userRole),
    canManageStaff:     canManageBoothStaff(userRole, isAssignedStaff),
    canAddStaff:        canAddStaffToBooth(userRole, isAssignedStaff),
    canRemoveStaff:     (targetStaffEmail: string) =>
                          canRemoveStaffFromBooth(userRole, isAssignedStaff, targetStaffEmail, currentUserEmail),
    canViewStaffTab:    canViewStaffTab(userRole, isAssignedStaff),
    canViewContentTabs: canViewContentTabs(userRole, isAssignedStaff),
    // Documents
    canViewDocuments:   canViewDocuments(userRole),
    canManageDocuments: canManageDocuments(userRole, isAssignedStaff),
    // Products
    canViewProducts:    canViewProducts(userRole),
    canManageProducts:  canManageProducts(userRole, isAssignedStaff),
    // Announcements
    canViewAnnouncements:   canViewAnnouncements(userRole),
    canManageAnnouncements: canManageAnnouncements(userRole, isAssignedStaff),
    // Queue
    canViewQueue:    canViewQueue(userRole),
    canManageQueue:  canManageQueue(userRole, isAssignedStaff),
    // Forms
    canViewForms:         canViewForms(userRole),
    canManageForms:       canManageForms(userRole, isAssignedStaff),
    canViewFormResponses: canViewFormResponses(userRole, isAssignedStaff),
    // Events
    canViewEvents:    canViewEvents(userRole),
    canManageEvents:  canManageEvents(userRole, isAssignedStaff),
  };
}

/** เช็คว่าเป็น organizer หรือไม่ */
export function isOrganizer(userRole: EventRole | undefined): boolean {
  if (!userRole) return false;
  return ALL_MANAGE_ROLES.includes(userRole);
}

/**
 * @deprecated ระบบเก่า — ไม่ใช้แล้ว
 * ใช้ booth_group_id เทียบกัน ใน BoothDetailClient แทน
 */
export function isUserAssignedToBooth(
  userEmail: string | undefined,
  boothStaffList: Array<{ email: string; is_staff: boolean }>
): boolean {
  if (!userEmail) return false;
  return boothStaffList.some((staff) => staff.email === userEmail && staff.is_staff);
}