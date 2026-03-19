/**
 * Form Permissions
 * Permissions สำหรับระบบแบบสอบถามของบูธ
 * Pattern เดียวกับ canViewDocuments / canViewProducts / canViewQueue
 * → ดูได้ทุก role ยกเว้น booth_staff_visitor
 * → จัดการได้เฉพาะ organizer + booth_staff ที่ isAssignedStaff
 */

import type { EventRole } from '@/src/features/events/types/event.types';

// ============================================
// VIEW
// ============================================

/**
 * ดูแบบสอบถามได้ — ทุก role ยกเว้น booth_staff_visitor
 * เหมือน canViewDocuments / canViewProducts / canViewQueue
 */
export function canViewForms(userRole: EventRole | undefined): boolean {
  if (!userRole) return false;
  if (userRole === 'booth_staff_visitor') return false;
  return true;
}

// ============================================
// MANAGE (สร้าง / แก้ไข / ลบ / publish)
// ============================================

/**
 * จัดการแบบสอบถามได้ — organizer ทุก role + booth_staff ที่ isAssignedStaff
 */
export function canManageForms(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  if (!userRole) return false;
  if (userRole === 'booth_staff_visitor') return false;
  if (['system_admin', 'owner', 'admin', 'staff'].includes(userRole)) return true;
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

export function canToggleFormStatus(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageForms(userRole, isAssignedStaff);
}

export function canViewFormResults(userRole: EventRole | undefined, isAssignedStaff: boolean): boolean {
  return canManageForms(userRole, isAssignedStaff);
}

/**
 * รวม permissions ทั้งหมด
 */
export function getFormPermissions(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
) {
  return {
    canView:         canViewForms(userRole),
    canManage:       canManageForms(userRole, isAssignedStaff),
    canCreate:       canCreateForm(userRole, isAssignedStaff),
    canEdit:         canEditForm(userRole, isAssignedStaff),
    canDelete:       canDeleteForm(userRole, isAssignedStaff),
    canToggleStatus: canToggleFormStatus(userRole, isAssignedStaff),
    canViewResults:  canViewFormResults(userRole, isAssignedStaff),
  };
}