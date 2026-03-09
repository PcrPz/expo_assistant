// src/features/booths/components/booth-global/MyBoothDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyBoothGlobal, joinBoothByCode } from '@/src/features/booths/api/boothGlobalApi';
import type { BoothGlobal } from '@/src/features/booths/types/boothGlobal.types';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';

const BLUE  = '#3674B5';
const BLUE2 = '#498AC3';
const BL    = '#EBF3FC';

function getImageUrl(path?: string): string | null {
  if (!path) return null;
  try { return getMinioFileUrl(path); } catch { return null; }
}

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  owner:             { label: 'Owner',             color: 'bg-amber-100 text-amber-700 border border-amber-200' },
  admin:             { label: 'Admin',             color: 'bg-blue-100 text-blue-700 border border-blue-200' },
  staff:             { label: 'Staff',             color: 'bg-gray-100 text-gray-600 border border-gray-200' },
  booth_group_owner: { label: 'Owner',             color: 'bg-amber-100 text-amber-700 border border-amber-200' },
  booth_group_admin: { label: 'Admin',             color: 'bg-blue-100 text-blue-700 border border-blue-200' },
  booth_group_staff: { label: 'Staff',             color: 'bg-gray-100 text-gray-600 border border-gray-200' },
};

const BOOTH_TYPE: Record<string, string> = {
  small_booth: 'บูธเล็ก',
  big_booth:   'บูธใหญ่',
  stage:       'เวที',
};

export function MyBoothDashboard() {
  const router  = useRouter();
  const [booth,    setBooth]    = useState<BoothGlobal | null>(null);
  const [role,     setRole]     = useState<string>('');
  const [loading,  setLoading]  = useState(true);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining,  setJoining]  = useState(false);

  useEffect(() => { loadBooth(); }, []);

  const loadBooth = async () => {
    try {
      const { booth: myBooth, role: myRole } = await getMyBoothGlobal();
      setBooth(myBooth);
      setRole(myRole);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    const result = await joinBoothByCode(joinCode.trim());
    setJoining(false);
    if (result.success) { setShowJoin(false); setJoinCode(''); await loadBooth(); }
    else { alert(result.message); }
  };

  if (loading) return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <svg className="animate-spin w-8 h-8" style={{ color: BLUE }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle className="opacity-25" cx="12" cy="12" r="10"/>
        <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );

  // ══════════════════════════════════════════
  // EMPTY STATE
  // ══════════════════════════════════════════
  if (!booth) return (
    <>
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="max-w-md w-full text-center">
          <img src="/images/No_expo.png" alt="ยังไม่มีบูธ" className="w-64 h-64 object-contain mx-auto mb-2" />
          <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">เริ่มต้นสร้างบูธของคุณ</h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">จัดการสินค้า ทีมงาน และเข้าร่วมงาน Expo ได้จากที่เดียว</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push('/booths/create')}
              className="flex items-center gap-2 px-6 py-3 text-white font-bold rounded-2xl text-sm hover:opacity-90 transition shadow-sm"
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              สร้างบูธใหม่
            </button>
            <button onClick={() => setShowJoin(true)}
              className="flex items-center gap-2 px-6 py-3 font-bold rounded-2xl text-sm border-2 hover:bg-blue-50 transition"
              style={{ color: BLUE, borderColor: BLUE }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              ใส่รหัสเข้าร่วม
            </button>
          </div>
        </div>
      </div>
      <JoinModal show={showJoin} code={joinCode} joining={joining}
        onChange={setJoinCode} onJoin={handleJoin}
        onClose={() => { setShowJoin(false); setJoinCode(''); }} />
    </>
  );

  // ══════════════════════════════════════════
  // MAIN DASHBOARD
  // ══════════════════════════════════════════
  const profileUrl = getImageUrl(booth.profilePic);
  const roleInfo   = ROLE_LABEL[role?.toLowerCase()] ?? { label: role, color: 'bg-gray-100 text-gray-600 border border-gray-200' };
  const initial    = booth.title?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div className="min-h-[calc(100vh-3.5rem)]" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">

        {/* ══ HEADER ══════════════════════════════════════════ */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-blue-100"
          style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 100%)` }}>
          <div className="px-6 py-5 flex items-center gap-5">

            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 shadow-md" style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
              {profileUrl
                ? <img src={profileUrl} alt={booth.title} className="w-full h-full object-cover"/>
                : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white"
                    style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>{initial}</div>
              }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white/60 text-[11px] font-semibold uppercase tracking-wider mb-1">ชื่อบูธ</p>
              <div className="flex items-center gap-2.5 mb-0.5">
                <h1 className="text-xl font-black text-white leading-tight truncate">{booth.title}</h1>
                <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${roleInfo.color}`}>{roleInfo.label}</span>
              </div>
              {booth.company && <p className="text-white/70 text-sm mt-0.5 truncate">{booth.company}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                {booth.email && (
                  <a href={`mailto:${booth.email}`} onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-white/80 hover:text-white transition"
                    style={{ backgroundColor: 'rgba(255,255,255,0.13)' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <span className="truncate max-w-[180px]">{booth.email}</span>
                  </a>
                )}
                {booth.tel && (
                  <a href={`tel:${booth.tel}`} onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-white/80 hover:text-white transition"
                    style={{ backgroundColor: 'rgba(255,255,255,0.13)' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.4 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.79-1.79a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {booth.tel}
                  </a>
                )}
              </div>
            </div>

            {/* Edit */}
            <button onClick={() => router.push('/booths/edit')}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white border hover:bg-white/20 transition"
              style={{ borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              แก้ไข
            </button>
          </div>
        </div>

        {/* ══ MAIN CONTENT — 2 columns ════════════════════════ */}
        <div className="grid grid-cols-3 gap-5">

          {/* LEFT — Quick Actions + Stats */}
          <div className="col-span-1 space-y-4">

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">เมนูหลัก</p>
              </div>
              <div className="p-2">
                {[
                  { icon: 'M11 21H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v3', label: 'ค้นหางาน Expo', sub: 'สมัครเข้าร่วมงาน', path: '/booths/explore-events' },
                  { icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8', label: 'คำขอของฉัน', sub: 'ติดตามสถานะ', path: '/booths/my-applications' },
                  { icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22,6 12,13 2,6', label: 'คำเชิญ', sub: 'ยอมรับหรือปฏิเสธ', path: '/booths/my-invitations' },
                  { icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75', label: 'ทีมงาน', sub: 'จัดการสมาชิก', path: '/booths/staff' },
                ].map(a => (
                  <button key={a.label} onClick={() => router.push(a.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition group text-left">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition group-hover:scale-105" style={{ backgroundColor: BL }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round">
                        {a.icon.split(' M').map((d, i) => <path key={i} d={i === 0 ? d : 'M' + d}/>)}
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 leading-tight">{a.label}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{a.sub}</p>
                    </div>
                    <svg className="text-gray-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* About card */}
            {booth.detail && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">เกี่ยวกับบูธ</p>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{booth.detail}</p>
              </div>
            )}
          </div>

          {/* RIGHT — Events */}
          <div className="col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: BL }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
                    </svg>
                  </div>
                  <h3 className="font-black text-gray-900 text-sm tracking-tight">งานที่เข้าร่วม</h3>
                  {booth.booth && booth.booth.length > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: BLUE }}>
                      {booth.booth.length}
                    </span>
                  )}
                </div>
                <button onClick={() => router.push('/booths/explore-events')}
                  className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-xs font-bold text-white hover:opacity-90 transition shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  หางาน
                </button>
              </div>

              {/* Grid of event cards */}
              {booth.booth && booth.booth.length > 0 ? (
                <div className="p-4 grid grid-cols-3 gap-3">
                  {booth.booth.map((event) => {
                    const imgUrl = getImageUrl(event.thumbnail);
                    return (
                      <div key={event.boothID}
                        className="group rounded-xl border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => router.push(`/events/${event.expoID}`)}>

                        {/* Thumbnail */}
                        <div className="h-24 relative overflow-hidden"
                          style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}>
                          {imgUrl
                            ? <img src={imgUrl} alt={event.expoTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                            : <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white/30 select-none">
                                {event.expoTitle?.charAt(0) ?? '?'}
                              </div>
                          }
                          {/* Booth chip overlay */}
                          <div className="absolute bottom-2 left-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold text-white shadow-sm"
                              style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                              บูธ {event.boothNo}
                            </span>
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="px-3 py-2.5">
                          <h4 className="font-bold text-gray-900 text-sm leading-snug truncate group-hover:text-[#3674B5] transition-colors">
                            {event.expoTitle}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {event.zoneName && (
                              <span className="text-[11px] text-gray-400">{event.zoneName}</span>
                            )}
                            {event.hall && (
                              <span className="text-[11px] text-gray-400">· {event.hall}</span>
                            )}
                            {event.type && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium border border-gray-100 text-gray-400 ml-auto">
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
                  <div className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center" style={{ backgroundColor: BL }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <p className="font-bold text-gray-900 text-sm mb-1">ยังไม่ได้เข้าร่วมงาน Expo</p>
                  <p className="text-gray-400 text-xs mb-4">ค้นหางานแล้วสมัครบูธได้เลย</p>
                  <button onClick={() => router.push('/booths/explore-events')}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold text-white hover:opacity-90 transition"
                    style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    ค้นหางาน Expo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <JoinModal show={showJoin} code={joinCode} joining={joining}
        onChange={setJoinCode} onJoin={handleJoin}
        onClose={() => { setShowJoin(false); setJoinCode(''); }} />
    </div>
  );
}

// ── Join Modal ──────────────────────────────────────────────────
function JoinModal({ show, code, joining, onChange, onJoin, onClose }: {
  show: boolean; code: string; joining: boolean;
  onChange: (v: string) => void; onJoin: () => void; onClose: () => void;
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: '#EBF3FC' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 className="text-lg font-black text-gray-900 mb-1">ใส่รหัสเข้าร่วมบูธ</h2>
        <p className="text-sm text-gray-400 mb-5">กรอกรหัสที่ได้รับจากเจ้าของบูธ</p>
        <input type="text" value={code} onChange={e => onChange(e.target.value.toUpperCase())}
          placeholder="เช่น ABCD-1234" maxLength={20}
          className="w-full px-4 py-3 rounded-xl border-2 bg-gray-50 text-center text-lg font-mono font-bold tracking-widest focus:outline-none transition mb-4"
          style={{ borderColor: code ? BLUE : '#E5E7EB' }}
          onKeyDown={e => e.key === 'Enter' && onJoin()} />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition text-sm">ยกเลิก</button>
          <button onClick={onJoin} disabled={joining || !code.trim()}
            className="flex-1 py-2.5 text-white font-semibold rounded-xl transition text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE2})` }}>
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