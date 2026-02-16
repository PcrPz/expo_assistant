/**
 * Form Permissions
 * Permissions สำหรับระบบแบบสอบถามของบูธ
 */

import type { EventRole } from '@/src/features/events/types/event.types';

// ============================================
// FORM PERMISSIONS
// ============================================

/**
 * สามารถดูแบบสอบถามได้
 * Booth Staff → เห็นได้ทั้ง publish/unpublish
 * Visitor → เห็นได้เฉพาะ publish (แต่ไม่ทำใน Web)
 */
export function canViewForm(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  if (!userRole) return false;
  
  // System Admin, Owner, Admin, Staff → ดูได้ทั้งหมด
  if (['system_admin', 'owner', 'admin', 'staff'].includes(userRole)) {
    return true;
  }

  // Booth Staff → ดูได้เฉพาะบูธตัวเอง
  if (userRole === 'booth_staff') {
    return isAssignedStaff;
  }

  return false;
}

/**
 * สามารถจัดการแบบสอบถามได้ (สร้าง/แก้ไข/ลบ)
 */
export function canManageForms(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  if (!userRole) return false;
  
  // System Admin, Owner, Admin, Staff → จัดการได้ทุกบูธ
  if (['system_admin', 'owner', 'admin', 'staff'].includes(userRole)) {
    return true;
  }

  // Booth Staff → จัดการได้เฉพาะบูธตัวเอง
  if (userRole === 'booth_staff') {
    return isAssignedStaff;
  }

  return false;
}

/**
 * สามารถสร้างแบบสอบถามได้
 */
export function canCreateForm(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageForms(userRole, isAssignedStaff);
}

/**
 * สามารถแก้ไขแบบสอบถามได้
 */
export function canEditForm(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageForms(userRole, isAssignedStaff);
}

/**
 * สามารถลบแบบสอบถามได้
 */
export function canDeleteForm(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageForms(userRole, isAssignedStaff);
}

/**
 * สามารถเปลี่ยนสถานะ publish/unpublish ได้
 */
export function canToggleFormStatus(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageForms(userRole, isAssignedStaff);
}

/**
 * สามารถดูผลสรุปคำตอบได้
 */
export function canViewFormResults(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageForms(userRole, isAssignedStaff);
}

/**
 * รวม permissions ทั้งหมดในออบเจ็กต์เดียว
 */
export function getFormPermissions(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
) {
  return {
    canView: canViewForm(userRole, isAssignedStaff),
    canManage: canManageForms(userRole, isAssignedStaff),
    canCreate: canCreateForm(userRole, isAssignedStaff),
    canEdit: canEditForm(userRole, isAssignedStaff),
    canDelete: canDeleteForm(userRole, isAssignedStaff),
    canToggleStatus: canToggleFormStatus(userRole, isAssignedStaff),
    canViewResults: canViewFormResults(userRole, isAssignedStaff),
  };
}