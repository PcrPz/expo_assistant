'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getMyJoinForms, getMyBoothGlobal, cancelJoinBooth,
} from '@/src/features/booths/api/boothGlobalApi';
import { PaymentModal } from './PaymentModal';
import type { JoinForm, JoinFormStatus } from '@/src/features/booths/types/boothGlobal.types';

const BLUE = '#3674B5';
const BLUE2 = '#498AC3';
const BL = '#EBF3FC';

const S: Record<JoinFormStatus, { label: string; bg: string; text: string; dot: string; border: string }> = {
  pending:   { label: 'รอพิจารณา',    bg: '#FEF9EC', text: '#92400E', dot: '#F59E0B', border: '#FDE68A' },
  accepted:  { label: 'อนุมัติแล้ว',  bg: '#ECFDF5', text: '#065F46', dot: '#10B981', border: '#A7F3D0' },
  rejected:  { label: 'ไม่อนุมัติ',   bg: '#FFF1F2', text: '#9F1239', dot: '#F43F5E', border: '#FECDD3' },
  completed: { label: 'ชำระเงินแล้ว', bg: BL,        text: BLUE,     dot: BLUE,      border: '#BFDBFE' },
  cancelled: { label: 'ยกเลิกแล้ว',   bg: '#F9FAFB', text: '#6B7280', dot: '#9CA3AF', border: '#E5E7EB' },
};

// ─── Cancel Modal ─────────────────────────────────────────────

function CancelModal({ form, onClose, onConfirm, loading }: {
  form: JoinForm; onClose: () => void; onConfirm: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl overflow-hidden">
        <div className="h-1 bg-red-400"/>
        <div className="p-5 text-center">
          <div className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <p className="font-black text-gray-900 mb-1">ยกเลิกคำขอ?</p>
          <p className="text-xs text-gray-400 mb-4">{form.expoTitle} · บูธ {form.boothNo}</p>
          <div className="flex gap-2">
            <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">ไม่ใช่</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-red-600 transition">
              {loading
                ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : 'ยืนยันยกเลิก'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Application Card (redesigned) ──────────────────────────

function ApplicationCard({ form, onCancel, onPay }: {
  form: JoinForm; onCancel: (f: JoinForm) => void; onPay: (f: JoinForm) => void;
}) {
  const router = useRouter();
  const sc = S[form.status] || S.pending;
  const isPending         = form.status === 'pending';
  const isAccepted        = form.status === 'accepted';
  const isCompleted       = form.status === 'completed';
  const isRejected        = form.status === 'rejected';
  const isAwaitingPayment = isAccepted && !!form.paymentId;
  const canCancel         = isPending || (isAccepted && !form.paymentId);

  // Type label
  const typeLabel = form.type === 'request_to_join' ? 'คำขอของฉัน' : 'คำเชิญ';

  return (
    <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden group"
      style={{ borderColor: isAwaitingPayment ? '#BFDBFE' : isAccepted ? '#A7F3D0' : isPending ? '#FDE68A' : '#F1F5F9' }}>

      <div className="p-4 flex gap-3">

        {/* Left: status strip */}
        <div className="w-1 rounded-full flex-shrink-0 self-stretch"
          style={{ backgroundColor: sc.dot }}/>

        {/* Center: main info */}
        <div className="flex-1 min-w-0">

          {/* Row 1: expo name + status badge */}
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{typeLabel}</p>
              <div className="flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <h3 className="font-black text-gray-900 text-sm leading-tight line-clamp-1 group-hover:text-[#3674B5] transition-colors">
                  {form.expoTitle}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.dot }}/>
                {sc.label}
              </span>
              {isAwaitingPayment && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white animate-pulse">
                  รอชำระเงิน
                </span>
              )}
            </div>
          </div>

          {/* Row 2: booth info chips */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: BL, color: BLUE }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
              บูธ {form.boothNo}
            </div>
            {form.boothGroupTitle && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 bg-gray-50 border border-gray-100">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                {form.boothGroupTitle}
              </div>
            )}
          </div>

          {/* Row 3: detail message (if any) */}
          {form.detail && (
            <div className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg mb-2"
              style={{ backgroundColor: '#F8FAFC', borderLeft: `2px solid ${BLUE}` }}>
              <svg className="flex-shrink-0 mt-0.5" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p className="text-xs text-gray-500 italic line-clamp-2">"{form.detail}"</p>
            </div>
          )}

          {/* Row 4: actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary actions */}
            {isCompleted && (
              <button onClick={() => router.push(`/events/${form.expoId}`)}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition"
                style={{ background: `linear-gradient(135deg,${BLUE},${BLUE2})` }}>
                จัดการบูธ
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            )}
            {isAccepted && (
              <button onClick={() => onPay(form)}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition shadow-sm"
                style={{ background: `linear-gradient(135deg,${BLUE},${BLUE2})` }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                ชำระเงิน
              </button>
            )}
            {isPending && (
              <button onClick={() => router.push(`/events/${form.expoId}`)}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                ดูรายละเอียดงาน
              </button>
            )}

            {/* Status-only labels */}
            {isRejected && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                ไม่ผ่านการพิจารณา
              </span>
            )}
            {form.status === 'cancelled' && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                ยกเลิกคำขอแล้ว
              </span>
            )}

            {/* Cancel button — spacer push to right */}
            {canCancel && (
              <button onClick={() => onCancel(form)}
                className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                ยกเลิกคำขอ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Main Page ─────────────────────────────────────────────────

export function MyApplicationsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<JoinForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [boothGroupId, setBoothGroupId] = useState('');
  const [activeFilter, setActiveFilter] = useState<JoinFormStatus | 'all'>('all');
  const [cancelTarget, setCancelTarget] = useState<JoinForm | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [payTarget, setPayTarget] = useState<JoinForm | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { booth } = await getMyBoothGlobal();
      setBoothGroupId(booth?.id ?? '');
      const data = await getMyJoinForms(booth?.id ?? '', 'request_to_join');
      setForms(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // ✨ NEW: ใช้ cancelJoinBooth แทน respondToJoinRequest
  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try { await cancelJoinBooth(cancelTarget.requestId); setCancelTarget(null); await loadData(); }
    catch (e) { console.error(e); } finally { setCancelLoading(false); }
  };

  const counts: Record<string, number> = {
    all: forms.length,
    pending:   forms.filter(f => f.status === 'pending').length,
    accepted:  forms.filter(f => f.status === 'accepted').length,
    rejected:  forms.filter(f => f.status === 'rejected').length,
    completed: forms.filter(f => f.status === 'completed').length,
    cancelled: forms.filter(f => f.status === 'cancelled').length,
  };

  const TABS = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'pending', label: 'รอพิจารณา' },
    { key: 'accepted', label: 'อนุมัติแล้ว' },
    { key: 'completed', label: 'ชำระเงินแล้ว' },
    { key: 'rejected', label: 'ไม่อนุมัติ' },
    { key: 'cancelled', label: 'ยกเลิก' },
  ].filter(t => t.key === 'all' || counts[t.key] > 0);

  const filtered = activeFilter === 'all' ? forms : forms.filter(f => f.status === activeFilter);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <svg className="animate-spin w-8 h-8" style={{ color: BLUE }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-7">

        {/* Header */}
        <div className="mb-6">
          <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition mb-4 group">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:-translate-x-0.5 transition-transform"><polyline points="15 18 9 12 15 6"/></svg>
            ย้อนกลับ
          </button>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg,${BLUE},${BLUE2})` }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </div>
              <div>
                <div className="flex items-baseline gap-3">
                  <h1 className="text-2xl font-black text-gray-900">คำขอของฉัน</h1>
                  <span className="text-sm font-bold" style={{ color: BLUE }}>{forms.length} รายการ</span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">คำขอที่คุณส่งหาผู้จัดงาน · รอการพิจารณา</p>
              </div>
            </div>
            <button onClick={() => router.push('/booths/explore-events')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition shadow-sm flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${BLUE},${BLUE2})` }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              สมัครงานใหม่
            </button>
          </div>
        </div>

        {/* 2-column layout */}
        <div className="flex gap-6 items-start">

          {/* Sidebar */}
          <div className="w-60 flex-shrink-0 space-y-1.5 sticky top-6">
            <div className="flex items-center gap-2 px-1 mb-2">
              <div className="w-1 h-4 rounded-full" style={{ backgroundColor: BLUE }}/>
              <p className="text-xs font-bold text-gray-600">ภาพรวม</p>
            </div>
            <button onClick={() => setActiveFilter('all')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition text-left"
              style={{
                borderColor: activeFilter === 'all' ? BLUE : 'transparent',
                backgroundColor: activeFilter === 'all' ? BL : 'white',
                boxShadow: activeFilter === 'all' ? `0 0 0 1px ${BLUE}` : '0 1px 3px rgba(0,0,0,0.06)',
              }}>
              <span className="text-sm font-medium" style={{ color: activeFilter === 'all' ? BLUE : '#374151' }}>ทั้งหมด</span>
              <span className="text-sm font-bold tabular-nums" style={{ color: activeFilter === 'all' ? BLUE : '#111827' }}>{counts.all}</span>
            </button>
            {[
              { key: 'pending',   label: 'รอพิจารณา',    dot: '#F59E0B' },
              { key: 'accepted',  label: 'อนุมัติแล้ว',  dot: '#10B981' },
              { key: 'completed', label: 'ชำระเงินแล้ว', dot: BLUE },
              { key: 'rejected',  label: 'ไม่อนุมัติ',   dot: '#F43F5E' },
              { key: 'cancelled', label: 'ยกเลิก',        dot: '#9CA3AF' },
            ].map(s => (
              <button key={s.key} onClick={() => setActiveFilter(s.key as JoinFormStatus)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition text-left"
                style={{
                  borderColor: activeFilter === s.key ? BLUE : 'transparent',
                  backgroundColor: activeFilter === s.key ? BL : 'white',
                  boxShadow: activeFilter === s.key ? `0 0 0 1px ${BLUE}` : '0 1px 3px rgba(0,0,0,0.06)',
                }}>
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }}/>
                  <span className="text-sm font-medium" style={{ color: activeFilter === s.key ? BLUE : '#374151' }}>{s.label}</span>
                </div>
                <span className="text-sm font-bold tabular-nums" style={{ color: counts[s.key] > 0 ? (activeFilter === s.key ? BLUE : '#111827') : '#D1D5DB' }}>{counts[s.key]}</span>
              </button>
            ))}
          </div>

          {/* Main list */}
          <div className="flex-1 min-w-0 space-y-3">
            {forms.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 mb-1">
                {TABS.map(tab => (
                  <button key={tab.key} onClick={() => setActiveFilter(tab.key as JoinFormStatus | 'all')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition"
                    style={{ backgroundColor: activeFilter === tab.key ? BLUE : 'white', color: activeFilter === tab.key ? 'white' : '#6B7280', border: `1.5px solid ${activeFilter === tab.key ? BLUE : '#E5E7EB'}` }}>
                    {tab.label}
                    <span className="px-1 py-0.5 rounded-full text-[10px] font-black"
                      style={{ backgroundColor: activeFilter === tab.key ? 'rgba(255,255,255,0.25)' : '#F3F4F6', color: activeFilter === tab.key ? 'white' : '#9CA3AF' }}>
                      {counts[tab.key]}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: BL }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <p className="font-black text-gray-800 mb-1">{activeFilter === 'all' ? 'ยังไม่มีคำขอ' : `ไม่มีคำขอที่ "${S[activeFilter as JoinFormStatus]?.label}"`}</p>
                <p className="text-sm text-gray-400 mb-4">สมัครงาน Expo เพื่อเข้าร่วมในฐานะผู้แสดงสินค้า</p>
                {activeFilter === 'all' && (
                  <button onClick={() => router.push('/booths/explore-events')} className="px-5 py-2 rounded-xl text-sm font-bold border-2 hover:opacity-90 transition" style={{ borderColor: BLUE, color: BLUE }}>ค้นหางาน Expo</button>
                )}
              </div>
            ) : (
              filtered.map(form => <ApplicationCard key={form.requestId} form={form} onCancel={setCancelTarget} onPay={setPayTarget}/>)
            )}
          </div>
        </div>
      </div>

      {cancelTarget && <CancelModal form={cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={handleCancel} loading={cancelLoading}/>}
      {payTarget && boothGroupId && (
        <PaymentModal form={payTarget} boothGroupId={boothGroupId} onClose={() => setPayTarget(null)} onSuccess={async () => { setPayTarget(null); await loadData(); }}/>
      )}
    </div>
  );
}