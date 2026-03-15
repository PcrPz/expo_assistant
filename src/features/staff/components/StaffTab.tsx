// src/features/staff/components/StaffTab.tsx
'use client';

import { useState } from 'react';
import { useStaff } from '../hooks/useStaff';
import { InviteStaffModal } from './InviteStaffModal';
import { DeleteStaffModal } from './DeleteStaffModal';
import type { Staff } from '../api/staffApi';
import type { EventRole } from '@/src/features/events/types/event.types';
import { canRemoveStaff } from '@/src/features/events/types/event.types';
import { EditRoleModal } from './EditRoleModal';

interface StaffTabProps {
  expoId: string;
  userRole?: EventRole;
  currentUserId?: string;
}

// ── Role badge styles ──────────────────────────────────────────
const ROLE_BADGE = 'bg-[#EEF4FB] text-[#3674B5] border border-[#B8D0EA]';
const roleBadge: Record<string, string> = {
  owner:        ROLE_BADGE,
  admin:        ROLE_BADGE,
  staff:        ROLE_BADGE,
  event_staff:  ROLE_BADGE,
  booth_staff:  ROLE_BADGE,
};

export function StaffTab({ expoId, userRole, currentUserId }: StaffTabProps) {
  const {
    staffList, isLoading, error,
    inviteStaff, createInviteCode, changeRole, removeStaff, refetch,
    isInviting, isCreatingCode, inviteCode,
  } = useStaff(expoId);

  const [showInviteModal, setShowInviteModal]   = useState(false);
  const [editingStaff,    setEditingStaff]       = useState<Staff | null>(null);
  const [deletingStaff,   setDeletingStaff]      = useState<{ id: string; name: string } | null>(null);
  const [isDeleting,      setIsDeleting]         = useState(false);
  const [searchQuery,     setSearchQuery]        = useState('');

  const canManageStaff = userRole === 'system_admin' || userRole === 'owner' || userRole === 'admin';

  // ── handlers (unchanged logic) ────────────────────────────────
  const handleInviteByEmail = (email: string, role: string) => {
    inviteStaff({ email, role }, {
      onSuccess: () => { setShowInviteModal(false); alert('เชิญ Staff สำเร็จ'); },
      onError:   () => { alert('ไม่สามารถเชิญ Staff ได้'); },
    });
  };

  const handleCreateInviteCode = (role: string) => createInviteCode({ role });

  const handleChangeRole = (userId: string, newRole: string) => {
    changeRole({ user_id: userId, role: newRole }, {
      onSuccess: () => { setEditingStaff(null); alert('เปลี่ยนบทบาทสำเร็จ'); },
      onError:   () => { alert('ไม่สามารถเปลี่ยนบทบาทได้'); },
    });
  };

  const handleRemoveStaff = async () => {
    if (!deletingStaff) return;
    setIsDeleting(true);
    removeStaff(deletingStaff.id, {
      onSuccess: () => { setDeletingStaff(null); setIsDeleting(false); alert('ลบ Staff สำเร็จ'); },
      onError:   () => { setIsDeleting(false); alert('ไม่สามารถลบ Staff ได้'); },
    });
  };

  const getEditPermission = (staffRole: string): { canEdit: boolean; reason: string } => {
    if (staffRole === 'booth_staff') return { canEdit: false, reason: 'Booth Staff ถูกกำหนดโดย Booth Group ไม่สามารถแก้ไขได้' };
    if (userRole === 'system_admin' || userRole === 'owner') return { canEdit: true, reason: '' };
    if (userRole === 'admin') {
      if (['admin', 'owner', 'system_admin'].includes(staffRole))
        return { canEdit: false, reason: 'คุณไม่สามารถแก้ไข Admin, Owner หรือ System Admin ได้' };
      return { canEdit: true, reason: '' };
    }
    if (userRole === 'staff') return { canEdit: false, reason: 'คุณไม่มีสิทธิ์แก้ไข Staff คนอื่น' };
    return { canEdit: false, reason: 'คุณไม่มีสิทธิ์แก้ไข Staff คนนี้' };
  };

  const getDeletePermission = (staffRole: string): { canDelete: boolean; reason: string } => {
    if (staffRole === 'booth_staff') return { canDelete: false, reason: 'Booth Staff ถูกกำหนดโดย Booth Group ไม่สามารถลบได้' };
    if (canRemoveStaff(userRole, staffRole as EventRole)) return { canDelete: true, reason: '' };
    if (userRole === 'admin')
      return { canDelete: false, reason: 'คุณไม่สามารถลบ Admin, Owner หรือ System Admin ได้' };
    if (userRole === 'staff') return { canDelete: false, reason: 'คุณไม่มีสิทธิ์ลบ Staff' };
    return { canDelete: false, reason: 'คุณไม่มีสิทธิ์ลบ Staff คนนี้' };
  };

  // ── sort by role hierarchy ───────────────────────────────────
  const ROLE_ORDER: Record<string, number> = {
    system_admin: 0,
    owner:        1,
    admin:        2,
    staff:        3,
    event_staff:  4,
    booth_staff:  5,
  };
  const STATUS_ORDER: Record<string, number> = { accepted: 0, pending: 1, rejected: 2 };

  const visibleStaff = [...(staffList ?? [])].sort((a, b) => {
    // 1) role hierarchy
    const roleDiff = (ROLE_ORDER[a.role] ?? 99) - (ROLE_ORDER[b.role] ?? 99);
    if (roleDiff !== 0) return roleDiff;
    // 2) same role → accepted ขึ้นก่อน
    const statusDiff = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
    if (statusDiff !== 0) return statusDiff;
    // 3) same role + same status → เรียงตามชื่อ A-Z
    return `${a.firstname} ${a.lastname}`.localeCompare(`${b.firstname} ${b.lastname}`);
  });

  const filteredStaff = searchQuery.trim()
    ? visibleStaff.filter(s => {
        const q = searchQuery.toLowerCase();
        return (
          `${s.firstname} ${s.lastname}`.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q)
        );
      })
    : visibleStaff;

  // ── Loading ────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-[#3674B5]/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-[#3674B5] rounded-full animate-spin" />
        </div>
        <p className="text-sm text-gray-500">กำลังโหลดข้อมูล Staff...</p>
      </div>
    </div>
  );

  // ── Error ──────────────────────────────────────────────────────
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-sm text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-red-700 font-semibold mb-1">เกิดข้อผิดพลาด</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <button onClick={refetch} className="px-5 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition">
          ลองใหม่
        </button>
      </div>
    </div>
  );

  // ── Main UI ───────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Title only */}
        <h3 className="text-lg font-bold text-gray-900">
          สมาชิกทั้งหมด
          <span className="ml-2 text-sm font-medium text-gray-400">
            {searchQuery ? `${filteredStaff.length} / ${visibleStaff.length}` : `${visibleStaff.length}`} คน
          </span>
        </h3>

        {/* Row 2: Search + Add button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ค้นหาจากชื่อ, อีเมล หรือบทบาท..."
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-[#3674B5]/25 focus:border-[#3674B5]
                placeholder:text-gray-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 transition"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          {canManageStaff && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#3674B5] text-white text-sm font-semibold rounded-xl hover:bg-[#2d6aa8] transition shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              เพิ่ม Staff ใหม่
            </button>
          )}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      {filteredStaff.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-gray-200">
            {searchQuery ? (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            )}
          </div>
          {searchQuery ? (
            <>
              <p className="text-gray-500 font-medium text-sm">ไม่พบผลลัพธ์สำหรับ "{searchQuery}"</p>
              <button onClick={() => setSearchQuery('')} className="mt-2 text-xs text-[#3674B5] hover:underline">
                ล้างการค้นหา
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-500 font-medium text-sm">ยังไม่มี Staff ในงานนี้</p>
              {canManageStaff && (
                <p className="text-gray-400 text-xs mt-1">คลิก "เพิ่ม Staff ใหม่" เพื่อเริ่มต้น</p>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

          {/* Table head */}
          <div className="grid grid-cols-[2fr_1fr_1fr_auto] bg-gray-50 border-b border-gray-200 px-6">
            <div className="py-3 text-xs font-700 text-gray-500 uppercase tracking-wide">ชื่อ</div>
            <div className="py-3 text-xs font-700 text-gray-500 uppercase tracking-wide">บทบาท</div>
            <div className="py-3 text-xs font-700 text-gray-500 uppercase tracking-wide">สถานะ</div>
            <div className="py-3 text-xs font-700 text-gray-500 uppercase tracking-wide w-24 text-center">จัดการ</div>
          </div>

          {/* Table rows */}
          {filteredStaff.map((staff, idx) => {
            const editPerm   = getEditPermission(staff.role);
            const deletePerm = getDeletePermission(staff.role);

            return (
              <div
                key={staff.id}
                className={`grid grid-cols-[2fr_1fr_1fr_auto] items-center px-6 hover:bg-gray-50 transition-colors
                  ${idx !== filteredStaff.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                {/* Name + email */}
                <div className="py-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3674B5] to-[#498AC3] flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white text-sm font-bold">
                      {staff.firstname.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {staff.firstname} {staff.lastname}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{staff.email}</p>
                  </div>
                </div>

                {/* Role */}
                <div className="py-3.5">
                  <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${roleBadge[staff.role] ?? 'bg-gray-100 text-gray-500'}`}>
                    {staff.role}
                  </span>
                </div>

                {/* Status */}
                <div className="py-3.5">
                  {staff.status === 'accepted' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      ยืนยันแล้ว
                    </span>
                  )}
                  {staff.status === 'pending' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      รอยืนยัน
                    </span>
                  )}
                  {staff.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      ปฏิเสธ
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="py-3.5 w-24 flex items-center justify-center gap-1.5">
                  {canManageStaff ? (
                    <>
                      {/* Edit */}
                      <div className="relative group/edit">
                        <button
                          onClick={() => editPerm.canEdit && setEditingStaff(staff)}
                          disabled={!editPerm.canEdit}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
                            ${editPerm.canEdit
                              ? 'bg-[#EEF4FB] text-[#3674B5] hover:bg-[#d4e6f7]'
                              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        {!editPerm.canEdit && editPerm.reason && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/edit:block z-20 w-56 pointer-events-none">
                            <div className="bg-gray-800 text-white text-xs rounded-lg py-1.5 px-3 shadow-lg text-center">
                              {editPerm.reason}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Delete */}
                      <div className="relative group/del">
                        <button
                          onClick={() => deletePerm.canDelete && setDeletingStaff({ id: staff.id, name: `${staff.firstname} ${staff.lastname}` })}
                          disabled={!deletePerm.canDelete}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
                            ${deletePerm.canDelete
                              ? 'bg-red-50 text-red-500 hover:bg-red-100'
                              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                        {!deletePerm.canDelete && deletePerm.reason && (
                          <div className="absolute bottom-full right-0 mb-2 hidden group-hover/del:block z-20 w-56 pointer-events-none">
                            <div className="bg-gray-800 text-white text-xs rounded-lg py-1.5 px-3 shadow-lg text-center">
                              {deletePerm.reason}
                              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modals (unchanged) ──────────────────────────────── */}
      {showInviteModal && (
        <InviteStaffModal
          onClose={() => setShowInviteModal(false)}
          onInviteByEmail={handleInviteByEmail}
          onCreateInviteCode={handleCreateInviteCode}
          isInviting={isInviting}
          isCreatingCode={isCreatingCode}
          inviteCode={inviteCode}
          userRole={userRole}
        />
      )}
      {editingStaff && (
        <EditRoleModal
          staff={editingStaff}
          userRole={userRole}
          currentUserId={currentUserId}
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