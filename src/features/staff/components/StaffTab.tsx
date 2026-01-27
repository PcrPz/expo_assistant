// src/features/staff/components/StaffTab.tsx (ปรับปรุง UI)
'use client';

import { useState } from 'react';
import { useStaff } from '../hooks/useStaff';
import { InviteStaffModal } from './InviteStaffModal';
import { EditRoleModal } from './EditRoleModal';
import { DeleteStaffModal } from './DeleteStaffModal';
import type { Staff } from '../api/staffApi';
import type { EventRole } from '@/src/features/events/types/event.types';
import { canRemoveStaff } from '@/src/features/events/types/event.types';

interface StaffTabProps {
  expoId: string;
  userRole?: EventRole;
  currentUserId?: string; // ✅ เพิ่ม prop สำหรับ current user id
}

export function StaffTab({ expoId, userRole, currentUserId }: StaffTabProps) {
  const {
    staffList,
    isLoading,
    error,
    inviteStaff,
    createInviteCode,
    changeRole,
    removeStaff,
    refetch,
    isInviting,
    isCreatingCode,
    inviteCode,
  } = useStaff(expoId);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ เช็คว่ามีสิทธิ์จัดการ Staff หรือไม่
  const canManageStaff = userRole === 'system_admin' || userRole === 'owner' || userRole === 'admin';
  
  // ✅ เช็คว่าเป็น view-only mode หรือไม่
  const isViewOnly = !canManageStaff;

  const handleInviteByEmail = (email: string, role: string) => {
    inviteStaff(
      { email, role },
      {
        onSuccess: () => {
          setShowInviteModal(false);
          alert('เชิญ Staff สำเร็จ');
        },
        onError: () => {
          alert('ไม่สามารถเชิญ Staff ได้');
        },
      }
    );
  };

  const handleCreateInviteCode = (role: string) => {
    createInviteCode({ role });
  };

  const handleChangeRole = (userId: string, newRole: string) => {
    changeRole(
      { user_id: userId, role: newRole },
      {
        onSuccess: () => {
          setEditingStaff(null);
          alert('เปลี่ยนบทบาทสำเร็จ');
        },
        onError: () => {
          alert('ไม่สามารถเปลี่ยนบทบาทได้');
        },
      }
    );
  };

  const handleRemoveStaff = async () => {
    if (!deletingStaff) return;
    
    setIsDeleting(true);
    removeStaff(deletingStaff.id, {
      onSuccess: () => {
        setDeletingStaff(null);
        setIsDeleting(false);
        alert('ลบ Staff สำเร็จ');
      },
      onError: () => {
        setIsDeleting(false);
        alert('ไม่สามารถลบ Staff ได้');
      },
    });
  };

  const getEditPermission = (staffRole: string): { canEdit: boolean; reason: string } => {
    if (userRole === 'system_admin' || userRole === 'owner') {
      return { canEdit: true, reason: '' };
    }
    
    if (userRole === 'admin') {
      if (['admin', 'owner', 'system_admin'].includes(staffRole)) {
        return { 
          canEdit: false, 
          reason: 'คุณไม่สามารถแก้ไข Admin, Owner หรือ System Admin ได้' 
        };
      }
      return { canEdit: true, reason: '' };
    }
    
    if (userRole === 'staff') {
      if (!['event_staff', 'booth_staff'].includes(staffRole)) {
        return { 
          canEdit: false, 
          reason: 'คุณสามารถแก้ไขได้เฉพาะ Event Staff และ Booth Staff' 
        };
      }
      return { canEdit: true, reason: '' };
    }
    
    return { canEdit: false, reason: 'คุณไม่มีสิทธิ์แก้ไข Staff คนนี้' };
  };

  const getDeletePermission = (staffRole: string): { canDelete: boolean; reason: string } => {
    const hasPermission = canRemoveStaff(userRole, staffRole as EventRole);
    
    if (hasPermission) {
      return { canDelete: true, reason: '' };
    }
    
    if (userRole === 'admin') {
      return { 
        canDelete: false, 
        reason: 'คุณไม่สามารถลบ Admin, Owner หรือ System Admin ได้' 
      };
    }
    
    if (userRole === 'staff') {
      return { 
        canDelete: false, 
        reason: 'คุณสามารถลบได้เฉพาะ Event Staff และ Booth Staff' 
      };
    }
    
    return { canDelete: false, reason: 'คุณไม่มีสิทธิ์ลบ Staff คนนี้' };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-[#3674B5]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-[#3674B5] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล Staff...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <p className="text-red-800 font-semibold text-center mb-2">เกิดข้อผิดพลาด</p>
          <p className="text-red-600 text-sm text-center mb-6">{error}</p>
          <button
            onClick={refetch}
            className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition shadow-lg"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#3674B5] to-[#498AC3]"></div>
        <div className="relative p-8 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">การจัดการ Staff</h2>
          <p className="text-blue-100">เพิ่มและจัดการสมาชิกในทีม</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">สมาชิกทั้งหมด</h3>
          <p className="text-sm text-gray-600 mt-1">
            {staffList && staffList.length > 0 ? `${staffList.length} คน` : 'ยังไม่มีสมาชิก'}
          </p>
        </div>
        
        {/* ✅ แสดงปุ่มเฉพาะคนที่มีสิทธิ์ */}
        {canManageStaff && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-2 group"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="group-hover:scale-110 transition-transform"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            เพิ่ม Staff ใหม่
          </button>
        )}
      </div>

      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {staffList && staffList.length > 0 ? (
          staffList.map((staff) => {
            const editPermission = getEditPermission(staff.role);
            const deletePermission = getDeletePermission(staff.role);

            return (
              <div
                key={staff.id}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-[#498AC3]/30"
              >
                {/* Status Banner */}
                {staff.status === 'pending' && (
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-2">
                    <p className="text-yellow-900 text-sm font-semibold text-center flex items-center justify-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      รอการยืนยัน
                    </p>
                  </div>
                )}

                {/* Card Content */}
                <div className="p-6">
                  {/* Avatar & Name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#3674B5] to-[#498AC3] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white text-xl font-bold">
                        {staff.firstname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-gray-900 truncate">
                        {staff.firstname} {staff.lastname}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {/* ✅ Role Badge - ทำให้ชัดขึ้น */}
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-[#3674B5] text-white shadow-sm">
                          {staff.role}
                        </span>
                        {staff.status === 'accepted' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      <span className="truncate">{staff.email}</span>
                    </div>
                  </div>

                  {/* Action Buttons - ✅ แสดงเฉพาะคนที่มีสิทธิ์ */}
                  {canManageStaff ? (
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                      {/* Edit Button */}
                      <div className="relative group/edit flex-1">
                        <button
                          onClick={() => editPermission.canEdit && setEditingStaff(staff)}
                          disabled={!editPermission.canEdit}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                            editPermission.canEdit
                              ? 'bg-[#3674B5] text-white hover:bg-[#498AC3] hover:shadow-xl hover:scale-[1.02]'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          แก้ไข
                        </button>
                        
                        {!editPermission.canEdit && editPermission.reason && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/edit:block z-10 w-64">
                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                              {editPermission.reason}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Delete Button */}
                      <div className="relative group/delete">
                        <button
                          onClick={() =>
                            deletePermission.canDelete &&
                            setDeletingStaff({
                              id: staff.id,
                              name: `${staff.firstname} ${staff.lastname}`,
                            })
                          }
                          disabled={!deletePermission.canDelete}
                          className={`p-3 rounded-xl transition-all ${
                            deletePermission.canDelete
                              ? 'bg-red-500 text-white hover:bg-red-600 hover:shadow-xl hover:scale-[1.02]'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                        
                        {!deletePermission.canDelete && deletePermission.reason && (
                          <div className="absolute bottom-full right-0 mb-2 hidden group-hover/delete:block z-10 w-64">
                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg">
                              {deletePermission.reason}
                              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                          คุณไม่มีสิทธิ์จัดการ Staff คนนี้
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full">
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <p className="text-gray-600 font-semibold text-lg">ยังไม่มี Staff ในงานนี้</p>
              <p className="text-gray-500 text-sm mt-2">
                คลิก "เพิ่ม Staff ใหม่" เพื่อเริ่มต้น
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showInviteModal && (
        <InviteStaffModal
          onClose={() => setShowInviteModal(false)}
          onInviteByEmail={handleInviteByEmail}
          onCreateInviteCode={handleCreateInviteCode}
          isInviting={isInviting}
          isCreatingCode={isCreatingCode}
          inviteCode={inviteCode}
          userRole={userRole} // ✅ ส่ง userRole เข้าไป
        />
      )}

      {editingStaff && (
        <EditRoleModal
          staff={editingStaff}
          userRole={userRole}
          currentUserId={currentUserId} // ✅ ส่ง currentUserId เข้าไป
          onClose={() => setEditingStaff(null)}
          onSave={handleChangeRole}
        />
      )}

      {deletingStaff && (
        <DeleteStaffModal
          staffName={deletingStaff.name}
          onClose={() => setDeletingStaff(null)}
          onConfirm={handleRemoveStaff}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}