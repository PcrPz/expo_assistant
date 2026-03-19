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
  userRole?: EventRole;
}

export function InviteStaffModal({
  onClose,
  onInviteByEmail,
  onCreateInviteCode,
  isInviting,
  isCreatingCode,
  inviteCode,
  userRole,
}: InviteStaffModalProps) {
  const [email, setEmail] = useState('');
  const [emailRole, setEmailRole] = useState('staff');
  const [codeRole, setCodeRole] = useState('staff');

  const canInviteStaff =
    userRole === 'system_admin' ||
    userRole === 'owner' ||
    userRole === 'admin';

  const handleInviteByEmail = () => {
    if (!email.trim()) { alert('กรุณากรอกอีเมล'); return; }
    onInviteByEmail(email, emailRole);
  };

  const handleCreateCode = () => { onCreateInviteCode(codeRole); };

  const handleCopyCode = () => {
    if (inviteCode) { navigator.clipboard.writeText(inviteCode); alert('คัดลอกโค้ดแล้ว'); }
  };

  // ── No Permission ──────────────────────────────────────────
  if (!canInviteStaff) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-[18px] border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">ไม่มีสิทธิ์เข้าถึง</h3>
                <p className="text-xs text-gray-400 mt-0.5">คุณไม่สามารถเชิญ Staff ได้</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="px-6 py-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                เฉพาะ <span className="text-[#3674B5]">Owner</span> และ <span className="text-[#3674B5]">Admin</span> เท่านั้น
              </p>
              <p className="text-sm text-gray-500 mt-1">ที่สามารถเชิญ Staff เข้าร่วมงานได้</p>
            </div>
            <div className="w-full bg-[#EEF4FB] border border-blue-100 rounded-xl px-4 py-3 text-xs text-[#3674B5] font-medium">
              บทบาทของคุณ: <span className="font-bold">{userRole || 'ไม่ทราบ'}</span>
            </div>
          </div>
          <div className="px-6 py-[18px] border-t border-gray-100">
            <button onClick={onClose}
              className="w-full py-2.5 text-white text-sm font-semibold rounded-xl transition"
              style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
              รับทราบ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Modal ─────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

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
              <h3 className="text-base font-bold text-gray-900">เพิ่ม Staff ใหม่</h3>
              <p className="text-xs text-gray-400 mt-0.5">เชิญสมาชิกเข้าร่วมทีม</p>
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
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Method 1: Email */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">เพิ่มผ่านอีเมล</p>
                <p className="text-xs text-gray-400">ส่งคำเชิญไปยังอีเมล</p>
              </div>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  อีเมล <span className="text-red-400">*</span>
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] bg-gray-50 hover:bg-white transition-colors"/>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">หน้าที่</label>
                <div className="relative">
                  <select value={emailRole} onChange={e => setEmailRole(e.target.value)}
                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] bg-gray-50 hover:bg-white transition-colors appearance-none cursor-pointer">
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>
              </div>
              <button onClick={handleInviteByEmail} disabled={isInviting}
                className="w-full py-2.5 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #3674B5, #498AC3)' }}>
                {isInviting
                  ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"/>กำลังเชิญ...</>
                  : 'ยืนยันการเชิญ'}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-gray-200"/>
            <span className="text-xs font-semibold text-gray-400">หรือ</span>
            <div className="flex-1 border-t border-gray-200"/>
          </div>

          {/* Method 2: Code */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #498AC3, #749BC2)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">สร้างโค้ดเชิญ</p>
                <p className="text-xs text-gray-400">สร้างโค้ดให้ผู้อื่นใช้ (หมดอายุ 24 ชม.)</p>
              </div>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">หน้าที่</label>
                <div className="relative">
                  <select value={codeRole} onChange={e => setCodeRole(e.target.value)}
                    className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] bg-gray-50 hover:bg-white transition-colors appearance-none cursor-pointer">
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>
              </div>
              <button onClick={handleCreateCode} disabled={isCreatingCode}
                className="w-full py-2.5 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #498AC3, #749BC2)' }}>
                {isCreatingCode
                  ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"/>กำลังสร้าง...</>
                  : 'สร้างโค้ดเชิญ'}
              </button>

              {inviteCode && (
                <div className="bg-[#EEF4FB] border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-[#3674B5] mb-2.5 flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                    </svg>
                    โค้ดเชิญของคุณ
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 py-2.5 px-4 bg-white border border-blue-200 rounded-xl text-lg font-black text-center text-[#3674B5] tracking-widest">
                      {inviteCode}
                    </code>
                    <button onClick={handleCopyCode}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-blue-200 bg-white text-[#3674B5] hover:bg-[#EEF4FB] transition flex-shrink-0">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}