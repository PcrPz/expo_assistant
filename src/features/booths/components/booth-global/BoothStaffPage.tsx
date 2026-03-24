// src/features/booths/components/booth-global/BoothStaffPage.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getMyBoothGlobal,
  getBoothStaff,
  inviteBoothStaff,
  createBoothInviteCode,
  removeBoothStaff,
} from '@/src/features/booths/api/boothGlobalApi';
import type { BoothGlobalStaff } from '@/src/features/booths/types/boothGlobal.types';

// ─── Constants ────────────────────────────────────────────────
const BLUE  = '#3674B5';
const BLUE2 = '#498AC3';
const BL    = '#EBF3FC';

// ══════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════

export function BoothStaffPage() {
  const router = useRouter();

  const [boothId,       setBoothId]       = useState<string>('');
  const [role,          setRole]          = useState<string>('');
  const [staff,         setStaff]         = useState<BoothGlobalStaff[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [searchQuery,   setSearchQuery]   = useState('');

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCodeModal,   setShowCodeModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // States
  const [inviteEmail,   setInviteEmail]   = useState('');
  const [inviting,      setInviting]      = useState(false);
  const [inviteCode,    setInviteCode]    = useState('');
  const [creatingCode,  setCreatingCode]  = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<BoothGlobalStaff | null>(null);
  const [deleting,      setDeleting]      = useState(false);

  // ── Load ────────────────────────────────────────────────────
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { booth, role: userRole } = await getMyBoothGlobal();

      if (!booth) {
        toast.warning('ไม่พบข้อมูลบูธ');
        router.push('/booths/my-booth');
        return;
      }

      setBoothId(booth.id);
      setRole(userRole);

      const staffData = await getBoothStaff(booth.id);

      console.log('═══════════════════════════════════════════');
      console.log('📊 STAFF DATA RESPONSE:');
      console.log('═══════════════════════════════════════════');
      console.log('Raw Data:', staffData);
      console.log('Count:', staffData.length);
      staffData.forEach((member, index) => {
        console.log(`Member ${index + 1}:`, {
          userId: member.userId,
          name: `${member.firstname} ${member.lastname}`,
          email: member.email,
          role: member.role,
          status: member.status,
        });
      });
      console.log('═══════════════════════════════════════════');

      // เรียงเจ้าของขึ้นก่อน → A-Z
      const sortedStaff = [...staffData].sort((a, b) => {
        const isOwnerA = a.role === 'booth_group_owner';
        const isOwnerB = b.role === 'booth_group_owner';
        if (isOwnerA && !isOwnerB) return -1;
        if (!isOwnerA && isOwnerB) return 1;
        return a.firstname.localeCompare(b.firstname, 'th');
      });

      setStaff(sortedStaff);
    } catch (error) {
      console.error('Failed to load staff:', error);
      toast.error('ไม่สามารถโหลดข้อมูลทีมงานได้');
    } finally {
      setLoading(false);
    }
  };

  // ── Invite by email ─────────────────────────────────────────
  const handleInviteByEmail = async () => {
    if (!inviteEmail.trim()) { toast.warning('กรุณากรอกอีเมล'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      toast.warning('รูปแบบอีเมลไม่ถูกต้อง'); return;
    }
    try {
      setInviting(true);
      await inviteBoothStaff(boothId, inviteEmail);
      toast.success('ส่งคำเชิญสำเร็จ!');
      setShowInviteModal(false);
      setInviteEmail('');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถส่งคำเชิญได้');
    } finally {
      setInviting(false);
    }
  };

  // ── Create invite code ──────────────────────────────────────
  const handleOpenCodeModal = () => {
    setInviteCode('');
    setShowCodeModal(true);
  };

  const handleGenerateCode = async () => {
    try {
      setCreatingCode(true);
      const code = await createBoothInviteCode(boothId);
      if (code) { setInviteCode(code); }
      else { toast.error('ไม่สามารถสร้างรหัสเชิญได้'); }
    } catch {
      toast.error('ไม่สามารถสร้างรหัสเชิญได้');
    } finally {
      setCreatingCode(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast.success('คัดลอกรหัสเรียบร้อย!');
  };

  // ── Remove staff ────────────────────────────────────────────
  const handleRemoveStaff = async () => {
    if (!deletingStaff) return;
    try {
      setDeleting(true);
      await removeBoothStaff(boothId, deletingStaff.userId);
      toast.success('ลบทีมงานสำเร็จ');
      setShowDeleteModal(false);
      setDeletingStaff(null);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'ไม่สามารถลบทีมงานได้');
    } finally {
      setDeleting(false);
    }
  };

  // ── Derived ─────────────────────────────────────────────────
  const isOwner = role === 'booth_group_owner';

  const filteredStaff = staff.filter(member => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      `${member.firstname} ${member.lastname}`.toLowerCase().includes(q) ||
      member.email.toLowerCase().includes(q)
    );
  });

  // ── Loading ─────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="text-center">
        <div className="w-9 h-9 border-[3px] border-gray-200 border-t-[#3674B5] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">กำลังโหลดข้อมูล...</p>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-[calc(100vh-3.5rem)]" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-screen-xl mx-auto px-8 py-6">

        {/* ── Back ──────────────────────────────────────────── */}
        <button
          onClick={() => router.push('/booths/my-booth')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 text-sm font-bold transition mb-6 hover:bg-[#EEF4FB]"
          style={{ borderColor: '#D1D9E6', color: '#3674B5' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#3674B5')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#D1D9E6')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          กลับหน้าบูธ
        </button>

        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-[46px] h-[46px] rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <h1 className="text-[20px] font-black text-gray-900">จัดการทีมงาน</h1>
              <p className="text-[13px] text-gray-400 mt-0.5">เชิญและจัดการสมาชิกใน Booth Group</p>
            </div>
          </div>

          {/* ปุ่มเชิญ — เฉพาะ owner */}
          {isOwner && (
            <div className="flex gap-2.5">
              <button
                onClick={handleOpenCodeModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 hover:bg-blue-50 transition"
                style={{ color: BLUE, borderColor: BLUE }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                สร้างรหัสเชิญ
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition shadow-sm hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                เชิญทีมงาน
              </button>
            </div>
          )}
        </div>

        {/* ── Table Card ────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">

          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <div className="relative w-64">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ค้นหาจากชื่อ หรืออีเมล..."
                className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3674B5]/20 focus:border-[#3674B5] placeholder:text-gray-400 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full bg-gray-300 hover:bg-gray-400 transition"
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
            <span className="text-[13px] text-gray-400">
              {searchQuery
                ? `พบ ${filteredStaff.length} / ${staff.length} คน`
                : `สมาชิกทั้งหมด ${staff.length} คน`
              }
            </span>
          </div>

          {/* Table head */}
          <div className="grid grid-cols-[2fr_130px_120px_80px] bg-gray-50 border-b border-gray-100 px-5">
            {['ชื่อ', 'บทบาท', 'สถานะ', 'จัดการ'].map((h, i) => (
              <div
                key={h}
                className="py-3 text-[11px] font-700 text-gray-400 uppercase tracking-wide"
                style={i === 3 ? { textAlign: 'center' } : undefined}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Table rows */}
          {filteredStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                {searchQuery ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                {searchQuery ? `ไม่พบผลลัพธ์สำหรับ "${searchQuery}"` : 'ยังไม่มีทีมงาน'}
              </p>
              {!searchQuery && isOwner && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="mt-3 px-4 py-2 text-sm font-semibold rounded-xl text-white hover:opacity-90 transition"
                  style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
                >
                  เชิญทีมงานคนแรก
                </button>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs text-[#3674B5] hover:underline"
                >
                  ล้างการค้นหา
                </button>
              )}
            </div>
          ) : (
            filteredStaff.map((member, idx) => {
              const isThisOwner = member.role === 'booth_group_owner';
              const initial = `${member.firstname.charAt(0)}${member.lastname.charAt(0)}`;
              return (
                <div
                  key={member.userId}
                  className={`grid grid-cols-[2fr_130px_120px_80px] items-center px-5 hover:bg-gray-50 transition-colors ${
                    idx !== filteredStaff.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  {/* Name + email */}
                  <div className="py-3.5 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                      style={{
                        background: isThisOwner
                          ? `linear-gradient(135deg, ${BLUE}, ${BLUE2})`
                          : 'linear-gradient(135deg, #9CA3AF, #6B7280)',
                      }}
                    >
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {member.firstname} {member.lastname}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{member.email}</p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="py-3.5">
                    {isThisOwner ? (
                      <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        เจ้าของ
                      </span>
                    ) : (
                      <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-[#EEF4FB] text-[#3674B5] border border-[#B8D0EA]">
                        ทีมงาน
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="py-3.5">
                    {member.status === 'accepted' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        ยืนยันแล้ว
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        รอตอบรับ
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="py-3.5 flex items-center justify-center">
                    {isOwner && !isThisOwner ? (
                      <button
                        onClick={() => { setDeletingStaff(member); setShowDeleteModal(true); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 transition"
                        title="ลบออกจากทีมงาน"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════ */}

      {/* ── Invite by Email ─────────────────────────────────── */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BL }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-black text-gray-900">เชิญทีมงานด้วยอีเมล</h3>
                <p className="text-[12px] text-gray-400 mt-0.5">ส่งคำเชิญไปยังอีเมลของสมาชิก</p>
              </div>
              <button
                onClick={() => { setShowInviteModal(false); setInviteEmail(''); }}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition flex-shrink-0"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              <label className="block text-[13px] font-bold text-gray-700 mb-2">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="example@company.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3674B5] focus:outline-none focus:ring-2 focus:ring-[#3674B5]/15 transition text-sm"
                onKeyDown={e => e.key === 'Enter' && !inviting && handleInviteByEmail()}
                autoFocus
              />
            </div>

            {/* Footer */}
            <div className="flex gap-2.5 px-5 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => { setShowInviteModal(false); setInviteEmail(''); }}
                className="flex-1 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition text-sm"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleInviteByEmail}
                disabled={inviting || !inviteEmail.trim()}
                className="flex-1 py-2.5 text-white font-semibold rounded-xl transition text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
              >
                {inviting
                  ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8"/></svg>กำลังส่ง...</>
                  : 'ส่งคำเชิญ'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Invite Code ─────────────────────────────────────── */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BL }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-black text-gray-900">รหัสเชิญทีมงาน</h3>
                <p className="text-[12px] text-gray-400 mt-0.5">แชร์รหัสให้ทีมงานเข้าร่วมบูธ</p>
              </div>
              <button
                onClick={() => { setShowCodeModal(false); setInviteCode(''); }}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition flex-shrink-0"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              {!inviteCode ? (
                /* ยังไม่มีรหัส */
                <div className="text-center py-6">
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: BL }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round">
                      <rect x="3" y="6" width="18" height="12" rx="2"/>
                      <path d="M3 10h18"/>
                      <path d="M7 14h.01"/>
                      <path d="M11 14h2"/>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 mb-5">กดปุ่มด้านล่างเพื่อสร้างรหัสเชิญ</p>
                  <button
                    onClick={handleGenerateCode}
                    disabled={creatingCode}
                    className="px-6 py-2.5 text-white font-semibold rounded-xl transition text-sm disabled:opacity-40 flex items-center gap-2 mx-auto"
                    style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
                  >
                    {creatingCode
                      ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8"/></svg>กำลังสร้าง...</>
                      : 'สร้างรหัสเชิญ'
                    }
                  </button>
                </div>
              ) : (
                /* มีรหัสแล้ว */
                <>
                  <div
                    className="rounded-2xl p-5 text-center border-2 mb-3"
                    style={{ backgroundColor: BL, borderColor: '#B8D0EA' }}
                  >
                    <p className="text-[11px] text-gray-500 mb-2">รหัสเชิญ</p>
                    <p
                      className="text-[32px] font-black tracking-widest"
                      style={{ color: BLUE, fontFamily: 'monospace' }}
                    >
                      {inviteCode}
                    </p>
                    <button
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1.5 bg-white rounded-lg border text-sm font-semibold hover:bg-gray-50 transition"
                      style={{ borderColor: '#B8D0EA', color: BLUE }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                      คัดลอกรหัส
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 text-center">รหัสนี้สามารถใช้ได้หลายครั้ง</p>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => { setShowCodeModal(false); setInviteCode(''); }}
                className="w-full py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition text-sm"
              >
                {inviteCode ? 'ปิด' : 'ยกเลิก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Staff ─────────────────────────────────────── */}
      {showDeleteModal && deletingStaff && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-50">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-black text-gray-900">ยืนยันการลบทีมงาน</h3>
                <p className="text-[12px] text-gray-400 mt-0.5">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
              </div>
              <button
                onClick={() => { setShowDeleteModal(false); setDeletingStaff(null); }}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition flex-shrink-0"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              <p className="text-[13px] text-gray-600 leading-relaxed">
                คุณต้องการลบ{' '}
                <span className="font-bold text-gray-900">
                  {deletingStaff.firstname} {deletingStaff.lastname}
                </span>{' '}
                ออกจากทีมงานใช่หรือไม่?
              </p>
              <div className="flex items-center gap-2 mt-3 px-3 py-2.5 bg-red-50 rounded-xl border border-red-100">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span className="text-[12px] text-red-700">สมาชิกจะถูกนำออกทันทีและต้องได้รับเชิญใหม่</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2.5 px-5 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletingStaff(null); }}
                className="flex-1 py-2.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition text-sm"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRemoveStaff}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting
                  ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8"/></svg>กำลังลบ...</>
                  : 'ลบทีมงาน'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}