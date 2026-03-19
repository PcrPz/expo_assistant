// src/features/staff/components/EditRoleModal.tsx
'use client';

import { useState } from 'react';
import type { Staff } from '../api/staffApi';
import type { EventRole } from '@/src/features/events/types/event.types';

interface EditRoleModalProps {
  staff: Staff;
  userRole?: EventRole;
  currentUserId?: string;
  onClose: () => void;
  onSave: (userId: string, newRole: string) => void;
}

export function EditRoleModal({ staff, userRole, currentUserId, onClose, onSave }: EditRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState(staff.role);

  const isEditingSelf: boolean = !!(currentUserId && staff.id === currentUserId);

  const handleSave = () => {
    if (selectedRole === staff.role) { onClose(); return; }
    onSave(staff.id, selectedRole);
  };

  const roleHierarchy: Record<string, number> = {
    'system_admin': 5, 'owner': 4, 'admin': 3, 'staff': 2,
  };

  const getRoleOptions = () => {
    const allRoles = [
      { value: 'admin', label: 'Admin', desc: 'จัดการ Staff และงาน', color: '#3674B5' },
      { value: 'staff', label: 'Staff', desc: 'ดูแลงานทั่วไป', color: '#498AC3' },
    ];
    if (userRole === 'staff') return [];
    const currentUserLevel = roleHierarchy[userRole || ''] || 0;
    return allRoles.filter(r => roleHierarchy[r.value] <= currentUserLevel);
  };

  const roleOptions = getRoleOptions();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-[18px] border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">แก้ไขบทบาท Staff</h3>
              <p className="text-xs text-gray-400 mt-0.5">เปลี่ยนสิทธิ์การใช้งาน</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">

          {/* Staff Info */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-black flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
              {staff.firstname.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{staff.firstname} {staff.lastname}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">{staff.email}</p>
            </div>
          </div>

          {/* Warning: editing self */}
          {isEditingSelf && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p className="text-xs font-semibold text-amber-700">คุณไม่สามารถแก้ไขบทบาทของตัวเองได้</p>
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">เลือกบทบาท</label>
            {roleOptions.map(opt => {
              const isSelected = selectedRole === opt.value;
              return (
                <button key={opt.value} type="button"
                  onClick={() => !isEditingSelf && setSelectedRole(opt.value)}
                  disabled={isEditingSelf}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    isEditingSelf
                      ? 'opacity-50 cursor-not-allowed border-gray-100 bg-white'
                      : isSelected
                        ? 'border-[#3674B5] bg-[#EEF4FB]'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                  {/* Icon box — fixed w/h + flex center ให้กลางเสมอ */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: isSelected ? `linear-gradient(135deg, ${opt.color}, #498AC3)` : '#F3F4F6' }}>
                    {opt.value === 'admin' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isSelected ? 'white' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isSelected ? 'white' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${isSelected ? 'text-[#3674B5]' : 'text-gray-900'}`}>{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </div>
                  {/* Radio dot */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? 'border-[#3674B5] bg-[#3674B5]' : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Warning: changing role */}
          {selectedRole !== staff.role && !isEditingSelf && (
            <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p className="text-xs text-amber-700">การเปลี่ยนบทบาทจะมีผลทันที และอาจส่งผลต่อสิทธิ์การเข้าถึงข้อมูล</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-6 py-[18px] border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
            ยกเลิก
          </button>
          <button onClick={handleSave} disabled={selectedRole === staff.role || isEditingSelf}
            className="flex-1 py-2.5 text-white rounded-xl text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}