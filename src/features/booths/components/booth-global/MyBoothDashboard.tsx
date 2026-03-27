// src/features/booths/components/booth-global/MyBoothDashboard.tsx
'use client';
import { toast } from '@/src/lib/toast';
import { ConfirmModal } from '@/src/components/ui/ConfirmModal';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getMyBoothGlobal,
  joinBoothByCode,
  deleteBoothGlobal,
  leaveBoothGroup,
} from '@/src/features/booths/api/boothGlobalApi';
import type { BoothGlobal } from '@/src/features/booths/types/boothGlobal.types';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';

// ─── Constants ────────────────────────────────────────────────
const BLUE  = '#3674B5';
const BLUE2 = '#498AC3';
const BL    = '#EBF3FC';

// ─── Helpers ──────────────────────────────────────────────────
function getImageUrl(path?: string): string | null {
  if (!path) return null;
  try { return getMinioFileUrl(path); } catch { return null; }
}

const BOOTH_TYPE: Record<string, string> = {
  booth: 'บูธ',
  stage: 'เวที',
};

// ─── Role config ──────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  booth_group_owner: {
    label: 'Owner',
    bg:     'rgba(251,191,36,0.22)',
    color:  '#FCD34D',
    border: '1px solid rgba(251,191,36,0.4)',
  },
  booth_group_staff: {
    label: 'Staff',
    bg:     'rgba(255,255,255,0.18)',
    color:  'rgba(255,255,255,0.88)',
    border: '1px solid rgba(255,255,255,0.28)',
  },
};

// ══════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════

export function MyBoothDashboard() {
  const router = useRouter();

  const [booth,   setBooth]   = useState<BoothGlobal | null>(null);
  const [role,    setRole]    = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Join by code
  const [showJoin,  setShowJoin]  = useState(false);
  const [joinCode,  setJoinCode]  = useState('');
  const [joining,   setJoining]   = useState(false);

  // Delete / Leave
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm,  setShowLeaveConfirm]  = useState(false);
  const [actionLoading,     setActionLoading]     = useState(false);

  // ── Load ────────────────────────────────────────────────────
  useEffect(() => { loadBooth(); }, []);

  const loadBooth = async () => {
    try {
      const { booth: myBooth, role: myRole } = await getMyBoothGlobal();
      setBooth(myBooth);
      setRole(myRole);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Join by code ────────────────────────────────────────────
  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    const result = await joinBoothByCode(joinCode.trim());
    setJoining(false);
    if (result.success) {
      setShowJoin(false);
      setJoinCode('');
      await loadBooth();
    } else {
      toast.error(result.message);
    }
  };

  // ── Delete booth group (owner) ──────────────────────────────
  const handleDelete = async () => {
    if (!booth) return;
    setActionLoading(true);
    try {
      await deleteBoothGlobal(booth.id);
      toast.success('ลบ Booth Group สำเร็จ');
      setShowDeleteConfirm(false);
      setBooth(null);
      setRole('');
    } catch (e: any) {
      toast.error(e.message || 'ไม่สามารถลบ Booth Group ได้');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Leave booth group (staff) ───────────────────────────────
  const handleLeave = async () => {
    if (!booth) return;
    setActionLoading(true);
    try {
      await leaveBoothGroup(booth.id);
      toast.success('ออกจากกลุ่มสำเร็จ');
      setShowLeaveConfirm(false);
      setBooth(null);
      setRole('');
    } catch (e: any) {
      toast.error(e.message || 'ไม่สามารถออกจากกลุ่มได้');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Derived ─────────────────────────────────────────────────
  const isOwner = role === 'booth_group_owner';
  const roleConfig = ROLE_CONFIG[role] ?? ROLE_CONFIG.booth_group_staff;

  // ── Loading ─────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <div className="w-9 h-9 border-[3px] border-gray-200 border-t-[#3674B5] rounded-full animate-spin" />
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // EMPTY STATE — ยังไม่มีบูธ
  // ══════════════════════════════════════════════════════════════
  if (!booth) return (
    <>
      <div
        className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6"
        style={{ backgroundColor: '#F8FAFC' }}
      >
        <div className="max-w-md w-full text-center">
          <img
            src="/images/No_expo.png"
            alt="ยังไม่มีบูธ"
            className="w-64 h-64 object-contain mx-auto mb-2"
          />
          <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
            เริ่มต้นสร้างกลุ่มผู้ร่วมบูธของคุณ
          </h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            จัดการสินค้า ทีมงาน และเข้าร่วมงาน Expo ได้จากที่เดียว
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/booths/create')}
              className="flex items-center gap-2 px-6 py-3 text-white font-bold rounded-2xl text-sm hover:opacity-90 transition shadow-sm"
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              สร้างกลุ่มผู้ร่วมบูธใหม่
            </button>
            <button
              onClick={() => setShowJoin(true)}
              className="flex items-center gap-2 px-6 py-3 font-bold rounded-2xl text-sm border-2 hover:bg-blue-50 transition"
              style={{ color: BLUE, borderColor: BLUE }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              ใส่รหัสเข้าร่วม
            </button>
          </div>
        </div>
      </div>

      <JoinModal
        show={showJoin}
        code={joinCode}
        joining={joining}
        onChange={setJoinCode}
        onJoin={handleJoin}
        onClose={() => { setShowJoin(false); setJoinCode(''); }}
      />
    </>
  );

  // ══════════════════════════════════════════════════════════════
  // MAIN DASHBOARD — มีบูธแล้ว
  // ══════════════════════════════════════════════════════════════
  const profileUrl = getImageUrl(booth.profilePic);
  const initial    = booth.title?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div className="min-h-[calc(100vh-3.5rem)]" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-screen-xl mx-auto px-8 py-6 space-y-5">

        {/* ══ HERO HEADER ══════════════════════════════════════ */}
        <div
          className="rounded-2xl overflow-hidden shadow-sm"
          style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)` }}
        >
          <div className="px-7 py-7 flex items-center gap-6">

            {/* Avatar */}
            <div
              className="w-[88px] h-[88px] rounded-2xl overflow-hidden flex-shrink-0 border-2 shadow-md"
              style={{ borderColor: 'rgba(255,255,255,0.4)' }}
            >
              {profileUrl
                ? <img src={profileUrl} alt={booth.title} className="w-full h-full object-cover" />
                : (
                  <div
                    className="w-full h-full flex items-center justify-center text-3xl font-black text-white"
                    style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
                  >
                    {initial}
                  </div>
                )
              }
            </div>

            {/* Info — มี padding ซ้ายเพิ่มให้ถอยจาก avatar */}
            <div className="flex-1 min-w-0 pl-2">
              <p className="text-white/60 text-[11px] font-semibold uppercase tracking-wider mb-1">
                บูธของฉัน
              </p>
              <div className="flex items-center gap-2.5 mb-0.5">
                <h1 className="text-[24px] font-black text-white leading-tight truncate">
                  {booth.title}
                </h1>
                <span
                  className="flex-shrink-0 text-[12px] font-bold px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: roleConfig.bg,
                    color:           roleConfig.color,
                    border:          roleConfig.border,
                  }}
                >
                  {roleConfig.label}
                </span>
              </div>
              {booth.company && (
                <p className="text-white/70 text-[14px] mt-0.5 truncate">{booth.company}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {booth.email && (
                  <a
                    href={`mailto:${booth.email}`}
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-white/80 hover:text-white transition"
                    style={{ backgroundColor: 'rgba(255,255,255,0.13)' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span className="truncate max-w-[180px]">{booth.email}</span>
                  </a>
                )}
                {booth.tel && (
                  <a
                    href={`tel:${booth.tel}`}
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-white/80 hover:text-white transition"
                    style={{ backgroundColor: 'rgba(255,255,255,0.13)' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.4 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08z"/>
                    </svg>
                    {booth.tel}
                  </a>
                )}
              </div>
            </div>

            {/* Action buttons — right side */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {/* แก้ไข — เฉพาะ owner */}
              {isOwner && (
                <button
                  onClick={() => router.push('/booths/edit')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold text-white hover:bg-white/20 transition"
                  style={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  แก้ไข
                </button>
              )}

              {/* ลบ / ออกจากกลุ่ม */}
              {isOwner ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold transition"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    border:          '1px solid rgba(255,255,255,0.3)',
                    color:           'white',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  ลบกลุ่ม
                </button>
              ) : (
                <button
                  onClick={() => setShowLeaveConfirm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold transition"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    border:          '1px solid rgba(255,255,255,0.3)',
                    color:           'white',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  ออกจากกลุ่ม
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ══ MAIN CONTENT — 2 columns ════════════════════════ */}
        <div className="grid grid-cols-3 gap-5">

          {/* LEFT — Quick Actions + About */}
          <div className="col-span-1 space-y-4">

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">เมนูหลัก</p>
              </div>
              <div className="p-2">
                {[
                  {
                    icon: <path d="M11 21H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v3"/>,
                    label: 'ค้นหางาน Expo',
                    sub: 'สมัครเข้าร่วมงาน',
                    path: '/booths/explore-events',
                  },
                  {
                    icon: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
                    label: 'คำขอของฉัน',
                    sub: 'ติดตามสถานะ',
                    path: '/booths/my-applications',
                  },
                  {
                    icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
                    label: 'คำเชิญ',
                    sub: 'ยอมรับหรือปฏิเสธ',
                    path: '/booths/my-invitations',
                  },
                  {
                    icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
                    label: 'ทีมงาน',
                    sub: 'จัดการสมาชิก',
                    path: '/booths/staff',
                  },
                ].map(a => (
                  <button
                    key={a.label}
                    onClick={() => router.push(a.path)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition group text-left"
                  >
                    <div
                      className="w-[42px] h-[42px] rounded-xl flex items-center justify-center flex-shrink-0 transition group-hover:scale-105"
                      style={{ backgroundColor: BL }}
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round">
                        {a.icon}
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-gray-900 leading-tight">{a.label}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">{a.sub}</p>
                    </div>
                    <svg
                      className="text-gray-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0"
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                    >
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* About */}
            {booth.detail && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">เกี่ยวกับบูธ</p>
                <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-4">{booth.detail}</p>
              </div>
            )}
          </div>

          {/* RIGHT — Events joined */}
          <div className="col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: BL }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
                    </svg>
                  </div>
                  <h3 className="font-black text-gray-900 text-[15px] tracking-tight">งานที่เข้าร่วม</h3>
                  {booth.booth && booth.booth.length > 0 && (
                    <span
                      className="text-[12px] font-bold px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: BLUE }}
                    >
                      {booth.booth.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => router.push('/booths/explore-events')}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-bold text-white hover:opacity-90 transition shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  หางาน
                </button>
              </div>

              {/* Event grid */}
              {booth.booth && booth.booth.length > 0 ? (
                <div className="p-4 grid grid-cols-3 gap-3">
                  {booth.booth.map((event) => {
                    const imgUrl = getImageUrl(event.expoThumbnail || event.thumbnail);
                    return (
                      <div
                        key={event.boothID}
                        className="group rounded-xl border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => router.push(`/events/${event.expoID}`)}
                      >
                        {/* Thumbnail */}
                        <div
                          className="h-[104px] relative overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
                        >
                          {imgUrl ? (
                            <>
                              <img
                                src={imgUrl}
                                alt={event.expoTitle}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {/* gradient overlay ช่วย chip อ่านง่าย */}
                              <div
                                className="absolute inset-0"
                                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }}
                              />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white/25 select-none">
                              {event.expoTitle?.charAt(0) ?? '?'}
                            </div>
                          )}

                          {/* Booth chip */}
                          <div className="absolute bottom-2 left-2">
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-bold text-white"
                              style={{
                                backgroundColor: 'rgba(0,0,0,0.62)',
                                backdropFilter:  'blur(6px)',
                                border:          '1px solid rgba(255,255,255,0.25)',
                              }}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
                              </svg>
                              บูธ {event.boothNo}
                            </span>
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="px-3.5 py-3">
                          <h4 className="font-bold text-gray-900 text-[14px] leading-snug truncate group-hover:text-[#3674B5] transition-colors">
                            {event.expoTitle}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {event.zoneName && (
                              <span className="text-[12px] text-gray-400">{event.zoneName}</span>
                            )}
                            {event.hall && (
                              <span className="text-[12px] text-gray-400">· {event.hall}</span>
                            )}
                            {event.type && (
                              <span className="text-[11px] px-1.5 py-0.5 rounded-md font-medium border border-gray-100 text-gray-400 ml-auto">
                                {BOOTH_TYPE[event.type] ?? event.type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center"
                    style={{ backgroundColor: BL }}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <p className="font-bold text-gray-900 text-sm mb-1">ยังไม่ได้เข้าร่วมงาน Expo</p>
                  <p className="text-gray-400 text-xs mb-4">ค้นหางานแล้วสมัครบูธได้เลย</p>
                  <button
                    onClick={() => router.push('/booths/explore-events')}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold text-white hover:opacity-90 transition"
                    style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    ค้นหางาน Expo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════ */}

      {/* Delete Booth Group — owner only */}
      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="ลบ Booth Group"
        description="การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        notes={[
          'ข้อมูลบูธและประวัติทั้งหมดจะถูกลบถาวร',
          'สมาชิกทุกคนจะถูกนำออกจากกลุ่ม',
        ]}
        confirmLabel="ลบ Booth Group"
        confirmColor="#DC2626"
        isLoading={actionLoading}
      />

      {/* Leave Booth Group — staff only */}
      <ConfirmModal
        open={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleLeave}
        title="ออกจาก Booth Group"
        description={`คุณจะออกจาก "${booth.title}" และไม่สามารถเข้าถึงข้อมูลบูธได้อีก`}
        confirmLabel="ออกจากกลุ่ม"
        confirmColor="#D97706"
        isLoading={actionLoading}
      />

      {/* Join by code */}
      <JoinModal
        show={showJoin}
        code={joinCode}
        joining={joining}
        onChange={setJoinCode}
        onJoin={handleJoin}
        onClose={() => { setShowJoin(false); setJoinCode(''); }}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Join Modal — ใส่รหัสเข้าร่วม (ใช้เฉพาะ empty state)
// ══════════════════════════════════════════════════════════════
function JoinModal({ show, code, joining, onChange, onJoin, onClose }: {
  show: boolean;
  code: string;
  joining: boolean;
  onChange: (v: string) => void;
  onJoin: () => void;
  onClose: () => void;
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: '#EBF3FC' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3674B5" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 className="text-[18px] font-black text-gray-900 mb-1">ใส่รหัสเข้าร่วมบูธ</h2>
        <p className="text-sm text-gray-400 mb-5">กรอกรหัสที่ได้รับจากเจ้าของบูธ</p>
        <input
          type="text"
          value={code}
          onChange={e => onChange(e.target.value.toUpperCase())}
          placeholder="เช่น ABCD-1234"
          maxLength={20}
          className="w-full px-4 py-3.5 rounded-xl border-2 bg-gray-50 text-center text-[18px] font-mono font-bold tracking-widest focus:outline-none transition mb-4"
          style={{ borderColor: code ? '#3674B5' : '#E5E7EB' }}
          onKeyDown={e => e.key === 'Enter' && onJoin()}
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition text-sm"
          >
            ยกเลิก
          </button>
          <button
            onClick={onJoin}
            disabled={joining || !code.trim()}
            className="flex-1 py-2.5 text-white font-semibold rounded-xl transition text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, #3674B5, #498AC3)` }}
          >
            {joining
              ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              : 'เข้าร่วม'
            }
          </button>
        </div>
      </div>
    </div>
  );
}