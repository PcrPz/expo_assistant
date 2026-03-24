'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getMyJoinForms, getMyBoothGlobal, respondToJoinRequest, cancelJoinBooth,
} from '@/src/features/booths/api/boothGlobalApi';
import { PaymentModal } from './PaymentModal';
import type { JoinForm, JoinFormStatus } from '@/src/features/booths/types/boothGlobal.types';

const BLUE = '#3674B5';
const BLUE2 = '#498AC3';
const BL = '#EBF3FC';

const S: Record<JoinFormStatus, { label: string; bg: string; text: string; dot: string; border: string }> = {
  pending:   { label: 'รอตอบรับ',     bg: '#FEF9EC', text: '#92400E', dot: '#F59E0B', border: '#FDE68A' },
  accepted:  { label: 'ยอมรับแล้ว',   bg: '#ECFDF5', text: '#065F46', dot: '#10B981', border: '#A7F3D0' },
  rejected:  { label: 'ปฏิเสธแล้ว',   bg: '#FFF1F2', text: '#9F1239', dot: '#F43F5E', border: '#FECDD3' },
  completed: { label: 'ชำระเงินแล้ว', bg: BL,        text: BLUE,     dot: BLUE,      border: '#BFDBFE' },
  cancelled: { label: 'ยกเลิกแล้ว',   bg: '#F9FAFB', text: '#6B7280', dot: '#9CA3AF', border: '#E5E7EB' },
};

// ─── Invitation Card ──────────────────────────────────────────

function InvitationCard({ form, onRespond, onPay, onCancel, actionLoading, cancelLoading }: {
  form: JoinForm;
  onRespond: (f: JoinForm, accept: boolean) => void;
  onPay: (f: JoinForm) => void;
  onCancel: (f: JoinForm) => void;
  actionLoading: string | null;
  cancelLoading: string | null;
}) {
  const router = useRouter();
  const sc = S[form.status] || S.pending;
  const isPending         = form.status === 'pending';
  const isAccepted        = form.status === 'accepted';
  const isCompleted       = form.status === 'completed';
  const isLoading         = actionLoading === form.requestId;
  const isCancelLoading   = cancelLoading === form.requestId;
  const isAwaitingPayment = isAccepted && !!form.paymentId;
  const canCancel         = isPending || (isAccepted && !form.paymentId);

  return (
    <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden group"
      style={{ borderColor: isPending ? '#FDE68A' : isAwaitingPayment ? '#BFDBFE' : isAccepted ? '#A7F3D0' : '#F1F5F9' }}>

      <div className="p-4 flex gap-3">

        {/* Left: status strip */}
        <div className="w-1 rounded-full flex-shrink-0 self-stretch"
          style={{ backgroundColor: sc.dot }}/>

        {/* Center: main info */}
        <div className="flex-1 min-w-0">

          {/* Row 1: expo name + status badges */}
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">คำเชิญจากผู้จัดงาน</p>
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
                </svg>
                <h3 className="font-black text-gray-900 text-[15px] leading-tight line-clamp-1 group-hover:text-[#3674B5] transition-colors">
                  {form.expoTitle}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.dot }}/>
                {sc.label}
              </span>
              {isPending && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: BL, color: BLUE }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                  ใหม่
                </span>
              )}
              {isAwaitingPayment && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white animate-pulse">
                  รอชำระเงิน
                </span>
              )}
            </div>
          </div>

          {/* Row 2: booth info chips */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold"
              style={{ backgroundColor: BL, color: BLUE }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
              บูธ {form.boothNo}
            </div>
          </div>

          {/* Row 3: detail message */}
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
            {/* Pending: ปฏิเสธ + ยอมรับ */}
            {isPending && (
              <>
                <button onClick={() => onRespond(form, false)} disabled={isLoading}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40">
                  {isLoading ? '...' : <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    ปฏิเสธ
                  </>}
                </button>
                <button onClick={() => onRespond(form, true)} disabled={isLoading}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition shadow-sm disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg,${BLUE},${BLUE2})` }}>
                  {isLoading
                    ? <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>ยอมรับคำเชิญ</>
                  }
                </button>
              </>
            )}

            {/* Accepted: ชำระเงิน */}
            {isAccepted && (
              <button onClick={() => onPay(form)}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition shadow-sm"
                style={{ background: `linear-gradient(135deg,${BLUE},${BLUE2})` }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                ชำระเงิน
              </button>
            )}

            {/* Completed: จัดการบูธ */}
            {isCompleted && (
              <button onClick={() => router.push(`/events/${form.expoId}`)}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
                style={{ background: `linear-gradient(135deg,${BLUE},${BLUE2})` }}>
                จัดการบูธ
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            )}

            {/* Rejected */}
            {form.status === 'rejected' && (
              <button onClick={() => router.push(`/events/${form.expoId}`)}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-xs font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
                ดูรายละเอียด
              </button>
            )}

            {/* Cancelled */}
            {form.status === 'cancelled' && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                ยกเลิกแล้ว
              </span>
            )}

            {/* Cancel button — pushed right */}
            {canCancel && (
              <button onClick={() => onCancel(form)} disabled={isCancelLoading}
                className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-40">
                {isCancelLoading
                  ? <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle className="opacity-25" cx="12" cy="12" r="10"/><path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                }
                ยกเลิกคำเชิญ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Main Page ─────────────────────────────────────────────────

export function MyInvitationsPage() {
  const router = useRouter();
  const [forms, setForms] = useState<JoinForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [boothGroupId, setBoothGroupId] = useState('');
  const [activeFilter, setActiveFilter] = useState<JoinFormStatus | 'all'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [payTarget, setPayTarget] = useState<JoinForm | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { booth } = await getMyBoothGlobal();
      setBoothGroupId(booth?.id ?? '');
      const data = await getMyJoinForms(booth?.id ?? '', 'invite_to_join');
      setForms(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // ของเดิม — ยอมรับ/ปฏิเสธ ใช้ respondToJoinRequest เหมือนเดิม
  const handleRespond = async (form: JoinForm, accept: boolean) => {
    setActionLoading(form.requestId);
    try { await respondToJoinRequest(form.requestId, accept); await loadData(); }
    catch (e) { console.error(e); } finally { setActionLoading(null); }
  };

  // ✨ NEW: ยกเลิกใช้ cancelJoinBooth
  const handleCancel = async (form: JoinForm) => {
    setCancelLoading(form.requestId);
    try { await cancelJoinBooth(form.requestId); await loadData(); }
    catch (e) { console.error(e); } finally { setCancelLoading(null); }
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
    { key: 'pending', label: 'รอตอบรับ' },
    { key: 'accepted', label: 'ยอมรับแล้ว' },
    { key: 'completed', label: 'ชำระเงินแล้ว' },
    { key: 'rejected', label: 'ปฏิเสธแล้ว' },
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
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg,${BLUE},${BLUE2})` }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="text-2xl font-black text-gray-900">คำเชิญของฉัน</h1>
                <span className="text-sm font-bold" style={{ color: BLUE }}>{forms.length} รายการ</span>
              </div>
              <p className="text-sm text-gray-400 mt-0.5">ผู้จัดงานส่งคำเชิญมาให้คุณ · รอการตอบรับ</p>
            </div>
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
              { key: 'pending',   label: 'รอตอบรับ',     dot: '#F59E0B' },
              { key: 'accepted',  label: 'ยอมรับแล้ว',   dot: '#10B981' },
              { key: 'completed', label: 'ชำระเงินแล้ว', dot: BLUE },
              { key: 'rejected',  label: 'ปฏิเสธแล้ว',   dot: '#F43F5E' },
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
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.5" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                </div>
                <p className="font-black text-gray-800 mb-1">{activeFilter === 'all' ? 'ยังไม่มีคำเชิญ' : `ไม่มีคำเชิญที่ "${S[activeFilter as JoinFormStatus]?.label}"`}</p>
                <p className="text-sm text-gray-400">เมื่อผู้จัดงานส่งคำเชิญมา จะปรากฏที่นี่</p>
              </div>
            ) : (
              filtered.map(form => (
                <InvitationCard
                  key={form.requestId}
                  form={form}
                  onRespond={handleRespond}
                  onPay={setPayTarget}
                  onCancel={handleCancel}
                  actionLoading={actionLoading}
                  cancelLoading={cancelLoading}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {payTarget && boothGroupId && (
        <PaymentModal form={payTarget} boothGroupId={boothGroupId} onClose={() => setPayTarget(null)} onSuccess={async () => { setPayTarget(null); await loadData(); }}/>
      )}
    </div>
  );
}