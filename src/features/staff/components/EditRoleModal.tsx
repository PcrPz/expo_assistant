// src/features/staff/components/EditRoleModal.tsx
'use client';

import { useState } from 'react';
import type { Staff } from '../api/staffApi';
import type { EventRole } from '@/src/features/events/types/event.types';

interface EditRoleModalProps {
  staff: Staff;
  userRole?: EventRole;
  currentUserId?: string; // ✅ เพิ่ม prop สำหรับเช็คว่าเป็นตัวเองหรือไม่
  onClose: () => void;
  onSave: (userId: string, newRole: string) => void;
}

export function EditRoleModal({ staff, userRole, currentUserId, onClose, onSave }: EditRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState(staff.role);

  // ✅ เช็คว่ากำลังแก้ไข role ตัวเองหรือไม่
  const isEditingSelf: boolean = !!(currentUserId && staff.id === currentUserId);

  const handleSave = () => {
    if (selectedRole === staff.role) {
      onClose();
      return;
    }
    onSave(staff.id, selectedRole);
  };

  // ✅ กำหนด role hierarchy
  const roleHierarchy: Record<string, number> = {
    'system_admin': 5,
    'owner': 4,
    'admin': 3,
    'staff': 2,
    'event_staff': 1,
    'booth_staff': 1,
  };

  // กำหนด role options ตาม userRole
  const getRoleOptions = () => {
    // ✅ สีใหม่ - เข้าธีม #3674B5 มากขึ้น
    const allRoles = [
      { value: 'admin', label: 'Admin', icon: '👑', color: 'from-[#3674B5] to-[#498AC3]', level: 3 },
      { value: 'staff', label: 'Staff', icon: '👤', color: 'from-sky-400 to-blue-400', level: 2 },
      { value: 'event_staff', label: 'Event Staff', icon: '🎪', color: 'from-indigo-400 to-purple-400', level: 1 },
      { value: 'booth_staff', label: 'Booth Staff', icon: '🏪', color: 'from-emerald-400 to-teal-400', level: 1 },
    ];

    let availableRoles = [...allRoles];

    // ✅ ไม่แสดง owner option เลย (เพราะเป็นเจ้าของคนเดียว)
    // Owner จะไม่อยู่ในตัวเลือกเลย

    // ✅ กรองตาม userRole - ไม่สามารถเลือก role ที่สูงกว่าตัวเอง
    const currentUserLevel = roleHierarchy[userRole || ''] || 0;
    availableRoles = availableRoles.filter(role => role.level <= currentUserLevel);

    // admin เห็นสูงสุดแค่ admin
    if (userRole === 'admin') {
      availableRoles = availableRoles.filter(role => role.value !== 'owner');
    }

    // staff เห็นเฉพาะ event_staff และ booth_staff
    if (userRole === 'staff') {
      availableRoles = availableRoles.filter(role => 
        role.value === 'event_staff' || role.value === 'booth_staff'
      );
    }

    return availableRoles;
  };

  const roleOptions = getRoleOptions();
  const selectedRoleOption = roleOptions.find((r) => r.value === selectedRole);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-[#3674B5] to-[#498AC3] p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">แก้ไขบทบาท Staff</h3>
              <p className="text-blue-100 text-sm mt-1">เปลี่ยนสิทธิ์การใช้งาน</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition p-2 hover:bg-white/10 rounded-lg"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Staff Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#3674B5] to-[#498AC3] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">
                  {staff.firstname.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900">
                  {staff.firstname} {staff.lastname}
                </h4>
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  {staff.email}
                </p>
              </div>
            </div>
          </div>

          {/* ✅ Warning ถ้ากำลังแก้ไข role ตัวเอง */}
          {isEditingSelf && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  className="flex-shrink-0 mt-0.5"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <p className="text-sm text-yellow-800 font-semibold">
                  ⚠️ คุณไม่สามารถแก้ไขบทบาทของตัวเองได้
                </p>
              </div>
            </div>
          )}

          {/* Current Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              บทบาทปัจจุบัน
            </label>
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedRoleOption?.icon || '👤'}</span>
                <div>
                  <p className="font-semibold text-gray-900">{selectedRoleOption?.label || staff.role}</p>
                  <p className="text-xs text-gray-500">สิทธิ์การใช้งานปัจจุบัน</p>
                </div>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              เลือกบทบาทใหม่
            </label>
            <div className="space-y-3">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => !isEditingSelf && setSelectedRole(option.value)}
                  disabled={isEditingSelf}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    isEditingSelf 
                      ? 'opacity-50 cursor-not-allowed border-gray-200'
                      : selectedRole === option.value
                        ? 'border-[#3674B5] bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}
                    >
                      {option.icon}
                    </div>

                    {/* Label */}
                    <div className="flex-1">
                      <p className={`font-semibold ${
                        selectedRole === option.value ? 'text-[#3674B5]' : 'text-gray-900'
                      }`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {option.value === 'admin' && 'จัดการ Staff และงาน'}
                        {option.value === 'staff' && 'ดูแลงานทั่วไป'}
                        {option.value === 'event_staff' && 'ดูแลกิจกรรมภายในงาน'}
                        {option.value === 'booth_staff' && 'ดูแลบูธเฉพาะ'}
                      </p>
                    </div>

                    {/* Radio */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedRole === option.value
                          ? 'border-[#3674B5] bg-[#3674B5]'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedRole === option.value && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Warning if changing role */}
          {selectedRole !== staff.role && !isEditingSelf && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  className="flex-shrink-0 mt-0.5"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <p className="text-sm text-yellow-800">
                  การเปลี่ยนบทบาทจะมีผลทันที และอาจส่งผลต่อสิทธิ์การเข้าถึงข้อมูล
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={selectedRole === staff.role || isEditingSelf}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}