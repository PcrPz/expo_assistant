// src/features/booths/utils/permissions.ts

import type { EventRole } from '@/src/features/events/types/event.types';

/**
 * ✅ Permission System สำหรับ Booth Management
 * รองรับ undefined สำหรับทุก EventRole parameters
 */

// ============================================
// BOOTH CRUD PERMISSIONS
// ============================================

/**
 * สามารถสร้างบูธได้
 */
export function canCreateBooth(userRole: EventRole | undefined): boolean {
  if (!userRole) return false;
  return ['system_admin', 'owner', 'admin'].includes(userRole);
}

/**
 * สามารถแก้ไขบูธได้
 */
export function canEditBooth(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  if (!userRole) return false;
  
  if (['system_admin', 'owner', 'admin', 'staff'].includes(userRole)) {
    return true;
  }

  if (userRole === 'booth_staff') {
    return isAssignedStaff;
  }

  return false;
}

/**
 * สามารถลบบูธได้
 */
export function canDeleteBooth(userRole: EventRole | undefined): boolean {
  if (!userRole) return false;
  return ['system_admin', 'owner', 'admin'].includes(userRole);
}

/**
 * สามารถดูบูธได้
 */
export function canViewBooth(userRole: EventRole | undefined): boolean {
  return true;
}

// ============================================
// BOOTH STAFF MANAGEMENT PERMISSIONS
// ============================================

/**
 * สามารถจัดการ Booth Staff ได้ (เชิญ/ลบ)
 */
export function canManageBoothStaff(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  if (!userRole) return false;
  
  if (['system_admin', 'owner', 'admin', 'staff'].includes(userRole)) {
    return true;
  }

  if (userRole === 'booth_staff') {
    return isAssignedStaff;
  }

  return false;
}

/**
 * สามารถเชิญ Staff เข้าบูธได้
 */
export function canAddStaffToBooth(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageBoothStaff(userRole, isAssignedStaff);
}

/**
 * สามารถลบ Staff ออกจากบูธได้
 * ✅ ใช้ Email แทน UserID
 */
export function canRemoveStaffFromBooth(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean,
  targetStaffEmail: string | undefined,
  currentUserEmail: string | undefined
): boolean {
  if (!userRole) return false;
  if (!targetStaffEmail) return false;
  
  // System Admin, Owner, Admin, Staff → ลบใครก็ได้
  if (['system_admin', 'owner', 'admin', 'staff'].includes(userRole)) {
    return true;
  }

  // Booth Staff → ลบคนอื่นได้ แต่ลบตัวเองไม่ได้
  if (userRole === 'booth_staff' && isAssignedStaff && currentUserEmail) {
    return targetStaffEmail !== currentUserEmail;
  }

  return false;
}

// ============================================
// TAB VISIBILITY PERMISSIONS
// ============================================

/**
 * สามารถเห็น Staff Tab ได้
 */
export function canViewStaffTab(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageBoothStaff(userRole, isAssignedStaff);
}

/**
 * สามารถเห็น Documents/Products/Announcements Tabs ได้
 */
export function canViewContentTabs(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  if (!userRole) return true; // ให้ดูได้
  
  if (['system_admin', 'owner', 'admin', 'staff'].includes(userRole)) {
    return true;
  }

  return true;
}

/**
 * สามารถแก้ไขเนื้อหา (Documents/Products/Announcements) ได้
 */
export function canEditContent(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  if (!userRole) return false;
  
  if (['system_admin', 'owner', 'admin', 'staff'].includes(userRole)) {
    return true;
  }

  if (userRole === 'booth_staff') {
    return isAssignedStaff;
  }

  return false;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * รวม permissions ทั้งหมดในออบเจ็กต์เดียว
 */
export function getBoothPermissions(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean,
  currentUserEmail?: string | undefined
) {
  return {
    canView: canViewBooth(userRole),
    canCreate: canCreateBooth(userRole),
    canEdit: canEditBooth(userRole, isAssignedStaff),
    canDelete: canDeleteBooth(userRole),
    canManageStaff: canManageBoothStaff(userRole, isAssignedStaff),
    canAddStaff: canAddStaffToBooth(userRole, isAssignedStaff),
    canRemoveStaff: (targetStaffEmail: string) =>
      canRemoveStaffFromBooth(userRole, isAssignedStaff, targetStaffEmail, currentUserEmail),
    canViewStaffTab: canViewStaffTab(userRole, isAssignedStaff),
    canViewContentTabs: canViewContentTabs(userRole, isAssignedStaff),
    canEditContent: canEditContent(userRole, isAssignedStaff),
  };
}

/**
 * Check ว่า user เป็น organizer หรือไม่
 */
export function isOrganizer(userRole: EventRole | undefined): boolean {
  if (!userRole) return false;
  return ['system_admin', 'owner', 'admin', 'staff'].includes(userRole);
}

/**
 * Check ว่า user เป็น booth staff ของบูธนี้หรือไม่
 * ✅ ใช้ Email แทน UserID
 */
export function isUserAssignedToBooth(
  userEmail: string | undefined,
  boothStaffList: Array<{ email: string; is_staff: boolean }>
): boolean {
  if (!userEmail) return false;
  
  return boothStaffList.some(
    (staff) => staff.email === userEmail && staff.is_staff
  );
}

// src/features/booths/utils/permissions.ts
// ✅ เพิ่มส่วนนี้เข้าไปใน permissions.ts ที่มีอยู่แล้ว

// ============================================
// DOCUMENT PERMISSIONS
// ============================================

/**
 * สามารถดูเอกสารได้
 * ทุกคนดูได้หมด
 */
export function canViewDocuments(userRole: EventRole | undefined): boolean {
  return true;
}

/**
 * สามารถจัดการเอกสารได้ (เพิ่ม/แก้ไข/ลบ)
 * 
 * Permission Matrix:
 * - System Admin/Owner/Admin/Staff → จัดการได้ทุกบูธ
 * - Booth Staff → จัดการได้เฉพาะบูธตัวเอง
 * 
 * @param userRole - บทบาทของ user
 * @param isAssignedStaff - true ถ้า user เป็น staff ของบูธนี้
 */
export function canManageDocuments(
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
 * สามารถเพิ่มเอกสารได้
 */
export function canCreateDocument(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageDocuments(userRole, isAssignedStaff);
}

/**
 * สามารถแก้ไขเอกสารได้
 */
export function canEditDocument(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageDocuments(userRole, isAssignedStaff);
}

/**
 * สามารถลบเอกสารได้
 */
export function canDeleteDocument(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageDocuments(userRole, isAssignedStaff);
}

/**
 * สามารถ Publish/Unpublish เอกสารได้
 */
export function canPublishDocument(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageDocuments(userRole, isAssignedStaff);
}

/**
 * สามารถ Download เอกสารได้
 * ทุกคนดาวน์โหลดได้
 */
export function canDownloadDocument(userRole: EventRole | undefined): boolean {
  return true;
}


/**
 * Product Permissions
 * Permission Matrix เหมือนกับ Documents
 */

/**
 * Check if user can view products
 * ทุกคนดูได้
 */
export function canViewProducts(role?: EventRole): boolean {
  return true;
}

/**
 * Check if user can manage products (create/edit/delete)
 * System Admin, Owner, Admin, Staff: ทุกบูธ
 * Booth Staff: เฉพาะบูธตัวเอง
 */
export function canManageProducts(
  role?: EventRole,
  isAssignedStaff?: boolean
): boolean {
  // ตรวจสอบ role ก่อน
  if (!role) return false;
  
  // Default isAssignedStaff = false ถ้าไม่ได้ส่งมา
  const assigned = isAssignedStaff ?? false;
  
  // System Admin, Owner, Admin, Staff: จัดการได้ทุกบูธ
  if (['system_admin', 'owner', 'admin', 'staff'].includes(role)) {
    return true;
  }
  
  // Booth Staff: จัดการได้เฉพาะบูธตัวเอง
  if (role === 'booth_staff' && assigned) {
    return true;
  }
  
  return false;
}

/**
 * Check if user can create product
 */
export function canCreateProduct(
  role?: EventRole,
  isAssignedStaff?: boolean
): boolean {
  return canManageProducts(role, isAssignedStaff);
}

/**
 * Check if user can edit product
 */
export function canEditProduct(
  role?: EventRole,
  isAssignedStaff?: boolean
): boolean {
  return canManageProducts(role, isAssignedStaff);
}

/**
 * Check if user can delete product
 */
export function canDeleteProduct(
  role?: EventRole,
  isAssignedStaff?: boolean
): boolean {
  return canManageProducts(role, isAssignedStaff);
}

// ============================================
// ANNOUNCEMENT PERMISSIONS
// ============================================

/**
 * สามารถดูประกาศได้
 * ทุกคนดูได้หมด
 */
export function canViewAnnouncements(userRole: EventRole | undefined): boolean {
  return true;
}

/**
 * สามารถจัดการประกาศได้ (เพิ่ม/แก้ไข/ลบ)
 * 
 * Permission Matrix:
 * - System Admin/Owner/Admin/Staff → จัดการได้ทุกบูธ
 * - Booth Staff → จัดการได้เฉพาะบูธตัวเอง
 */
export function canManageAnnouncements(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  if (!userRole) return false;
  
  if (['system_admin', 'owner', 'admin', 'staff'].includes(userRole)) {
    return true;
  }

  if (userRole === 'booth_staff') {
    return isAssignedStaff;
  }

  return false;
}

/**
 * สามารถสร้างประกาศได้
 */
export function canCreateAnnouncement(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageAnnouncements(userRole, isAssignedStaff);
}

/**
 * สามารถแก้ไขประกาศได้
 */
export function canEditAnnouncement(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageAnnouncements(userRole, isAssignedStaff);
}

/**
 * สามารถลบประกาศได้
 */
export function canDeleteAnnouncement(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageAnnouncements(userRole, isAssignedStaff);
}

/**
 * สามารถ Publish/Unpublish ประกาศได้
 */
export function canPublishAnnouncement(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageAnnouncements(userRole, isAssignedStaff);
}


// ============================================
// QUEUE PERMISSIONS (ใหม่!)
// ============================================

/**
 * สามารถดูคิวได้
 * ทุกคนดูได้หมด (แต่ฝั่ง User ไม่ได้ทำ UI)
 */
export function canViewQueue(
  userRole: EventRole | undefined
): boolean {
  return true;
}

/**
 * สามารถจัดการคิวได้ (เพิ่ม/แก้ไข/ลบ/จัดการ)
 * 
 * Permission Matrix:
 * - System Admin/Owner/Admin/Staff → จัดการได้ทุกบูธ
 * - Booth Staff → จัดการได้เฉพาะบูธตัวเอง
 */
export function canManageQueue(
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
 * สามารถสร้างคิวได้
 */
export function canCreateQueue(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageQueue(userRole, isAssignedStaff);
}

/**
 * สามารถแก้ไขคิวได้ (ชื่อ, สถานะ)
 */
export function canEditQueue(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageQueue(userRole, isAssignedStaff);
}

/**
 * สามารถลบคิวได้
 */
export function canDeleteQueue(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageQueue(userRole, isAssignedStaff);
}

/**
 * สามารถจัดการคิวปัจจุบันได้ (Skip/Complete)
 */
export function canCallNextQueue(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageQueue(userRole, isAssignedStaff);
}

/**
 * สามารถเปลี่ยนสถานะคิวได้ (Publish/Unpublish)
 */
export function canToggleQueueStatus(
  userRole: EventRole | undefined,
  isAssignedStaff: boolean
): boolean {
  return canManageQueue(userRole, isAssignedStaff);
}
