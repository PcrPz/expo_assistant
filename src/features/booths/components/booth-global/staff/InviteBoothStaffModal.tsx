// src/features/booths/components/booth-global/staff/InviteBoothStaffModal.tsx
'use client';

import { useState } from 'react';

interface InviteBoothStaffModalProps {
  onClose: () => void;
  onInviteByEmail: (email: string) => void;
  onCreateInviteCode: () => void;
  isInviting: boolean;
  isCreatingCode: boolean;
  inviteCode?: string;
  userRole?: 'booth_group_owner' | 'booth_group_staff' | string;
}

export function InviteBoothStaffModal({
  onClose,
  onInviteByEmail,
  onCreateInviteCode,
  isInviting,
  isCreatingCode,
  inviteCode,
  userRole,
}: InviteBoothStaffModalProps) {
  const [email, setEmail] = useState('');

  const canInviteStaff = userRole === 'booth_group_owner';

  const handleInviteByEmail = () => {
    if (!email.trim()) {
      alert('กรุณากรอกอีเมล');
      return;
    }
    onInviteByEmail(email);
  };

  const handleCopyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      alert('📋 คัดลอกโค้ดแล้ว!');
    }
  };

  if (!canInviteStaff) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">ไม่มีสิทธิ์</h3>
              <button onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition p-1.5 hover:bg-gray-100 rounded-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <div>
              <p className="text-gray-700 font-semibold mb-2">เฉพาะเจ้าของบูธเท่านั้น</p>
              <p className="text-sm text-gray-500">ที่สามารถเชิญสมาชิกเข้าร่วมบูธได้</p>
            </div>
            <button onClick={onClose}
              className="w-full px-4 py-2.5 bg-[#3674B5] text-white font-semibold rounded-lg hover:bg-[#2d5a8f] transition">
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
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-gray-100 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">เชิญสมาชิกใหม่</h3>
              <p className="text-sm text-gray-500 mt-1">เพิ่มคนเข้าร่วมบูธของคุณ</p>
            </div>
            <button onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition p-1.5 hover:bg-gray-100 rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Method 1: Invite by Email */}
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#3674B5] rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">เชิญผ่านอีเมล</h4>
                <p className="text-xs text-gray-600">ส่งคำเชิญไปยังอีเมล</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">อีเมล</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#3674B5] focus:ring-2 focus:ring-blue-50 transition" />
              </div>

              <button onClick={handleInviteByEmail} disabled={isInviting || !email.trim()}
                className="w-full px-6 py-3 bg-[#3674B5] text-white font-semibold rounded-lg hover:bg-[#2d5a8f] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                {isInviting ? 'กำลังส่ง...' : 'ส่งคำเชิญ'}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-sm text-gray-500 font-medium">หรือ</span>
            </div>
          </div>

          {/* Method 2: Invite by Code */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">สร้างโค้ดเชิญ</h4>
                <p className="text-xs text-gray-600">สร้างโค้ดให้ผู้อื่นใช้</p>
              </div>
            </div>

            <div className="space-y-4">
              {!inviteCode ? (
                <>
                  <p className="text-sm text-gray-600">สร้างโค้ดเชิญเพื่อให้คนอื่นสามารถเข้าร่วมบูธได้</p>
                  <button onClick={onCreateInviteCode} disabled={isCreatingCode}
                    className="w-full px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                    {isCreatingCode ? 'กำลังสร้าง...' : 'สร้างโค้ดเชิญ'}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">โค้ดเชิญของคุณ</label>
                    <div className="flex gap-2">
                      <input type="text" value={inviteCode} readOnly
                        className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg font-mono text-center text-lg font-bold text-[#3674B5] tracking-wider" />
                      <button onClick={handleCopyCode}
                        className="px-4 py-3 bg-[#3674B5] text-white rounded-lg hover:bg-[#2d5a8f] transition shadow-sm">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v-4"/>
                        <path d="M12 8h.01"/>
                      </svg>
                      โค้ดนี้จะหมดอายุใน 24 ชั่วโมง
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold text-[#3674B5]">ข้อมูลเพิ่มเติม</p>
                <ul className="space-y-0.5 text-xs text-gray-600">
                  <li>• คำเชิญจะส่งไปยังอีเมลพร้อมลิงก์เข้าร่วม</li>
                  <li>• โค้ดเชิญสามารถใช้ได้ภายใน 24 ชั่วโมง</li>
                  <li>• สมาชิกใหม่จะได้รับบทบาท Staff</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}