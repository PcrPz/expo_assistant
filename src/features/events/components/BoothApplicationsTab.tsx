// src/features/events/components/organizer/BoothApplicationsTab.tsx
'use client';
import { toast } from '@/src/lib/toast';

import { useState, useEffect } from 'react';
import { getMinioFileUrl } from '@/src/features/minio/api/minioApi';
import { getJoinFormsByExpo, respondToJoinRequest, getBoothGroupDetail, cancelJoinBooth } from '@/src/features/booths/api/boothGlobalApi';
import type { JoinFormByExpo, JoinFormStatus, BoothGlobal } from '@/src/features/booths/types/boothGlobal.types';

interface BoothApplicationsTabProps {
  eventId: string;
}

// ─── Status Badge ───────────────────────────────────────────────

const STATUS_CONFIG: Record<JoinFormStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending:   { label: 'รอดำเนินการ', bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400' },
  accepted:  { label: 'อนุมัติแล้ว', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  rejected:  { label: 'ปฏิเสธแล้ว', bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500' },
  completed: { label: 'ชำระเงินแล้ว',bg: 'bg-blue-50',   text: 'text-blue-700',    dot: 'bg-blue-500' },
  cancelled: { label: 'ยกเลิกแล้ว',  bg: 'bg-gray-50',   text: 'text-gray-600',    dot: 'bg-gray-400' },
};

function StatusBadge({ status }: { status: JoinFormStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`}/>
      {cfg.label}
    </span>
  );
}

const STATUS_SOLID: Record<JoinFormStatus, { label: string; bg: string; text: string; border: string }> = {
  pending:   { label: 'รอดำเนินการ', bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border border-amber-300' },
  accepted:  { label: 'อนุมัติแล้ว', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border border-emerald-300' },
  rejected:  { label: 'ปฏิเสธแล้ว', bg: 'bg-red-50',     text: 'text-red-600',     border: 'border border-red-300' },
  completed: { label: 'ชำระเงินแล้ว',bg: 'bg-blue-50',   text: 'text-[#3674B5]',   border: 'border border-blue-300' },
  cancelled: { label: 'ยกเลิกแล้ว',  bg: 'bg-gray-50',   text: 'text-gray-600',    border: 'border border-gray-300' },
};

function StatusBadgeSolid({ status }: { status: JoinFormStatus }) {
  const cfg = STATUS_SOLID[status] || STATUS_SOLID.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

// ─── Confirm Modal ──────────────────────────────────────────────

function ConfirmModal({ form, action, onConfirm, onCancel, loading }: {
  form: JoinFormByExpo; action: 'accept' | 'reject';
  onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  const isAccept = action === 'accept';
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${isAccept ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {isAccept
            ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          }
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-1">{isAccept ? 'อนุมัติคำขอ?' : 'ปฏิเสธคำขอ?'}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{form.boothGroupTitle} — บูธ {form.boothNo}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition text-sm disabled:opacity-50">
            ยกเลิก
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-xl transition text-sm disabled:opacity-50 flex items-center justify-center gap-2 ${isAccept ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
            {loading
              ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              : isAccept ? 'อนุมัติ' : 'ปฏิเสธ'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cancel Modal (organizer ยกเลิก) ────────────────────────────

function CancelModal({ form, onConfirm, onCancel, loading }: {
  form: JoinFormByExpo; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-orange-100">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-1">ยกเลิกคำ{form.type === 'request_to_join' ? 'ขอ' : 'เชิญ'}นี้?</h3>
        <p className="text-sm text-gray-500 text-center mb-1">{form.boothGroupTitle} — บูธ {form.boothNo}</p>
        <p className="text-xs text-orange-500 text-center mb-6">
          {form.type === 'request_to_join'
            ? 'บูธกลุ่มนี้ยังไม่ได้ชำระเงิน หากยกเลิกจะต้องเชิญหรืออนุมัติใหม่'
            : 'คำเชิญที่ส่งออกไปจะถูกยกเลิก บูธกลุ่มจะไม่สามารถตอบรับได้อีก'}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition text-sm disabled:opacity-50">
            ไม่ใช่
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 px-4 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition text-sm disabled:opacity-50 flex items-center justify-center gap-2">
            {loading
              ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              : 'ยืนยันยกเลิก'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Modal (shared) ──────────────────────────────────────

function DetailModal({ form, onClose, onRespond, isRequest }: {
  form: JoinFormByExpo; onClose: () => void;
  onRespond: (form: JoinFormByExpo, action: 'accept' | 'reject') => void;
  isRequest: boolean;
}) {
  const isPending = form.status === 'pending';
  const [boothGroup, setBoothGroup] = useState<BoothGlobal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { booth } = await getBoothGroupDetail(form.boothGroupId);
        setBoothGroup(booth);
      } catch (err) {
        console.error('Failed to load detail:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [form.boothGroupId]);

  const profilePicUrl = boothGroup?.profilePic ? getMinioFileUrl(boothGroup.profilePic) : null;
  const color = isRequest ? '#3674B5' : '#498AC3';
  const bgClass = isRequest ? 'bg-[#3674B5]' : 'bg-[#498AC3]';
  const lightClass = isRequest ? 'bg-blue-50' : 'bg-sky-50';
  const textClass = isRequest ? 'text-[#3674B5]' : 'text-[#498AC3]';
  const borderClass = isRequest ? 'border-blue-100' : 'border-sky-100';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[88vh] overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-[18px] border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold ${lightClass} ${textClass}`}>
              {isRequest
                ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/></svg>คำขอเข้าร่วม</>
                : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>คำเชิญจากงาน</>
              }
            </span>
            <StatusBadge status={form.status as JoinFormStatus} />
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* profile */}
          <div className="px-5 pt-5 pb-4 flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center text-xl font-black text-white ${bgClass}`}>
              {loading
                ? <svg className="animate-spin w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : profilePicUrl
                  ? <img src={profilePicUrl} alt={boothGroup?.title} className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  : form.boothGroupTitle?.charAt(0)?.toUpperCase() || '?'
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400 mb-0.5">{isRequest ? 'บูธกลุ่มที่ขอเข้าร่วม' : 'บูธกลุ่มที่ได้รับเชิญ'}</p>
              <h2 className="text-base font-bold text-gray-900 leading-snug truncate">{boothGroup?.title || form.boothGroupTitle}</h2>
              {boothGroup?.company && (
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  {boothGroup.company}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StatusBadge status={form.status as JoinFormStatus} />
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${lightClass} ${textClass}`}>บูธ {form.boothNo}</span>
              </div>
            </div>
          </div>

          {/* เกี่ยวกับ */}
          {!loading && boothGroup?.detail && (
            <><div className="h-px mx-5 bg-gray-100"/>
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">เกี่ยวกับ</p>
              <p className="text-sm text-gray-600 leading-relaxed">{boothGroup.detail}</p>
            </div></>
          )}

          {/* ติดต่อ */}
          {!loading && boothGroup && (boothGroup.email || boothGroup.tel || boothGroup.website1 || boothGroup.website2) && (
            <><div className="h-px mx-5 bg-gray-100"/>
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ข้อมูลติดต่อ</p>
              <div className="divide-y divide-gray-50">
                {boothGroup.email && (
                  <div className="flex items-center gap-3 py-2.5">
                    <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${lightClass}`}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <div className="min-w-0"><p className="text-[10px] text-gray-400">อีเมล</p><p className="text-sm font-medium text-gray-800 truncate">{boothGroup.email}</p></div>
                  </div>
                )}
                {boothGroup.tel && (
                  <div className="flex items-center gap-3 py-2.5">
                    <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${lightClass}`}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <div><p className="text-[10px] text-gray-400">เบอร์โทร</p><p className="text-sm font-medium text-gray-800">{boothGroup.tel}</p></div>
                  </div>
                )}
                {boothGroup.website1 && (
                  <a href={boothGroup.website1} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-2.5 group">
                    <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${lightClass}`}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    </div>
                    <div className="flex-1 min-w-0"><p className="text-[10px] text-gray-400">เว็บไซต์</p><p className={`text-sm font-medium truncate group-hover:underline ${textClass}`}>{boothGroup.website1}</p></div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                )}
              </div>
            </div></>
          )}

          {/* เหตุผล */}
          {form.detail && (
            <><div className="h-px mx-5 bg-gray-100"/>
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                {isRequest ? 'เหตุผลในการขอเข้าร่วม' : 'ข้อความที่ส่ง'}
              </p>
              <div className={`rounded-xl px-4 py-3 border ${lightClass} ${borderClass}`}>
                <p className="text-sm text-gray-700 leading-relaxed">"{form.detail}"</p>
              </div>
            </div></>
          )}

          {/* ประวัติงาน */}
          {!loading && boothGroup?.booth && boothGroup.booth.length > 0 && (
            <><div className="h-px mx-5 bg-gray-100"/>
            <div className="px-5 py-4 pb-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                ประวัติการเข้าร่วมงาน <span className="font-normal text-gray-300 normal-case">({boothGroup.booth.length})</span>
              </p>
              <div className="space-y-2">
                {boothGroup.booth.map((b, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{b.expoTitle}</p>
                      {(b.hall || b.zoneName) && <p className="text-xs text-gray-400 mt-0.5">{[b.hall, b.zoneName].filter(Boolean).join(' · ')}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      {b.type && (
                        <span className="text-[10px] px-2 py-0.5 bg-white border border-gray-200 rounded-md text-gray-500 font-medium">
                          {b.type === 'booth' ? 'บูธ' : b.type === 'stage' ? 'เวที' : b.type}
                        </span>
                      )}
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${lightClass} ${textClass}`}>{b.boothNo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div></>
          )}
        </div>

        {/* footer — เฉพาะ request + pending */}
        {isRequest && isPending && (
          <div className="flex-shrink-0 px-5 py-[18px] border-t border-gray-100 flex gap-2.5 bg-white">
            <button onClick={() => { onClose(); onRespond(form, 'reject'); }} disabled={!!(form.status === 'accepted' && form.paymentId)}
              className="flex-1 py-2.5 rounded-xl border-2 border-red-100 bg-white text-red-500 text-sm font-semibold hover:bg-red-50 transition flex items-center justify-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ปฏิเสธ
            </button>
            <button onClick={() => { onClose(); onRespond(form, 'accept'); }}
              className="flex-1 py-2.5 rounded-xl bg-[#3674B5] text-white text-sm font-semibold hover:bg-[#2d5a8f] transition flex items-center justify-center gap-1.5 shadow-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              อนุมัติคำขอ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Request Card ───────────────────────────────────────────────

// accent bar color per status
const STATUS_BAR: Record<string, string> = {
  pending:   'bg-amber-400',
  accepted:  'bg-emerald-500',
  rejected:  'bg-red-400',
  completed: 'bg-[#3674B5]',
  cancelled: 'bg-gray-400',
};

// ─── Requests Table ─────────────────────────────────────────────

// sort: pending ก่อน → ที่เหลือเรียง alphabet
const STATUS_ORDER: Record<string, number> = { pending: 0, accepted: 1, rejected: 2, completed: 3, cancelled: 4 };
function sortForms(forms: JoinFormByExpo[]) {
  return [...forms].sort((a, b) => {
    const so = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
    if (so !== 0) return so;
    return (a.boothGroupTitle || '').localeCompare(b.boothGroupTitle || '', 'th');
  });
}

function RequestsTable({ forms, onRespond, onCancel }: { forms: JoinFormByExpo[]; onRespond: (f: JoinFormByExpo, a: 'accept' | 'reject') => void; onCancel: (f: JoinFormByExpo) => void }) {
  const [selectedForm, setSelectedForm] = useState<JoinFormByExpo | null>(null);
  const sorted = sortForms(forms);

  // cols: [ชื่อบูธกลุ่ม | บูธ | สถานะ | การดำเนินการ | รายละเอียด]
  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* header */}
        <div className="grid grid-cols-[1fr_80px_140px_190px_52px] border-b border-gray-100 bg-gray-50">
          <div className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">ชื่อบูธ</div>
          <div className="px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">บูธ</div>
          <div className="px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">สถานะ</div>
          <div className="px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">ดำเนินการ</div>
          <div className="border-l border-gray-100"/>
        </div>

        {sorted.map((form, i) => {
          const isPending = form.status === 'pending';
          return (
            <div key={form.requestId}
              className={`grid grid-cols-[1fr_80px_140px_190px_52px] items-center transition-colors ${
                i !== sorted.length - 1 ? 'border-b border-gray-100' : ''
              } ${isPending ? 'bg-amber-50/40 hover:bg-amber-50/70 border-l-2 border-l-amber-400' : 'hover:bg-gray-50/60'}`}>

              {/* ชื่อบูธกลุ่ม */}
              <div className="px-6 py-3.5 flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-black text-white bg-[#3674B5] relative">
                  {form.boothGroupTitle?.charAt(0)?.toUpperCase() || '?'}
                  {isPending && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white"/>}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{form.boothGroupTitle}</p>
                  {form.detail && <p className="text-xs text-gray-400 truncate italic">"{form.detail}"</p>}
                </div>
              </div>

              {/* บูธ */}
              <div className="px-3 py-3.5">
                <span className="text-sm font-bold text-[#3674B5]">{form.boothNo}</span>
              </div>

              {/* สถานะ */}
              <div className="px-3 py-3.5">
                <StatusBadge status={form.status as JoinFormStatus} />
              </div>

              {/* การดำเนินการ — เฉพาะ pending */}
              <div className="px-3 py-3.5 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                {isPending ? (
                  <>
                    <button onClick={() => onRespond(form, 'reject')}
                      className="h-8 px-3 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition flex items-center gap-1.5 text-xs font-semibold"
                      title="ปฏิเสธ">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      ปฏิเสธ
                    </button>
                    <button onClick={() => onRespond(form, 'accept')}
                      className="h-8 px-3 rounded-lg bg-[#3674B5] text-white hover:bg-[#2d5a8f] transition flex items-center gap-1.5 text-xs font-semibold shadow-sm"
                      title="อนุมัติ">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      อนุมัติ
                    </button>
                  </>
                ) : form.status === 'accepted' && form.paymentId ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    กำลังชำระเงิน
                  </span>
                ) : form.status === 'accepted' && !form.paymentId ? (
                  <button onClick={() => onCancel(form)}
                    className="h-8 px-3 rounded-lg border border-orange-200 text-orange-500 hover:bg-orange-50 transition flex items-center gap-1.5 text-xs font-semibold"
                    title="ยกเลิกคำขอ">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    ยกเลิก
                  </button>
                ) : (
                  <span className="text-xs text-gray-300">—</span>
                )}
              </div>

              {/* ดูรายละเอียด — แยก column */}
              <div className="px-2 py-3.5 flex items-center justify-center border-l border-gray-100">
                <button onClick={() => setSelectedForm(form)}
                  className="w-8 h-8 rounded-lg text-gray-400 hover:bg-[#EEF4FB] hover:text-[#3674B5] transition flex items-center justify-center"
                  title="ดูรายละเอียด">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedForm && (
        <DetailModal form={selectedForm} onClose={() => setSelectedForm(null)} onRespond={onRespond} isRequest={true} />
      )}
    </>
  );
}

// ─── Invites Table ───────────────────────────────────────────────

function InvitesTable({ forms, onRespond, onCancel }: { forms: JoinFormByExpo[]; onRespond: (f: JoinFormByExpo, a: 'accept' | 'reject') => void; onCancel: (f: JoinFormByExpo) => void }) {
  const [selectedForm, setSelectedForm] = useState<JoinFormByExpo | null>(null);
  const sorted = sortForms(forms);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="grid grid-cols-[1fr_80px_140px_160px_52px] border-b border-gray-100 bg-gray-50">
          <div className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">ชื่อบูธ</div>
          <div className="px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">บูธ</div>
          <div className="px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">สถานะ</div>
          <div className="px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">ดำเนินการ</div>
          <div className="border-l border-gray-100"/>
        </div>

        {sorted.map((form, i) => {
          const isPending   = form.status === 'pending';
          const isAcceptedNoPay = form.status === 'accepted' && !form.paymentId;
          const isAcceptedPay   = form.status === 'accepted' && !!form.paymentId;
          const canCancelInvite = isPending || isAcceptedNoPay;

          return (
            <div key={form.requestId}
              className={`grid grid-cols-[1fr_80px_140px_160px_52px] items-center transition-colors ${
                i !== sorted.length - 1 ? 'border-b border-gray-100' : ''
              } ${isPending ? 'bg-amber-50/30 hover:bg-amber-50/50' : 'hover:bg-gray-50/60'}`}>

              <div className="px-6 py-3.5 flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-black text-white bg-[#498AC3] relative">
                  {form.boothGroupTitle?.charAt(0)?.toUpperCase() || '?'}
                  {isPending && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white"/>}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{form.boothGroupTitle}</p>
                  {form.detail && <p className="text-xs text-gray-400 truncate italic">"{form.detail}"</p>}
                </div>
              </div>

              <div className="px-3 py-3.5">
                <span className="text-sm font-bold text-[#498AC3]">{form.boothNo}</span>
              </div>

              <div className="px-3 py-3.5">
                <StatusBadge status={form.status as JoinFormStatus} />
              </div>

              {/* ดำเนินการ */}
              <div className="px-3 py-3.5 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                {isAcceptedPay ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    กำลังชำระเงิน
                  </span>
                ) : canCancelInvite ? (
                  <button onClick={() => onCancel(form)}
                    className="h-8 px-3 rounded-lg border border-orange-200 text-orange-500 hover:bg-orange-50 transition flex items-center gap-1.5 text-xs font-semibold"
                    title="ยกเลิกคำเชิญ">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    ยกเลิกเชิญ
                  </button>
                ) : (
                  <span className="text-xs text-gray-300">—</span>
                )}
              </div>

              {/* ดูรายละเอียด column */}
              <div className="px-2 py-3.5 flex items-center justify-center border-l border-gray-100">
                <button onClick={() => setSelectedForm(form)}
                  className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition flex items-center justify-center"
                  title="ดูรายละเอียด">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedForm && (
        <DetailModal form={selectedForm} onClose={() => setSelectedForm(null)} onRespond={onRespond} isRequest={false} />
      )}
    </>
  );
}

// ─── (unused card stubs — kept for type safety) ─────────────────

function RequestCard({ form, onRespond }: { form: JoinFormByExpo; onRespond: (f: JoinFormByExpo, a: 'accept' | 'reject') => void }) {
  const isPending = form.status === 'pending';
  const [showDetail, setShowDetail] = useState(false);
  const barColor = STATUS_BAR[form.status] || 'bg-gray-300';

  return (
    <>
      <div onClick={() => setShowDetail(true)}
        className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer select-none overflow-hidden flex">

        {/* accent bar ซ้าย */}
        <div className={`w-1 flex-shrink-0 ${barColor}`}/>

        <div className="flex-1 min-w-0">
          {/* main row */}
          <div className="px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-black text-white bg-[#3674B5]">
              {form.boothGroupTitle?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate leading-snug">{form.boothGroupTitle}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={form.status as JoinFormStatus} />
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs font-bold text-[#3674B5]">บูธ {form.boothNo}</span>
              </div>
            </div>
            {/* arrow hint */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" className="flex-shrink-0">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>

          {/* เหตุผล (ถ้ามี) */}
          {form.detail && (
            <div className="px-4 pb-3">
              <p className="text-xs text-gray-500 line-clamp-1 italic">"{form.detail}"</p>
            </div>
          )}

          {/* action buttons — pending only */}
          {isPending && (
            <div className="px-4 pb-3.5 flex gap-2" onClick={e => e.stopPropagation()}>
              <button onClick={() => onRespond(form, 'reject')}
                className="flex-1 py-2 border border-red-200 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                ปฏิเสธ
              </button>
              <button onClick={() => onRespond(form, 'accept')}
                className="flex-1 py-2 bg-[#3674B5] text-white text-xs font-semibold rounded-xl hover:bg-[#2d5a8f] transition flex items-center justify-center gap-1 shadow-sm">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                อนุมัติ
              </button>
            </div>
          )}
          {/* ✨ NEW: กำลังชำระเงิน — ห้าม reject */}
          {form.status === 'accepted' && form.paymentId && (
            <div className="px-4 pb-3.5" onClick={e => e.stopPropagation()}>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl w-full justify-center">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ผู้เข้าร่วมกำลังชำระเงิน
              </span>
            </div>
          )}
        </div>
      </div>

      {showDetail && <DetailModal form={form} onClose={() => setShowDetail(false)} onRespond={onRespond} isRequest={true} />}
    </>
  );
}

// ─── Invite Card ────────────────────────────────────────────────

function InviteCard({ form, onRespond }: { form: JoinFormByExpo; onRespond: (f: JoinFormByExpo, a: 'accept' | 'reject') => void }) {
  const [showDetail, setShowDetail] = useState(false);
  const barColor = STATUS_BAR[form.status] || 'bg-gray-300';

  return (
    <>
      <div onClick={() => setShowDetail(true)}
        className="bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer select-none overflow-hidden flex">

        {/* accent bar ซ้าย */}
        <div className={`w-1 flex-shrink-0 ${barColor}`}/>

        <div className="flex-1 min-w-0 px-4 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-black text-white bg-[#498AC3]">
            {form.boothGroupTitle?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate leading-snug">{form.boothGroupTitle}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={form.status as JoinFormStatus} />
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs font-bold text-[#498AC3]">บูธ {form.boothNo}</span>
            </div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" className="flex-shrink-0">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>

      {showDetail && <DetailModal form={form} onClose={() => setShowDetail(false)} onRespond={onRespond} isRequest={false} />}
    </>
  );
}

// ─── Requests Tab ───────────────────────────────────────────────

function RequestsTab({ forms, onRespond, onCancel }: { forms: JoinFormByExpo[]; onRespond: (f: JoinFormByExpo, a: 'accept' | 'reject') => void; onCancel: (f: JoinFormByExpo) => void }) {
  const [statusFilter, setStatusFilter] = useState<'all' | JoinFormStatus>('all');
  const pending = forms.filter(f => f.status === 'pending');
  const filtered = statusFilter === 'all' ? forms : forms.filter(f => f.status === statusFilter);

  const STATUS_FILTERS = [
    { id: 'all' as const, label: 'ทุกสถานะ' },
    { id: 'pending' as const, label: 'รอดำเนินการ' },
    { id: 'accepted' as const, label: 'อนุมัติแล้ว' },
    { id: 'rejected' as const, label: 'ปฏิเสธแล้ว' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-[18px] flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[#3674B5]">คำขอเข้าร่วมทั้งหมด</p>
          <p className="text-xs text-blue-400 mt-0.5">บูธกลุ่มส่งคำขอมายังงานของคุณ</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-2xl font-black text-[#3674B5]">{forms.length}</p>
            <p className="text-[10px] text-blue-400">ทั้งหมด</p>
          </div>
          {pending.length > 0 && (
            <div className="text-center bg-white rounded-xl px-3 py-1.5 border border-amber-200">
              <p className="text-2xl font-black text-amber-600">{pending.length}</p>
              <p className="text-[10px] text-amber-400">รอดำเนินการ</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(f => (
          <button key={f.id} onClick={() => setStatusFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === f.id ? 'bg-[#3674B5] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0
        ? <EmptyState message={forms.length === 0 ? 'ยังไม่มีคำขอเข้าร่วม' : 'ไม่มีรายการในหมวดนี้'} />
        : <RequestsTable forms={filtered} onRespond={onRespond} onCancel={onCancel} />
      }
    </div>
  );
}

// ─── Invites Tab ────────────────────────────────────────────────

function InvitesTab({ forms, onRespond, onCancel }: { forms: JoinFormByExpo[]; onRespond: (f: JoinFormByExpo, a: 'accept' | 'reject') => void; onCancel: (f: JoinFormByExpo) => void }) {
  const [statusFilter, setStatusFilter] = useState<'all' | JoinFormStatus>('all');
  const filtered = statusFilter === 'all' ? forms : forms.filter(f => f.status === statusFilter);

  const STATUS_FILTERS = [
    { id: 'all' as const, label: 'ทุกสถานะ' },
    { id: 'pending' as const, label: 'รอตอบรับ' },
    { id: 'accepted' as const, label: 'ตอบรับแล้ว' },
    { id: 'rejected' as const, label: 'ปฏิเสธแล้ว' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-sky-50 border border-sky-100 rounded-2xl px-6 py-[18px] flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[#498AC3]">คำเชิญจากงาน</p>
          <p className="text-xs text-sky-400 mt-0.5">บูธกลุ่มที่คุณส่งคำเชิญไป</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-[#498AC3]">{forms.length}</p>
          <p className="text-[10px] text-sky-400">ส่งแล้ว</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(f => (
          <button key={f.id} onClick={() => setStatusFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              statusFilter === f.id ? 'bg-[#498AC3] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0
        ? <EmptyState message={forms.length === 0 ? 'ยังไม่มีคำเชิญที่ส่งออกไป' : 'ไม่มีรายการในหมวดนี้'} />
        : <InvitesTable forms={filtered} onRespond={onRespond} onCancel={onCancel} />
      }
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
          <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/>
        </svg>
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

type MainTab = 'requests' | 'invites';

export function BoothApplicationsTab({ eventId }: BoothApplicationsTabProps) {
  const [forms, setForms] = useState<JoinFormByExpo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<MainTab>('requests');
  const [confirmState, setConfirmState] = useState<{ form: JoinFormByExpo; action: 'accept' | 'reject' } | null>(null);
  const [responding, setResponding] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<JoinFormByExpo | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => { loadForms(); }, [eventId]);

  const loadForms = async () => {
    setLoading(true);
    try { setForms(await getJoinFormsByExpo(eventId)); }
    catch (err) { console.error('loadForms error:', err); }
    finally { setLoading(false); }
  };

  const handleRespond = async () => {
    if (!confirmState) return;
    setResponding(true);
    try {
      await respondToJoinRequest(confirmState.form.requestId, confirmState.action === 'accept');
      setConfirmState(null);
      await loadForms();
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาด');
    } finally { setResponding(false); }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelJoinBooth(cancelTarget.requestId);
      toast.success('ยกเลิกสำเร็จ');
      setCancelTarget(null);
      await loadForms();
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการยกเลิก');
    } finally { setCancelling(false); }
  };

  const requests = forms.filter(f => f.type === 'request_to_join');
  const invites  = forms.filter(f => f.type === 'invite_to_join');
  const pendingRequests = requests.filter(f => f.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg className="animate-spin w-8 h-8 text-[#3674B5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle className="opacity-25" cx="12" cy="12" r="10"/>
          <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">การเข้าร่วมบูธ</h2>
          <p className="text-sm text-gray-400 mt-0.5">จัดการคำขอและคำเชิญเข้าร่วมบูธในงาน</p>
        </div>
        <button onClick={loadForms} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition" title="รีเฟรช">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1 shadow-sm">
        {([
          { id: 'requests' as MainTab, label: 'คำขอเข้าร่วม', count: requests.length, pending: pendingRequests,
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/></svg>,
            activeGradient: 'linear-gradient(135deg, #3674B5, #498AC3)', activeShadow: 'rgba(54,116,181,0.25)',
          },
          { id: 'invites' as MainTab, label: 'คำเชิญจากงาน', count: invites.length, pending: 0,
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>,
            activeGradient: 'linear-gradient(135deg, #498AC3, #749BC2)', activeShadow: 'rgba(73,138,195,0.25)',
          },
        ] as const).map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl transition-all text-sm font-semibold"
              style={{
                background: active ? tab.activeGradient : 'transparent',
                color: active ? 'white' : '#6B7280',
                boxShadow: active ? `0 2px 8px ${tab.activeShadow}` : 'none',
              }}>
              {tab.icon}
              <span className="font-bold">{tab.label}</span>
              <span className="text-xs font-black px-2 py-0.5 rounded-full"
                style={{ background: active ? 'rgba(255,255,255,0.2)' : '#F3F4F6', color: active ? 'white' : '#6B7280' }}>
                {tab.count}
              </span>
              {tab.pending > 0 && (
                <span className="text-xs font-black px-2 py-0.5 rounded-full"
                  style={{ background: active ? 'rgba(251,191,36,0.3)' : '#FEF3C7', color: active ? 'white' : '#B45309' }}>
                  {tab.pending} รอ
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* content */}
      {activeTab === 'requests'
        ? <RequestsTab forms={requests} onRespond={(f, a) => setConfirmState({ form: f, action: a })} onCancel={setCancelTarget} />
        : <InvitesTab  forms={invites}  onRespond={(f, a) => setConfirmState({ form: f, action: a })} onCancel={setCancelTarget} />
      }

      {confirmState && (
        <ConfirmModal form={confirmState.form} action={confirmState.action}
          onConfirm={handleRespond} onCancel={() => setConfirmState(null)} loading={responding} />
      )}

      {cancelTarget && (
        <CancelModal form={cancelTarget}
          onConfirm={handleCancel} onCancel={() => setCancelTarget(null)} loading={cancelling} />
      )}
    </div>
  );
}