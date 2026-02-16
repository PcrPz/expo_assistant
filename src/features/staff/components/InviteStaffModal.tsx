// src/features/staff/components/InviteStaffModal.tsx
'use client';

import { useState } from 'react';
import type { EventRole } from '@/src/features/events/types/event.types';

interface InviteStaffModalProps {
  onClose: () => void;
  onInviteByEmail: (email: string, role: string) => void;
  onCreateInviteCode: (role: string) => void;
  isInviting: boolean;
  isCreatingCode: boolean;
  inviteCode?: string;
  userRole?: EventRole; // ✅ เพิ่ม userRole
}

export function InviteStaffModal({
  onClose,
  onInviteByEmail,
  onCreateInviteCode,
  isInviting,
  isCreatingCode,
  inviteCode,
  userRole, // ✅ รับ userRole
}: InviteStaffModalProps) {
  const [email, setEmail] = useState('');
  const [emailRole, setEmailRole] = useState('staff');
  const [codeRole, setCodeRole] = useState('staff');

  // ✅ เช็คว่ามีสิทธิ์เชิญ staff หรือไม่  
  const canInviteStaff = 
    userRole === 'system_admin' || 
    userRole === 'owner' || 
    userRole === 'admin';

  const handleInviteByEmail = () => {
    if (!email.trim()) {
      alert('กรุณากรอกอีเมล');
      return;
    }
    onInviteByEmail(email, emailRole);
  };

  const handleCreateCode = () => {
    onCreateInviteCode(codeRole);
  };

  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      alert('คัดลอกโค้ดแล้ว');
    }
  };

  // ✅ ถ้าไม่มีสิทธิ์เชิญ staff → แสดง warning modal
  if (!canInviteStaff) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-400 to-red-500 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">ไม่มีสิทธิ์เข้าถึง</h3>
                <p className="text-red-100 text-sm mt-1">คุณไม่สามารถเชิญ Staff ได้</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition p-2 hover:bg-white/10 rounded-lg"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Warning Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
            </div>

            {/* Message */}
            <div className="text-center space-y-3">
              <p className="text-gray-700 font-semibold">
                เฉพาะ <span className="text-[#3674B5]">Owner</span> และ <span className="text-[#3674B5]">Admin</span> เท่านั้น
              </p>
              <p className="text-sm text-gray-600">
                ที่สามารถเชิญ Staff เข้าร่วมงานได้<br />
                กรุณาติดต่อผู้ดูแลระบบ
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-blue-800">
                  💡 <strong>บทบาทของคุณ:</strong> {userRole || 'ไม่ทราบ'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-center p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white font-bold rounded-xl hover:shadow-lg transition"
            >
              รับทราบ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-[#3674B5] to-[#498AC3] p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">การเพิ่ม Staff ใหม่</h3>
              <p className="text-blue-100 text-sm mt-1">เชิญสมาชิกเข้าร่วมทีม</p>
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
          {/* Method 1: Invite by Email */}
          <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3674B5] to-[#498AC3] rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">เพิ่มสมาชิกผ่านอีเมล</h4>
                <p className="text-xs text-gray-600">ส่งคำเชิญไปยังอีเมล</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">อีเมล</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3674B5] focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">หน้าที่</label>
                <select
                  value={emailRole}
                  onChange={(e) => setEmailRole(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3674B5] focus:border-transparent transition"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  
                  
                </select>
              </div>

              <button
                onClick={handleInviteByEmail}
                disabled={isInviting}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#3674B5] to-[#498AC3] text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInviting ? 'กำลังเชิญ...' : 'ยืนยันการเชิญ'}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-gray-500 font-semibold">หรือ</span>
            </div>
          </div>

          {/* Method 2: Invite by Code */}
          <div className="bg-sky-50 rounded-xl p-5 border-2 border-sky-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3674B5] to-sky-400 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">เพิ่มสมาชิกผ่านการสร้างโค้ด</h4>
                <p className="text-xs text-gray-600">สร้างโค้ดให้ผู้อื่นใช้</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">หน้าที่</label>
                <select
                  value={codeRole}
                  onChange={(e) => setCodeRole(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3674B5] focus:border-transparent transition"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  
                  
                </select>
              </div>

              <button
                onClick={handleCreateCode}
                disabled={isCreatingCode}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#3674B5] to-sky-400 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingCode ? 'กำลังสร้างโค้ด...' : 'ยืนยันการสร้างโค้ด'}
              </button>

              {/* Display Invite Code */}
              {inviteCode && (
                <div className="mt-4 bg-white rounded-lg p-4 border-2 border-sky-200 shadow-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                    โค้ดเชิญของคุณ (ใช้ได้ 24 ชั่วโมง)
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-3 bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-300 rounded-lg text-xl font-bold text-center text-[#3674B5] tracking-widest">
                      {inviteCode}
                    </code>
                    <button
                      onClick={handleCopyCode}
                      className="px-4 py-3 bg-gradient-to-r from-[#3674B5] to-sky-400 text-white rounded-lg hover:shadow-lg transition"
                      title="คัดลอก"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3674B5"
                strokeWidth="2"
                className="flex-shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
              <p className="text-sm text-blue-800">
                <strong>โค้ด:</strong> หมดอายุใน 24 ชม.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}